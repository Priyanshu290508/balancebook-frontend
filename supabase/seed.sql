-- =================================================================
-- BALANCEBOOK (दुकान खाता) — Supabase Seed Data
-- 
-- INSTRUCTIONS:
-- 1. Sign up or create your user in the Supabase Dashboard / App.
-- 2. Run this script in the Supabase SQL Editor.
-- 3. This script will find your user:
--    (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1)
--    and attach 10 starter products, 5 purchases, and 5 sales to your user.
-- =================================================================

DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- 1. Fetch your user account (the first registered user)
    SELECT id INTO target_user_id 
    FROM auth.users 
    ORDER BY created_at ASC 
    LIMIT 1;

    -- Safety check: Ensure a user exists
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'No user found in auth.users. Please sign up or create a user in your application or Supabase Auth before running seed.sql!';
    END IF;

    RAISE NOTICE 'Seeding sample data for user ID: %', target_user_id;

    -- 2. Temporarily disable triggers so pre-calculated inventory numbers are preserved
    ALTER TABLE public.purchases DISABLE TRIGGER trg_before_purchase_insert;
    ALTER TABLE public.sales DISABLE TRIGGER trg_before_sale_insert;

    -- 3. Seed 10 Starter Products
    INSERT INTO public.products (id, user_id, name, category, unit, sell_price, avg_cost, stock_qty, low_stock_limit, is_active)
    VALUES
        ('a0000000-0000-0000-0000-000000000001', target_user_id, 'Basmati Rice', 'Grains', 'kg', 60.00, 48.0000, 45.000, 10.000, true),
        ('a0000000-0000-0000-0000-000000000002', target_user_id, 'Arhar Dal (Toor Dal)', 'Pulses', 'kg', 140.00, 115.0000, 28.000, 8.000, true),
        ('a0000000-0000-0000-0000-000000000003', target_user_id, 'Fortune Mustard Oil', 'Cooking Oil', 'L', 165.00, 142.0000, 4.000, 6.000, true),
        ('a0000000-0000-0000-0000-000000000004', target_user_id, 'Tata Salt 1kg', 'Spices & Salt', 'packet', 28.00, 22.5000, 50.000, 15.000, true),
        ('a0000000-0000-0000-0000-000000000005', target_user_id, 'Aashirvaad Atta 5kg', 'Grains', 'packet', 230.00, 195.0000, 18.000, 5.000, true),
        ('a0000000-0000-0000-0000-000000000006', target_user_id, 'Amul Taaza Milk 500ml', 'Dairy', 'packet', 27.00, 24.5000, 12.000, 5.000, true),
        ('a0000000-0000-0000-0000-000000000007', target_user_id, 'MDH Turmeric Powder 100g', 'Spices', 'packet', 38.00, 29.0000, 22.000, 5.000, true),
        ('a0000000-0000-0000-0000-000000000008', target_user_id, 'Sugar Regular', 'Grocery', 'kg', 44.00, 37.0000, 85.000, 20.000, true),
        ('a0000000-0000-0000-0000-000000000009', target_user_id, 'Chana Dal', 'Pulses', 'kg', 92.00, 76.0000, 35.000, 10.000, true),
        ('a0000000-0000-0000-0000-000000000010', target_user_id, 'Maggi 2-Minute Noodles 70g', 'Snacks', 'packet', 14.00, 11.2000, 40.000, 15.000, true)
    ON CONFLICT (id) DO UPDATE 
    SET user_id = EXCLUDED.user_id,
        stock_qty = EXCLUDED.stock_qty,
        avg_cost = EXCLUDED.avg_cost,
        sell_price = EXCLUDED.sell_price;

    -- 4. Seed 5 Starter Purchases
    INSERT INTO public.purchases (id, user_id, product_id, product_name, supplier, qty, cost_per_unit, purchased_at)
    VALUES
        ('b0000000-0000-0000-0000-000000000001', target_user_id, 'a0000000-0000-0000-0000-000000000001', 'Basmati Rice', 'Kisan Mandi', 50.000, 48.00, CURRENT_DATE),
        ('b0000000-0000-0000-0000-000000000002', target_user_id, 'a0000000-0000-0000-0000-000000000002', 'Arhar Dal (Toor Dal)', 'Shree Ganesh Traders', 30.000, 115.00, CURRENT_DATE),
        ('b0000000-0000-0000-0000-000000000003', target_user_id, 'a0000000-0000-0000-0000-000000000003', 'Fortune Mustard Oil', 'Adani Wilmar Dist.', 10.000, 142.00, CURRENT_DATE),
        ('b0000000-0000-0000-0000-000000000004', target_user_id, 'a0000000-0000-0000-0000-000000000004', 'Tata Salt 1kg', 'Tata Consumer Dist.', 60.000, 22.50, CURRENT_DATE),
        ('b0000000-0000-0000-0000-000000000005', target_user_id, 'a0000000-0000-0000-0000-000000000005', 'Aashirvaad Atta 5kg', 'ITC Wholesale Hub', 20.000, 195.00, CURRENT_DATE)
    ON CONFLICT (id) DO UPDATE
    SET user_id = EXCLUDED.user_id;

    -- 5. Seed 5 Starter Sales
    INSERT INTO public.sales (id, user_id, product_id, product_name, qty, sell_per_unit, cost_at_sale, total_sale, profit, sold_at)
    VALUES
        ('c0000000-0000-0000-0000-000000000001', target_user_id, 'a0000000-0000-0000-0000-000000000001', 'Basmati Rice', 5.000, 60.00, 48.0000, 300.00, 60.00, CURRENT_DATE),
        ('c0000000-0000-0000-0000-000000000002', target_user_id, 'a0000000-0000-0000-0000-000000000002', 'Arhar Dal (Toor Dal)', 2.000, 140.00, 115.0000, 280.00, 50.00, CURRENT_DATE),
        ('c0000000-0000-0000-0000-000000000003', target_user_id, 'a0000000-0000-0000-0000-000000000003', 'Fortune Mustard Oil', 6.000, 165.00, 142.0000, 990.00, 138.00, CURRENT_DATE),
        ('c0000000-0000-0000-0000-000000000004', target_user_id, 'a0000000-0000-0000-0000-000000000004', 'Tata Salt 1kg', 10.000, 28.00, 22.5000, 280.00, 55.00, CURRENT_DATE),
        ('c0000000-0000-0000-0000-000000000005', target_user_id, 'a0000000-0000-0000-0000-000000000005', 'Aashirvaad Atta 5kg', 2.000, 230.00, 195.0000, 460.00, 70.00, CURRENT_DATE)
    ON CONFLICT (id) DO UPDATE
    SET user_id = EXCLUDED.user_id;

    -- 6. Re-enable triggers
    ALTER TABLE public.purchases ENABLE TRIGGER trg_before_purchase_insert;
    ALTER TABLE public.sales ENABLE TRIGGER trg_before_sale_insert;

    RAISE NOTICE 'Successfully seeded 10 products, 5 purchases, and 5 sales for user %!', target_user_id;
END $$;
