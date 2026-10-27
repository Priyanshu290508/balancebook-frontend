-- =================================================================
-- BALANCEBOOK (दुकान खाता) — Supabase PostgreSQL Schema & Triggers
-- Complete Migration: Tables, Triggers, Views, Strict RLS & Realtime
-- =================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit TEXT NOT NULL CHECK (unit IN ('kg', 'g', 'L', 'ml', 'pcs', 'packet')),
    sell_price NUMERIC(12,2) NOT NULL CHECK (sell_price >= 0),
    avg_cost NUMERIC(12,4) NOT NULL DEFAULT 0.0000 CHECK (avg_cost >= 0),
    stock_qty NUMERIC(12,3) NOT NULL DEFAULT 0.000 CHECK (stock_qty >= 0),
    low_stock_limit NUMERIC(12,3) NOT NULL DEFAULT 5.000 CHECK (low_stock_limit >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PURCHASES TABLE (Inward Wholesale Stock)
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    product_name TEXT,
    supplier TEXT,
    qty NUMERIC(12,3) NOT NULL CHECK (qty > 0),
    cost_per_unit NUMERIC(12,2) NOT NULL CHECK (cost_per_unit >= 0),
    total_cost NUMERIC(14,2) GENERATED ALWAYS AS (ROUND(qty * cost_per_unit, 2)) STORED,
    purchased_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SALES TABLE (Customer Sales Register)
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    product_name TEXT,
    qty NUMERIC(12,3) NOT NULL CHECK (qty > 0),
    sell_per_unit NUMERIC(12,2) NOT NULL CHECK (sell_per_unit >= 0),
    cost_at_sale NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    total_sale NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    profit NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    sold_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =================================================================
-- TRIGGERS (CORE BUSINESS LOGIC RUNNING IN POSTGRES)
-- SECURITY DEFINER ensures triggers update stock/cost atomically
-- SET search_path = public prevents search-path hijacking
-- =================================================================

-- TRIGGER 0: Set user_id on product insert if omitted or null
CREATE OR REPLACE FUNCTION public.fn_set_product_user_id()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.user_id IS NULL THEN
        NEW.user_id := auth.uid();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_before_product_insert ON public.products;
CREATE TRIGGER trg_before_product_insert
BEFORE INSERT ON public.products
FOR EACH ROW EXECUTE FUNCTION public.fn_set_product_user_id();

-- TRIGGER 1: Purchase Process (Weighted Average Cost & Stock Inward)
CREATE OR REPLACE FUNCTION public.fn_process_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    curr_stock NUMERIC(12,3);
    curr_avg NUMERIC(12,4);
    p_name TEXT;
    new_stock NUMERIC(12,3);
    new_avg NUMERIC(12,4);
BEGIN
    -- Ensure user_id matches authenticated user if not explicitly passed
    IF NEW.user_id IS NULL THEN
        NEW.user_id := auth.uid();
    END IF;

    SELECT stock_qty, avg_cost, name INTO curr_stock, curr_avg, p_name
    FROM public.products
    WHERE id = NEW.product_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Product with ID % not found', NEW.product_id;
    END IF;

    IF NEW.product_name IS NULL OR NEW.product_name = '' THEN
        NEW.product_name := p_name;
    END IF;

    new_stock := curr_stock + NEW.qty;

    IF curr_stock <= 0 THEN
        new_avg := NEW.cost_per_unit;
    ELSE
        new_avg := ((curr_stock * curr_avg) + (NEW.qty * NEW.cost_per_unit)) / new_stock;
    END IF;

    UPDATE public.products
    SET stock_qty = new_stock,
        avg_cost = ROUND(new_avg, 4)
    WHERE id = NEW.product_id;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_before_purchase_insert ON public.purchases;
CREATE TRIGGER trg_before_purchase_insert
BEFORE INSERT ON public.purchases
FOR EACH ROW EXECUTE FUNCTION public.fn_process_purchase();

-- TRIGGER 2: Purchase Delete -> Revert Stock
CREATE OR REPLACE FUNCTION public.fn_revert_purchase_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.products
    SET stock_qty = GREATEST(0, stock_qty - OLD.qty)
    WHERE id = OLD.product_id;

    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_after_purchase_delete ON public.purchases;
CREATE TRIGGER trg_after_purchase_delete
AFTER DELETE ON public.purchases
FOR EACH ROW EXECUTE FUNCTION public.fn_revert_purchase_stock();

-- TRIGGER 3: Sale Process (Validate Stock, Cost Snapshot, Profit Calc, Stock Decrement)
CREATE OR REPLACE FUNCTION public.fn_validate_and_snapshot_sale()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    curr_stock NUMERIC(12,3);
    curr_avg NUMERIC(12,4);
    p_name TEXT;
BEGIN
    -- Ensure user_id matches authenticated user if not explicitly passed
    IF NEW.user_id IS NULL THEN
        NEW.user_id := auth.uid();
    END IF;

    SELECT stock_qty, avg_cost, name INTO curr_stock, curr_avg, p_name
    FROM public.products
    WHERE id = NEW.product_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Product with ID % not found', NEW.product_id;
    END IF;

    IF curr_stock < NEW.qty THEN
        RAISE EXCEPTION 'स्टॉक पर्याप्त नहीं है (Insufficient stock). उपलब्ध: %, मांग: %', curr_stock, NEW.qty;
    END IF;

    IF NEW.product_name IS NULL OR NEW.product_name = '' THEN
        NEW.product_name := p_name;
    END IF;

    NEW.cost_at_sale := curr_avg;
    NEW.total_sale := ROUND(NEW.qty * NEW.sell_per_unit, 2);
    NEW.profit := ROUND((NEW.sell_per_unit - curr_avg) * NEW.qty, 2);

    -- Deduct stock directly inside same atomic transaction
    UPDATE public.products
    SET stock_qty = stock_qty - NEW.qty
    WHERE id = NEW.product_id;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_before_sale_insert ON public.sales;
CREATE TRIGGER trg_before_sale_insert
BEFORE INSERT ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.fn_validate_and_snapshot_sale();

-- TRIGGER 4: Sale Delete -> Restore Stock
CREATE OR REPLACE FUNCTION public.fn_revert_sale_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.products
    SET stock_qty = stock_qty + OLD.qty
    WHERE id = OLD.product_id;

    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_after_sale_delete ON public.sales;
CREATE TRIGGER trg_after_sale_delete
AFTER DELETE ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.fn_revert_sale_stock();

-- =================================================================
-- VIEWS (security_invoker ensures views respect user RLS policies)
-- =================================================================

-- View 1: Product Margins
CREATE OR REPLACE VIEW public.v_product_margin 
WITH (security_invoker = true) AS
SELECT 
    p.id,
    p.user_id,
    p.name,
    p.category,
    p.unit,
    p.stock_qty,
    p.avg_cost,
    p.sell_price,
    ROUND(p.sell_price - p.avg_cost, 2) AS margin_amount,
    CASE 
        WHEN p.avg_cost > 0 THEN ROUND(((p.sell_price - p.avg_cost) / p.avg_cost) * 100, 2)
        ELSE 0.00
    END AS margin_pct,
    p.low_stock_limit,
    (p.stock_qty <= p.low_stock_limit) AS is_low_stock
FROM public.products p
WHERE p.is_active = TRUE;

-- View 2: Daily Summary
CREATE OR REPLACE VIEW public.v_daily_summary 
WITH (security_invoker = true) AS
SELECT 
    s.user_id,
    s.sold_at AS summary_date,
    COALESCE(SUM(s.total_sale), 0.00) AS total_sales,
    COALESCE(SUM(s.profit), 0.00) AS total_profit,
    COUNT(s.id) AS sales_count
FROM public.sales s
GROUP BY s.user_id, s.sold_at;

-- View 3: Low Stock Alert View
CREATE OR REPLACE VIEW public.v_low_stock 
WITH (security_invoker = true) AS
SELECT 
    p.id,
    p.user_id,
    p.name,
    p.category,
    p.unit,
    p.stock_qty,
    p.low_stock_limit
FROM public.products p
WHERE p.is_active = TRUE AND p.stock_qty <= p.low_stock_limit;

-- =================================================================
-- ROW LEVEL SECURITY (RLS)
-- Strict isolation: Authenticated users can ONLY access their own rows.
-- Anonymous / unauthenticated access is completely disallowed.
-- =================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Clean up any legacy or existing policies
DROP POLICY IF EXISTS "Manage products policy" ON public.products;
DROP POLICY IF EXISTS "Manage purchases policy" ON public.purchases;
DROP POLICY IF EXISTS "Manage sales policy" ON public.sales;
DROP POLICY IF EXISTS "Users can manage products" ON public.products;
DROP POLICY IF EXISTS "Users can manage purchases" ON public.purchases;
DROP POLICY IF EXISTS "Users can manage sales" ON public.sales;
DROP POLICY IF EXISTS "Users can manage their own products" ON public.products;
DROP POLICY IF EXISTS "Users can manage their own purchases" ON public.purchases;
DROP POLICY IF EXISTS "Users can manage their own sales" ON public.sales;

-- 1. Products Policy
CREATE POLICY "Users can manage products"
    ON public.products FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2. Purchases Policy
CREATE POLICY "Users can manage purchases"
    ON public.purchases FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. Sales Policy
CREATE POLICY "Users can manage sales"
    ON public.sales FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =================================================================
-- REALTIME REPLICATION (Enables instant dashboard sync without refresh)
-- =================================================================
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.purchases;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sales;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
