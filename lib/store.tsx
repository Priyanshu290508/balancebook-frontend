"use client"

import * as React from "react"
import {
  ProductItem,
  PurchaseRecord,
  SaleRecord,
  formatItemNameByLang,
  formatCategoryByLang,
} from "./calc"
import { supabase, isSupabaseConfigured } from "./supabase/client"
import { useAuth } from "./auth"

export function getTodayDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

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
  deleteProduct: (id: string) => Promise<void>
  resetToDefault: () => void
  refreshData: () => Promise<void>
  metrics: {
    totalProducts: number
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
  const { user } = useAuth()
  const [products, setProducts] = React.useState<ProductItem[]>([])
  const [purchases, setPurchases] = React.useState<PurchaseRecord[]>([])
  const [sales, setSales] = React.useState<SaleRecord[]>([])
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [isRealtime, setIsRealtime] = React.useState<boolean>(false)

  // LOAD DATA DIRECTLY FROM SUPABASE POSTGRES FOR THE CURRENT USER
  const loadData = React.useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !user) {
      if (!user) {
        setProducts([])
        setPurchases([])
        setSales([])
      }
      return
    }

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

      if (prodRes.error) {
        console.error("Supabase products fetch error:", prodRes.error)
      } else if (prodRes.data) {
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

      if (purRes.error) {
        console.error("Supabase purchases fetch error:", purRes.error)
      } else if (purRes.data) {
        setPurchases(
          purRes.data.map((p: any) => {
            const matchedProduct = prodRes.data?.find((x: any) => x.id === p.product_id)
            const resolvedName = p.product_name || matchedProduct?.name || "सामान"
            return {
              id: p.id,
              product_id: p.product_id,
              product_name: formatItemNameByLang(resolvedName, "en"),
              supplier: p.supplier || undefined,
              qty: Number(p.qty),
              cost_per_unit: Number(p.cost_per_unit),
              total_cost: Number(p.total_cost ?? (Number(p.qty) * Number(p.cost_per_unit))),
              purchased_at: p.purchased_at,
              created_at: p.created_at,
            }
          })
        )
      }

      if (saleRes.error) {
        console.error("Supabase sales fetch error:", saleRes.error)
      } else if (saleRes.data) {
        setSales(
          saleRes.data.map((s: any) => {
            const matchedProduct = prodRes.data?.find((x: any) => x.id === s.product_id)
            const resolvedName = s.product_name || matchedProduct?.name || "सामान"
            return {
              id: s.id,
              product_id: s.product_id,
              product_name: formatItemNameByLang(resolvedName, "en"),
              qty: Number(s.qty),
              sell_per_unit: Number(s.sell_per_unit),
              cost_at_sale: Number(s.cost_at_sale),
              total_sale: Number(s.total_sale),
              profit: Number(s.profit),
              sold_at: s.sold_at,
              created_at: s.created_at,
            }
          })
        )
      }
    } catch (err) {
      console.error("Supabase data fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // SUPABASE REALTIME SUBSCRIPTION (Instant sync without page reload)
  React.useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !user) return

    loadData()

    const channel = supabase
      .channel("retail-store-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          loadData()
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "purchases" },
        () => {
          loadData()
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sales" },
        () => {
          loadData()
        }
      )
      .subscribe((status) => {
        setIsRealtime(status === "SUBSCRIBED")
      })

    return () => {
      supabase?.removeChannel(channel)
    }
  }, [loadData, user])

  // CREATE PRODUCT
  const addProduct = React.useCallback(
    async (data: Omit<ProductItem, "id" | "is_active">): Promise<ProductItem> => {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error("Supabase is not configured.")
      }
      if (!user) {
        throw new Error("कृपया पहले लॉगिन करें (Please log in to add products)")
      }

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
            user_id: user.id,
          },
        ])
        .select()
        .single()

      if (error) {
        throw new Error(error.message || "Failed to create product in Supabase")
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
      await loadData()
      return formatted
    },
    [user, loadData]
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
      if (!isSupabaseConfigured || !supabase) {
        throw new Error("Supabase is not configured.")
      }
      if (!user) {
        throw new Error("कृपया पहले लॉगिन करें (Please log in to record purchases)")
      }

      const product = products.find((p) => p.id === data.product_id)
      if (!product) throw new Error("सामान नहीं मिला (Product not found)")

      const { data: inserted, error } = await supabase
        .from("purchases")
        .insert([
          {
            product_id: data.product_id,
            qty: data.qty,
            cost_per_unit: data.cost_per_unit,
            supplier: data.supplier || null,
            purchased_at: data.purchased_at,
            user_id: user.id,
          },
        ])
        .select()
        .single()

      if (error) {
        throw new Error(error.message || "Failed to record purchase in Supabase")
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
    [products, user, loadData]
  )

  // ADD SALE (Database Trigger 3 validates stock, snapshots cost, calculates profit)
  const addSale = React.useCallback(
    async (data: {
      product_id: string
      qty: number
      sell_per_unit: number
      sold_at: string
    }): Promise<SaleRecord> => {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error("Supabase is not configured.")
      }
      if (!user) {
        throw new Error("कृपया पहले लॉगिन करें (Please log in to record sales)")
      }

      const product = products.find((p) => p.id === data.product_id)
      if (!product) throw new Error("सामान नहीं मिला (Product not found)")

      if (product.stock_qty < data.qty) {
        throw new Error(
          `स्टॉक पर्याप्त नहीं है! उपलब्ध: ${product.stock_qty} ${product.unit}, दर्ज की गई मात्रा: ${data.qty}`
        )
      }

      const { data: inserted, error } = await supabase
        .from("sales")
        .insert([
          {
            product_id: data.product_id,
            qty: data.qty,
            sell_per_unit: data.sell_per_unit,
            sold_at: data.sold_at,
            user_id: user.id,
          },
        ])
        .select()
        .single()

      if (error) {
        throw new Error(error.message || "Failed to record sale in Supabase")
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
    [products, user, loadData]
  )

  // DELETE SALE (Database Trigger 4 restores stock in Supabase automatically)
  const deleteSale = React.useCallback(
    async (id: string): Promise<void> => {
      if (!isSupabaseConfigured || !supabase || !user) return

      const { error } = await supabase
        .from("sales")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) {
        throw new Error(error.message || "Failed to delete sale")
      }

      await loadData()
    },
    [user, loadData]
  )

  // DELETE PURCHASE (Database Trigger 2 reduces stock automatically)
  const deletePurchase = React.useCallback(
    async (id: string): Promise<void> => {
      if (!isSupabaseConfigured || !supabase || !user) return

      const { error } = await supabase
        .from("purchases")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) {
        throw new Error(error.message || "Failed to delete purchase")
      }

      await loadData()
    },
    [user, loadData]
  )

  // DELETE PRODUCT
  const deleteProduct = React.useCallback(
    async (id: string): Promise<void> => {
      if (!isSupabaseConfigured || !supabase || !user) return

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) {
        throw new Error(error.message || "Failed to delete product")
      }

      await loadData()
    },
    [user, loadData]
  )

  const resetToDefault = React.useCallback(() => {
    loadData()
  }, [loadData])

  // DERIVED METRICS FOR DASHBOARD (All calculated directly from real Supabase rows)
  const metrics = React.useMemo(() => {
    const today = getTodayDate()
    const currentMonth = today.substring(0, 7) // "YYYY-MM"

    // Today's Sales
    const todaySalesRecords = sales.filter((s) => s.sold_at === today)
    const todaySales = todaySalesRecords.reduce((acc, curr) => acc + curr.total_sale, 0)
    const todayProfit = todaySalesRecords.reduce((acc, curr) => acc + curr.profit, 0)

    // Month's Profit
    const monthSalesRecords = sales.filter((s) => s.sold_at && s.sold_at.startsWith(currentMonth))
    const monthProfit = monthSalesRecords.reduce((acc, curr) => acc + curr.profit, 0)

    // Today's Purchases
    const todayPurchasesRecords = purchases.filter((p) => p.purchased_at === today)
    const todayPurchases = todayPurchasesRecords.reduce((acc, curr) => acc + curr.total_cost, 0)

    // Low stock items
    const lowStockProducts = products.filter((p) => p.stock_qty <= p.low_stock_limit)
    const lowStockCount = lowStockProducts.length

    // Top Profit Products
    const profitMap = new Map<string, { name: string; profit: number; sales: number }>()
    sales.forEach((s) => {
      const existing = profitMap.get(s.product_id) || {
        name: s.product_name ?? products.find((p) => p.id === s.product_id)?.name ?? "Unknown",
        profit: 0,
        sales: 0,
      }
      existing.profit += s.profit
      existing.sales += s.total_sale
      profitMap.set(s.product_id, existing)
    })

    const topProfitProducts = Array.from(profitMap.values())
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5)

    return {
      totalProducts: products.length,
      todaySales,
      todayProfit,
      monthProfit,
      todayPurchases,
      lowStockCount,
      lowStockProducts,
      topProfitProducts,
    }
  }, [sales, purchases, products])

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
        deleteProduct,
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
