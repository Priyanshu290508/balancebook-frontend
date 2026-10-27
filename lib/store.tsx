"use client"

import * as React from "react"
import {
  ProductItem,
  PurchaseRecord,
  SaleRecord,
  calculateWeightedAverage,
  calculateSaleProfit,
  formatItemNameByLang,
  formatCategoryByLang,
} from "./calc"
import { supabase, isSupabaseConfigured } from "./supabase/client"

// Fallback seed items for initial render when Supabase keys are not yet added
const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    name: "Basmati Rice",
    category: "Grains",
    unit: "kg",
    sell_price: 60.0,
    avg_cost: 48.0,
    stock_qty: 45.0,
    low_stock_limit: 10.0,
    is_active: true,
  },
  {
    id: "a0000000-0000-0000-0000-000000000002",
    name: "Arhar Dal (Toor Dal)",
    category: "Pulses",
    unit: "kg",
    sell_price: 140.0,
    avg_cost: 115.0,
    stock_qty: 28.0,
    low_stock_limit: 8.0,
    is_active: true,
  },
  {
    id: "a0000000-0000-0000-0000-000000000003",
    name: "Fortune Mustard Oil",
    category: "Cooking Oil",
    unit: "L",
    sell_price: 165.0,
    avg_cost: 142.0,
    stock_qty: 4.0, // Low stock alert
    low_stock_limit: 6.0,
    is_active: true,
  },
  {
    id: "a0000000-0000-0000-0000-000000000004",
    name: "Tata Salt 1kg",
    category: "Spices & Salt",
    unit: "packet",
    sell_price: 28.0,
    avg_cost: 22.5,
    stock_qty: 50.0,
    low_stock_limit: 15.0,
    is_active: true,
  },
  {
    id: "a0000000-0000-0000-0000-000000000005",
    name: "Aashirvaad Atta 5kg",
    category: "Grains",
    unit: "packet",
    sell_price: 230.0,
    avg_cost: 195.0,
    stock_qty: 18.0,
    low_stock_limit: 5.0,
    is_active: true,
  },
  {
    id: "a0000000-0000-0000-0000-000000000006",
    name: "Amul Taaza Milk 500ml",
    category: "Dairy",
    unit: "packet",
    sell_price: 27.0,
    avg_cost: 24.5,
    stock_qty: 12.0,
    low_stock_limit: 5.0,
    is_active: true,
  },
  {
    id: "a0000000-0000-0000-0000-000000000007",
    name: "MDH Turmeric Powder 100g",
    category: "Spices",
    unit: "packet",
    sell_price: 38.0,
    avg_cost: 29.0,
    stock_qty: 22.0,
    low_stock_limit: 5.0,
    is_active: true,
  },
  {
    id: "a0000000-0000-0000-0000-000000000008",
    name: "Sugar Regular",
    category: "Grocery",
    unit: "kg",
    sell_price: 44.0,
    avg_cost: 37.0,
    stock_qty: 85.0,
    low_stock_limit: 20.0,
    is_active: true,
  },
]

const INITIAL_DATE = new Date().toISOString().split("T")[0]

const INITIAL_PURCHASES: PurchaseRecord[] = [
  {
    id: "b0000000-0000-0000-0000-000000000001",
    product_id: "a0000000-0000-0000-0000-000000000001",
    product_name: "Basmati Rice",
    qty: 50,
    cost_per_unit: 48,
    total_cost: 2400,
    supplier: "Kisan Mandi",
    purchased_at: INITIAL_DATE,
    created_at: new Date().toISOString(),
  },
  {
    id: "b0000000-0000-0000-0000-000000000002",
    product_id: "a0000000-0000-0000-0000-000000000002",
    product_name: "Arhar Dal (Toor Dal)",
    qty: 30,
    cost_per_unit: 115,
    total_cost: 3450,
    supplier: "Shree Ganesh Traders",
    purchased_at: INITIAL_DATE,
    created_at: new Date().toISOString(),
  },
  {
    id: "b0000000-0000-0000-0000-000000000003",
    product_id: "a0000000-0000-0000-0000-000000000003",
    product_name: "Fortune Mustard Oil",
    qty: 10,
    cost_per_unit: 142,
    total_cost: 1420,
    supplier: "Adani Wilmar Dist.",
    purchased_at: INITIAL_DATE,
    created_at: new Date().toISOString(),
  },
]

const INITIAL_SALES: SaleRecord[] = [
  {
    id: "c0000000-0000-0000-0000-000000000001",
    product_id: "a0000000-0000-0000-0000-000000000001",
    product_name: "Basmati Rice",
    qty: 5,
    sell_per_unit: 60,
    cost_at_sale: 48,
    total_sale: 300,
    profit: 60,
    sold_at: INITIAL_DATE,
    created_at: new Date().toISOString(),
  },
  {
    id: "c0000000-0000-0000-0000-000000000002",
    product_id: "a0000000-0000-0000-0000-000000000002",
    product_name: "Arhar Dal (Toor Dal)",
    qty: 2,
    sell_per_unit: 140,
    cost_at_sale: 115,
    total_sale: 280,
    profit: 50,
    sold_at: INITIAL_DATE,
    created_at: new Date().toISOString(),
  },
]

interface StoreContextType {
  products: ProductItem[]
  purchases: PurchaseRecord[]
  sales: SaleRecord[]
  isLoading: boolean
  isRealtime: boolean
  isSupabase: boolean
  addProduct: (product: Omit<ProductItem, "id" | "is_active">) => Promise<ProductItem>
  addPurchase: (data: {
    product_id: string
    qty: number
    cost_per_unit: number
    supplier?: string
    purchased_at: string
  }) => Promise<PurchaseRecord>
  addSale: (data: {
    product_id: string
    qty: number
    sell_per_unit: number
    sold_at: string
  }) => Promise<SaleRecord>
  deleteSale: (id: string) => Promise<void>
  deletePurchase: (id: string) => Promise<void>
  resetToDefault: () => void
  refreshData: () => Promise<void>
  metrics: {
    todaySales: number
    todayProfit: number
    monthProfit: number
    todayPurchases: number
    lowStockCount: number
    lowStockProducts: ProductItem[]
    topProfitProducts: { name: string; profit: number; sales: number }[]
  }
}

const StoreContext = React.createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = React.useState<ProductItem[]>(INITIAL_PRODUCTS)
  const [purchases, setPurchases] = React.useState<PurchaseRecord[]>(INITIAL_PURCHASES)
  const [sales, setSales] = React.useState<SaleRecord[]>(INITIAL_SALES)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [isRealtime, setIsRealtime] = React.useState<boolean>(false)
  const [todayDate, setTodayDate] = React.useState(INITIAL_DATE)

  React.useEffect(() => {
    setTodayDate(new Date().toISOString().split("T")[0])
  }, [])

  // LOAD DATA DIRECTLY FROM SUPABASE POSTGRES
  const loadData = React.useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return

    try {
      setIsLoading(true)
      const [prodRes, purRes, saleRes] = await Promise.all([
        supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("purchases")
          .select("*")
          .order("purchased_at", { ascending: false }),
        supabase
          .from("sales")
          .select("*")
          .order("sold_at", { ascending: false }),
      ])

      if (prodRes.data && prodRes.data.length > 0) {
        setProducts(
          prodRes.data.map((p: any) => ({
            id: p.id,
            name: formatItemNameByLang(p.name, "en"),
            category: formatCategoryByLang(p.category, "en"),
            unit: p.unit,
            sell_price: Number(p.sell_price),
            avg_cost: Number(p.avg_cost),
            stock_qty: Number(p.stock_qty),
            low_stock_limit: Number(p.low_stock_limit),
            is_active: p.is_active,
          }))
        )
      }

      if (purRes.data) {
        setPurchases(
          purRes.data.map((p: any) => ({
            id: p.id,
            product_id: p.product_id,
            product_name: formatItemNameByLang(p.product_name || "सामान", "en"),
            supplier: p.supplier || undefined,
            qty: Number(p.qty),
            cost_per_unit: Number(p.cost_per_unit),
            total_cost: Number(p.total_cost),
            purchased_at: p.purchased_at,
            created_at: p.created_at,
          }))
        )
      }

      if (saleRes.data) {
        setSales(
          saleRes.data.map((s: any) => ({
            id: s.id,
            product_id: s.product_id,
            product_name: formatItemNameByLang(s.product_name || "सामान", "en"),
            qty: Number(s.qty),
            sell_per_unit: Number(s.sell_per_unit),
            cost_at_sale: Number(s.cost_at_sale),
            total_sale: Number(s.total_sale),
            profit: Number(s.profit),
            sold_at: s.sold_at,
            created_at: s.created_at,
          }))
        )
      }
    } catch (err) {
      console.error("Supabase data fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // SUPABASE REALTIME SUBSCRIPTION (Instant sync without page reload)
  React.useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return

    loadData()

    const channel = supabase
      .channel("balancebook-realtime-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => loadData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "purchases" },
        () => loadData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sales" },
        () => loadData()
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsRealtime(true)
        }
      })

    return () => {
      supabase?.removeChannel(channel)
    }
  }, [loadData])

  // ADD PRODUCT (Direct Supabase Insert)
  const addProduct = React.useCallback(
    async (data: Omit<ProductItem, "id" | "is_active">): Promise<ProductItem> => {
      if (!isSupabaseConfigured || !supabase) {
        const localProduct: ProductItem = {
          ...data,
          id: `prod_${Date.now()}`,
          is_active: true,
        }
        setProducts((prev) => [localProduct, ...prev])
        return localProduct
      }

      const { data: userAuth } = await supabase.auth.getUser()
      const { data: inserted, error } = await supabase
        .from("products")
        .insert([
          {
            name: data.name.trim(),
            category: data.category,
            unit: data.unit,
            sell_price: Number(data.sell_price),
            avg_cost: Number(data.avg_cost) || 0,
            stock_qty: Number(data.stock_qty) || 0,
            low_stock_limit: Number(data.low_stock_limit) || 5,
            is_active: true,
            user_id: userAuth?.user?.id || null,
          },
        ])
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      const formatted: ProductItem = {
        id: inserted.id,
        name: inserted.name,
        category: inserted.category,
        unit: inserted.unit,
        sell_price: Number(inserted.sell_price),
        avg_cost: Number(inserted.avg_cost),
        stock_qty: Number(inserted.stock_qty),
        low_stock_limit: Number(inserted.low_stock_limit),
        is_active: inserted.is_active,
      }

      setProducts((prev) => [formatted, ...prev])
      return formatted
    },
    []
  )

  // ADD PURCHASE (Database Trigger 1 updates stock & weighted avg in Supabase)
  const addPurchase = React.useCallback(
    async (data: {
      product_id: string
      qty: number
      cost_per_unit: number
      supplier?: string
      purchased_at: string
    }): Promise<PurchaseRecord> => {
      const product = products.find((p) => p.id === data.product_id)
      if (!product) throw new Error("सामान नहीं मिला (Product not found)")

      if (!isSupabaseConfigured || !supabase) {
        const { newStock, newAvgCost } = calculateWeightedAverage(
          product.stock_qty,
          product.avg_cost,
          data.qty,
          data.cost_per_unit
        )
        setProducts((prev) =>
          prev.map((p) =>
            p.id === data.product_id
              ? { ...p, stock_qty: newStock, avg_cost: newAvgCost }
              : p
          )
        )
        const total_cost = Math.round(data.qty * data.cost_per_unit * 100) / 100
        const localPurchase: PurchaseRecord = {
          id: `pur_${Date.now()}`,
          product_id: data.product_id,
          product_name: product.name,
          supplier: data.supplier,
          qty: data.qty,
          cost_per_unit: data.cost_per_unit,
          total_cost,
          purchased_at: data.purchased_at,
          created_at: new Date().toISOString(),
        }
        setPurchases((prev) => [localPurchase, ...prev])
        return localPurchase
      }

      const { data: userAuth } = await supabase.auth.getUser()
      const { data: inserted, error } = await supabase
        .from("purchases")
        .insert([
          {
            product_id: data.product_id,
            product_name: product.name,
            qty: data.qty,
            cost_per_unit: data.cost_per_unit,
            supplier: data.supplier || null,
            purchased_at: data.purchased_at,
            user_id: userAuth?.user?.id || null,
          },
        ])
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      const formatted: PurchaseRecord = {
        id: inserted.id,
        product_id: inserted.product_id,
        product_name: inserted.product_name || product.name,
        supplier: inserted.supplier || undefined,
        qty: Number(inserted.qty),
        cost_per_unit: Number(inserted.cost_per_unit),
        total_cost: Number(inserted.total_cost),
        purchased_at: inserted.purchased_at,
        created_at: inserted.created_at,
      }

      setPurchases((prev) => [formatted, ...prev])
      await loadData()
      return formatted
    },
    [products, loadData]
  )

  // ADD SALE (Database Trigger 2 validates stock, snapshots cost, calculates profit)
  const addSale = React.useCallback(
    async (data: {
      product_id: string
      qty: number
      sell_per_unit: number
      sold_at: string
    }): Promise<SaleRecord> => {
      const product = products.find((p) => p.id === data.product_id)
      if (!product) throw new Error("सामान नहीं मिला (Product not found)")

      if (product.stock_qty < data.qty) {
        throw new Error(
          `स्टॉक पर्याप्त नहीं है! उपलब्ध: ${product.stock_qty} ${product.unit}, दर्ज की गई मात्रा: ${data.qty}`
        )
      }

      if (!isSupabaseConfigured || !supabase) {
        const cost_at_sale = product.avg_cost
        const { totalSale, profit } = calculateSaleProfit(
          data.qty,
          data.sell_per_unit,
          cost_at_sale
        )
        const updatedStock = Math.max(0, product.stock_qty - data.qty)
        setProducts((prev) =>
          prev.map((p) =>
            p.id === data.product_id ? { ...p, stock_qty: updatedStock } : p
          )
        )
        const localSale: SaleRecord = {
          id: `sale_${Date.now()}`,
          product_id: data.product_id,
          product_name: product.name,
          qty: data.qty,
          sell_per_unit: data.sell_per_unit,
          cost_at_sale,
          total_sale: totalSale,
          profit,
          sold_at: data.sold_at,
          created_at: new Date().toISOString(),
        }
        setSales((prev) => [localSale, ...prev])
        return localSale
      }

      const { data: userAuth } = await supabase.auth.getUser()
      const { data: inserted, error } = await supabase
        .from("sales")
        .insert([
          {
            product_id: data.product_id,
            product_name: product.name,
            qty: data.qty,
            sell_per_unit: data.sell_per_unit,
            sold_at: data.sold_at,
            user_id: userAuth?.user?.id || null,
          },
        ])
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      const formatted: SaleRecord = {
        id: inserted.id,
        product_id: inserted.product_id,
        product_name: inserted.product_name || product.name,
        qty: Number(inserted.qty),
        sell_per_unit: Number(inserted.sell_per_unit),
        cost_at_sale: Number(inserted.cost_at_sale),
        total_sale: Number(inserted.total_sale),
        profit: Number(inserted.profit),
        sold_at: inserted.sold_at,
        created_at: inserted.created_at,
      }

      setSales((prev) => [formatted, ...prev])
      await loadData()
      return formatted
    },
    [products, loadData]
  )

  // DELETE SALE (Database Trigger 4 restores stock in Supabase automatically)
  const deleteSale = React.useCallback(
    async (id: string): Promise<void> => {
      if (!isSupabaseConfigured || !supabase) {
        const sale = sales.find((s) => s.id === id)
        if (sale) {
          setProducts((prev) =>
            prev.map((p) =>
              p.id === sale.product_id
                ? { ...p, stock_qty: p.stock_qty + sale.qty }
                : p
            )
          )
          setSales((prev) => prev.filter((s) => s.id !== id))
        }
        return
      }

      const { error } = await supabase.from("sales").delete().eq("id", id)
      if (error) {
        throw new Error(error.message)
      }

      setSales((prev) => prev.filter((s) => s.id !== id))
      await loadData()
    },
    [sales, loadData]
  )

  // DELETE PURCHASE (Database Trigger 2 reverts stock in Supabase automatically)
  const deletePurchase = React.useCallback(
    async (id: string): Promise<void> => {
      if (!isSupabaseConfigured || !supabase) {
        const purchase = purchases.find((p) => p.id === id)
        if (purchase) {
          setProducts((prev) =>
            prev.map((p) =>
              p.id === purchase.product_id
                ? { ...p, stock_qty: Math.max(0, p.stock_qty - purchase.qty) }
                : p
            )
          )
          setPurchases((prev) => prev.filter((p) => p.id !== id))
        }
        return
      }

      const { error } = await supabase.from("purchases").delete().eq("id", id)
      if (error) {
        throw new Error(error.message)
      }

      setPurchases((prev) => prev.filter((p) => p.id !== id))
      await loadData()
    },
    [purchases, loadData]
  )

  const resetToDefault = React.useCallback(() => {
    setProducts(INITIAL_PRODUCTS)
    setPurchases(INITIAL_PURCHASES)
    setSales(INITIAL_SALES)
  }, [])

  // FINANCIAL & INVENTORY METRICS
  const metrics = React.useMemo(() => {
    const today = todayDate
    const currentMonth = today.slice(0, 7)

    let todaySales = 0
    let todayProfit = 0
    let monthProfit = 0
    let todayPurchases = 0

    const productProfitMap: Record<string, { name: string; profit: number; sales: number }> = {}

    sales.forEach((s) => {
      if (s.sold_at === today) {
        todaySales += s.total_sale
        todayProfit += s.profit
      }
      if (s.sold_at.startsWith(currentMonth)) {
        monthProfit += s.profit
      }

      if (!productProfitMap[s.product_id]) {
        productProfitMap[s.product_id] = {
          name: s.product_name || "सामान",
          profit: 0,
          sales: 0,
        }
      }
      productProfitMap[s.product_id].profit += s.profit
      productProfitMap[s.product_id].sales += s.total_sale
    })

    purchases.forEach((p) => {
      if (p.purchased_at === today) {
        todayPurchases += p.total_cost
      }
    })

    const lowStockProducts = products.filter(
      (p) => p.is_active && p.stock_qty <= p.low_stock_limit
    )

    const topProfitProducts = Object.values(productProfitMap)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5)

    return {
      todaySales: Math.round(todaySales * 100) / 100,
      todayProfit: Math.round(todayProfit * 100) / 100,
      monthProfit: Math.round(monthProfit * 100) / 100,
      todayPurchases: Math.round(todayPurchases * 100) / 100,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      topProfitProducts,
    }
  }, [products, purchases, sales, todayDate])

  return (
    <StoreContext.Provider
      value={{
        products,
        purchases,
        sales,
        isLoading,
        isRealtime,
        isSupabase: isSupabaseConfigured,
        addProduct,
        addPurchase,
        addSale,
        deleteSale,
        deletePurchase,
        resetToDefault,
        refreshData: loadData,
        metrics,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = React.useContext(StoreContext)
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider")
  }
  return context
}
