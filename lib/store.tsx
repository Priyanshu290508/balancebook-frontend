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

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: "p-1",
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
    id: "p-2",
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
    id: "p-3",
    name: "Fortune Mustard Oil",
    category: "Cooking Oil",
    unit: "L",
    sell_price: 165.0,
    avg_cost: 142.0,
    stock_qty: 4.0, // Low stock
    low_stock_limit: 6.0,
    is_active: true,
  },
  {
    id: "p-4",
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
    id: "p-5",
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
    id: "p-6",
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
    id: "p-7",
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
    id: "p-8",
    name: "Sugar Regular",
    category: "Grocery",
    unit: "kg",
    sell_price: 44.0,
    avg_cost: 37.0,
    stock_qty: 85.0,
    low_stock_limit: 20.0,
    is_active: true,
  },
  {
    id: "p-9",
    name: "Parle-G Biscuit 100g",
    category: "Snacks",
    unit: "packet",
    sell_price: 10.0,
    avg_cost: 8.2,
    stock_qty: 60.0,
    low_stock_limit: 15.0,
    is_active: true,
  },
  {
    id: "p-10",
    name: "Rajdhani Besan 500g",
    category: "Pulses",
    unit: "packet",
    sell_price: 55.0,
    avg_cost: 46.0,
    stock_qty: 3.0, // Low stock
    low_stock_limit: 6.0,
    is_active: true,
  },
]

const INITIAL_DATE = "2026-10-25"

const INITIAL_PURCHASES: PurchaseRecord[] = [
  {
    id: "pur-1",
    product_id: "p-1",
    product_name: "Basmati Rice",
    supplier: "Kisan Mandi Traders",
    qty: 50,
    cost_per_unit: 48,
    total_cost: 2400,
    purchased_at: INITIAL_DATE,
    created_at: "2026-10-25T10:00:00.000Z",
  },
  {
    id: "pur-2",
    product_id: "p-2",
    product_name: "Arhar Dal (Toor Dal)",
    supplier: "Agrawal Wholesale",
    qty: 30,
    cost_per_unit: 115,
    total_cost: 3450,
    purchased_at: INITIAL_DATE,
    created_at: "2026-10-25T10:30:00.000Z",
  },
]

const INITIAL_SALES: SaleRecord[] = [
  {
    id: "sale-1",
    product_id: "p-1",
    product_name: "Basmati Rice",
    qty: 5,
    sell_per_unit: 60,
    cost_at_sale: 48,
    total_sale: 300,
    profit: 60,
    sold_at: INITIAL_DATE,
    created_at: "2026-10-25T11:00:00.000Z",
  },
  {
    id: "sale-2",
    product_id: "p-2",
    product_name: "Arhar Dal (Toor Dal)",
    qty: 2,
    sell_per_unit: 140,
    cost_at_sale: 115,
    total_sale: 280,
    profit: 50,
    sold_at: INITIAL_DATE,
    created_at: "2026-10-25T11:30:00.000Z",
  },
]

interface StoreContextType {
  products: ProductItem[]
  purchases: PurchaseRecord[]
  sales: SaleRecord[]
  addProduct: (product: Omit<ProductItem, "id" | "is_active">) => ProductItem
  addPurchase: (data: {
    product_id: string
    qty: number
    cost_per_unit: number
    supplier?: string
    purchased_at: string
  }) => PurchaseRecord
  addSale: (data: {
    product_id: string
    qty: number
    sell_per_unit: number
    sold_at: string
  }) => SaleRecord
  deleteSale: (id: string) => void
  deletePurchase: (id: string) => void
  resetToDefault: () => void
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
  const [isInitialized, setIsInitialized] = React.useState(false)

  // Load from localStorage & backend on client mount
  React.useEffect(() => {
    try {
      const savedProducts =
        localStorage.getItem("balancebook_products") ||
        localStorage.getItem("dukan_khata_products")
      const savedPurchases =
        localStorage.getItem("balancebook_purchases") ||
        localStorage.getItem("dukan_khata_purchases")
      const savedSales =
        localStorage.getItem("balancebook_sales") ||
        localStorage.getItem("dukan_khata_sales")

      if (savedProducts) {
        const parsed = JSON.parse(savedProducts)
        setProducts(
          parsed.map((p: any) => ({
            ...p,
            name: formatItemNameByLang(p.name, "en"),
            category: formatCategoryByLang(p.category, "en"),
          }))
        )
      }
      if (savedPurchases) {
        const parsed = JSON.parse(savedPurchases)
        setPurchases(
          parsed.map((p: any) => ({
            ...p,
            product_name: formatItemNameByLang(p.product_name, "en"),
          }))
        )
      }
      if (savedSales) {
        const parsed = JSON.parse(savedSales)
        setSales(
          parsed.map((s: any) => ({
            ...s,
            product_name: formatItemNameByLang(s.product_name, "en"),
          }))
        )
      }
    } catch (e) {
      console.warn("Could not load from localStorage:", e)
    } finally {
      setIsInitialized(true)
    }

    // Background sync with backend API
    const syncBackend = async () => {
      try {
        const [prodRes, purRes, saleRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/purchases"),
          fetch("/api/sales"),
        ])

        if (prodRes.ok) {
          const prodData = await prodRes.json()
          if (prodData.success && prodData.data?.length > 0) {
            setProducts(prodData.data)
          }
        }
        if (purRes.ok) {
          const purData = await purRes.json()
          if (purData.success && purData.data?.length > 0) {
            setPurchases(purData.data)
          }
        }
        if (saleRes.ok) {
          const saleData = await saleRes.json()
          if (saleData.success && saleData.data?.length > 0) {
            setSales(saleData.data)
          }
        }
      } catch (err) {
        // Safe offline / dev fallback
        console.debug("Backend sync skipped (offline or initial boot):", err)
      }
    }

    syncBackend()
  }, [])

  // Save to localStorage when state changes
  React.useEffect(() => {
    if (!isInitialized) return
    try {
      localStorage.setItem("balancebook_products", JSON.stringify(products))
      localStorage.setItem("balancebook_purchases", JSON.stringify(purchases))
      localStorage.setItem("balancebook_sales", JSON.stringify(sales))
    } catch (e) {
      console.warn("Could not save to localStorage:", e)
    }
  }, [products, purchases, sales, isInitialized])

  // ADD PRODUCT (Optimistic + Backend API)
  const addProduct = React.useCallback(
    (data: Omit<ProductItem, "id" | "is_active">) => {
      const newProduct: ProductItem = {
        ...data,
        id: `p-${Date.now()}`,
        is_active: true,
      }
      setProducts((prev) => [newProduct, ...prev])

      // Sync to backend asynchronously
      fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success && resData.data?.id) {
            // Replace temporary ID with server ID if needed
            setProducts((prev) =>
              prev.map((p) => (p.id === newProduct.id ? resData.data : p))
            )
          }
        })
        .catch((err) => console.warn("Backend product sync error:", err))

      return newProduct
    },
    []
  )

  // ADD PURCHASE (Implements DB Trigger 1 logic + Backend API)
  const addPurchase = React.useCallback(
    (data: {
      product_id: string
      qty: number
      cost_per_unit: number
      supplier?: string
      purchased_at: string
    }) => {
      const product = products.find((p) => p.id === data.product_id)
      if (!product) throw new Error("सामान नहीं मिला (Product not found)")

      // Calculate weighted average cost & stock update
      const { newStock, newAvgCost } = calculateWeightedAverage(
        product.stock_qty,
        product.avg_cost,
        data.qty,
        data.cost_per_unit
      )

      // Update product in memory
      setProducts((prev) =>
        prev.map((p) =>
          p.id === data.product_id
            ? { ...p, stock_qty: newStock, avg_cost: newAvgCost }
            : p
        )
      )

      const total_cost = Math.round(data.qty * data.cost_per_unit * 100) / 100
      const newPurchase: PurchaseRecord = {
        id: `pur-${Date.now()}`,
        product_id: data.product_id,
        product_name: product.name,
        supplier: data.supplier,
        qty: data.qty,
        cost_per_unit: data.cost_per_unit,
        total_cost,
        purchased_at: data.purchased_at,
        created_at: new Date().toISOString(),
      }

      setPurchases((prev) => [newPurchase, ...prev])

      // Sync to backend asynchronously
      fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success && resData.data?.id) {
            setPurchases((prev) =>
              prev.map((item) => (item.id === newPurchase.id ? resData.data : item))
            )
          }
        })
        .catch((err) => console.warn("Backend purchase sync error:", err))

      return newPurchase
    },
    [products]
  )

  // ADD SALE (Implements DB Trigger 2 & 3 logic: no negative stock + Backend API)
  const addSale = React.useCallback(
    (data: {
      product_id: string
      qty: number
      sell_per_unit: number
      sold_at: string
    }) => {
      const product = products.find((p) => p.id === data.product_id)
      if (!product) throw new Error("सामान नहीं मिला (Product not found)")

      // Stock check: NO NEGATIVE STOCK
      if (product.stock_qty < data.qty) {
        throw new Error(
          `स्टॉक पर्याप्त नहीं है! उपलब्ध: ${product.stock_qty} ${product.unit}, दर्ज की गई मात्रा: ${data.qty}`
        )
      }

      // Snapshot cost at time of sale
      const cost_at_sale = product.avg_cost
      const { totalSale, profit } = calculateSaleProfit(
        data.qty,
        data.sell_per_unit,
        cost_at_sale
      )

      // Deduct stock
      const updatedStock = Math.max(0, product.stock_qty - data.qty)
      setProducts((prev) =>
        prev.map((p) =>
          p.id === data.product_id ? { ...p, stock_qty: updatedStock } : p
        )
      )

      const newSale: SaleRecord = {
        id: `sale-${Date.now()}`,
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

      setSales((prev) => [newSale, ...prev])

      // Sync to backend asynchronously
      fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success && resData.data?.id) {
            setSales((prev) =>
              prev.map((item) => (item.id === newSale.id ? resData.data : item))
            )
          }
        })
        .catch((err) => console.warn("Backend sale sync error:", err))

      return newSale
    },
    [products]
  )

  // DELETE SALE (Reverts stock + Backend API)
  const deleteSale = React.useCallback(
    (id: string) => {
      const sale = sales.find((s) => s.id === id)
      if (!sale) return

      // Revert stock back
      setProducts((prev) =>
        prev.map((p) =>
          p.id === sale.product_id
            ? { ...p, stock_qty: p.stock_qty + sale.qty }
            : p
        )
      )

      setSales((prev) => prev.filter((s) => s.id !== id))

      // Sync deletion to backend
      fetch(`/api/sales/${encodeURIComponent(id)}`, {
        method: "DELETE",
      }).catch((err) => console.warn("Backend delete sale error:", err))
    },
    [sales]
  )

  // DELETE PURCHASE (Reverts purchase and deducts stock + Backend API)
  const deletePurchase = React.useCallback(
    (id: string) => {
      const purchase = purchases.find((p) => p.id === id)
      if (!purchase) return

      setProducts((prev) =>
        prev.map((p) =>
          p.id === purchase.product_id
            ? { ...p, stock_qty: Math.max(0, p.stock_qty - purchase.qty) }
            : p
        )
      )

      setPurchases((prev) => prev.filter((p) => p.id !== id))

      // Sync deletion to backend
      fetch(`/api/purchases/${encodeURIComponent(id)}`, {
        method: "DELETE",
      }).catch((err) => console.warn("Backend delete purchase error:", err))
    },
    [purchases]
  )

  const resetToDefault = React.useCallback(() => {
    setProducts(INITIAL_PRODUCTS)
    setPurchases(INITIAL_PURCHASES)
    setSales(INITIAL_SALES)
    try {
      localStorage.removeItem("balancebook_products")
      localStorage.removeItem("balancebook_purchases")
      localStorage.removeItem("balancebook_sales")
      localStorage.removeItem("dukan_khata_products")
      localStorage.removeItem("dukan_khata_purchases")
      localStorage.removeItem("dukan_khata_sales")
    } catch {}
  }, [])

  const [todayDate, setTodayDate] = React.useState(INITIAL_DATE)

  React.useEffect(() => {
    setTodayDate(new Date().toISOString().split("T")[0])
  }, [])

  // REALTIME METRICS COMPUTATION
  const metrics = React.useMemo(() => {
    const today = todayDate
    const currentMonth = today.slice(0, 7) // YYYY-MM

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
  }, [products, purchases, sales])

  return (
    <StoreContext.Provider
      value={{
        products,
        purchases,
        sales,
        addProduct,
        addPurchase,
        addSale,
        deleteSale,
        deletePurchase,
        resetToDefault,
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
