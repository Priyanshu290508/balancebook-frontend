"use client"

import * as React from "react"
import Link from "next/link"
import {
  TrendingUp,
  ShoppingCart,
  ShoppingBag,
  AlertTriangle,
  ArrowRight,
  Plus,
  Package,
  Calendar,
  Store,
  Layers,
  Search,
  CheckCircle2,
  DollarSign,
  BarChart3,
  PackagePlus,
  Trash2,
  ArrowUpRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore, getTodayDate } from "@/lib/store"
import { useTranslation } from "@/lib/i18n"
import { formatINR, formatItemNameByLang, formatCategoryByLang, calculateMargin } from "@/lib/calc"
import { AuthGuard } from "@/lib/auth"

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}

function DashboardContent() {
  const { metrics, sales, purchases, products, addSale, isRealtime, isLoading } = useStore()
  const { t, language, isEn } = useTranslation()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  // 1-Tap Quick Sale directly from dashboard inventory table
  const handleQuickSale = async (productId: string, sellPrice: number, stockQty: number) => {
    if (stockQty <= 0) {
      setErrorMessage(isEn ? "Cannot sell: item is out of stock!" : "बिक्री संभव नहीं: सामान का स्टॉक खत्म है!")
      setTimeout(() => setErrorMessage(null), 5000)
      return
    }

    try {
      setErrorMessage(null)
      const res = await addSale({
        product_id: productId,
        qty: 1,
        sell_per_unit: sellPrice,
        sold_at: getTodayDate(),
      })
      setToastMessage(
        `${isEn ? "1-Tap Sale Logged" : "1-क्लिक बिक्री दर्ज"}: ${res.product_name} • +${formatINR(res.profit)} ${
          isEn ? "profit" : "मुनाफा"
        }`
      )
      setTimeout(() => setToastMessage(null), 5000)
    } catch (err: any) {
      console.error("1-Tap sale error:", err)
      setErrorMessage(err.message || (isEn ? "Failed to log sale." : "बिक्री दर्ज करने में त्रुटि।"))
      setTimeout(() => setErrorMessage(null), 6000)
    }
  }

  // Filtered inventory rows
  const filteredProducts = React.useMemo(() => {
    if (!searchQuery.trim()) return products
    const q = searchQuery.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    )
  }, [products, searchQuery])

  // Financial analytics
  const analytics = React.useMemo(() => {
    let totalInventoryCost = 0
    let totalRetailValue = 0

    products.forEach((p) => {
      totalInventoryCost += p.stock_qty * p.avg_cost
      totalRetailValue += p.stock_qty * p.sell_price
    })

    const potentialProfit = Math.max(0, totalRetailValue - totalInventoryCost)

    return {
      totalInventoryCost,
      totalRetailValue,
      potentialProfit,
    }
  }, [products])

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="flex items-center justify-between rounded-2xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 p-4 text-sm font-bold text-emerald-800 dark:text-emerald-300 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-800 hover:text-emerald-950 p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Toast Notification */}
      {errorMessage && (
        <div className="flex items-center justify-between rounded-2xl bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-800 p-4 text-sm font-bold text-red-800 dark:text-red-300 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-800 hover:text-red-950 p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                {isEn ? "Store Dashboard" : "दुकान खाता डैशबोर्ड"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {isRealtime ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                    {isEn ? "Supabase Realtime Sync Active" : "सुपाबेस रियल-टाइम सिंक सक्रिय"}
                  </span>
                ) : (
                  <span>{isEn ? "PostgreSQL Retail Engine" : "पोस्टग्रेस रिटेल इंजन"}</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/sales">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full gap-1.5 shadow-sm px-4">
              <ShoppingCart className="h-4 w-4" />
              {isEn ? "+ Record Sale" : "+ बिक्री दर्ज करें"}
            </Button>
          </Link>
          <Link href="/purchases">
            <Button size="sm" variant="outline" className="border-border/80 font-bold rounded-full gap-1.5 px-4">
              <ShoppingBag className="h-4 w-4 text-emerald-600" />
              {isEn ? "+ Record Purchase" : "+ माल खरीदें"}
            </Button>
          </Link>
          <Link href="/products">
            <Button size="sm" variant="outline" className="border-border/80 font-bold rounded-full gap-1.5 px-4">
              <PackagePlus className="h-4 w-4" />
              {isEn ? "+ New Product" : "+ नया सामान"}
            </Button>
          </Link>
        </div>
      </div>

      {/* 5 Real Metrics KPI Cards (All computed live from Supabase) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Metric 1: Today's Sales */}
        <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold">{isEn ? "Today's Sales" : "आज की कुल बिक्री"}</span>
            <ShoppingCart className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-3 text-xl sm:text-2xl font-black text-foreground">
            {formatINR(metrics.todaySales)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {isEn ? "Revenue from sold_at = today" : "आज दर्ज हुई बिक्री"}
          </p>
        </div>

        {/* Metric 2: Today's Profit */}
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {isEn ? "Today's Profit" : "आज का शुद्ध मुनाफा"}
            </span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-3 text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
            +{formatINR(metrics.todayProfit)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {isEn ? "Calculated by trigger snapshot" : "ट्रिगर द्वारा सटीक स्नैपशॉट"}
          </p>
        </div>

        {/* Metric 3: Month's Profit */}
        <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold">{isEn ? "Month's Profit" : "इस माह का मुनाफा"}</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-3 text-xl sm:text-2xl font-black text-foreground">
            {formatINR(metrics.monthProfit)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {isEn ? "Current month accumulative" : "चालू माह का कुल संचित मुनाफा"}
          </p>
        </div>

        {/* Metric 4: Today's Purchases */}
        <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold">{isEn ? "Today's Purchases" : "आज की खरीद (लागत)"}</span>
            <ShoppingBag className="h-4 w-4 text-cyan-500" />
          </div>
          <p className="mt-3 text-xl sm:text-2xl font-black text-foreground">
            {formatINR(metrics.todayPurchases)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {isEn ? "Inward stock purchases" : "स्टॉक में आवक खरीद"}
          </p>
        </div>

        {/* Metric 5: Low Stock Warning */}
        <div
          className={`col-span-2 sm:col-span-1 rounded-3xl border p-4 sm:p-5 shadow-xs ${
            metrics.lowStockCount > 0
              ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
              : "border-border/80 bg-card text-foreground"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold">{isEn ? "Low Stock Items" : "कम स्टॉक चेतावनी"}</span>
            <AlertTriangle className={`h-4 w-4 ${metrics.lowStockCount > 0 ? "text-red-500" : "text-muted-foreground"}`} />
          </div>
          <p className={`mt-3 text-xl sm:text-2xl font-black ${metrics.lowStockCount > 0 ? "text-red-600 dark:text-red-400" : ""}`}>
            {metrics.lowStockCount} {isEn ? "Products" : "सामान"}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {metrics.lowStockCount > 0
              ? isEn ? "Restock needed immediately" : "तत्काल पुनः ऑर्डर करें"
              : isEn ? "All stocks healthy" : "सभी स्टॉक सुरक्षित"}
          </p>
        </div>
      </div>

      {/* Low Stock Banner if any items are critical */}
      {metrics.lowStockCount > 0 && (
        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-4 sm:p-5">
          <div className="flex items-center gap-2 font-bold text-red-600 dark:text-red-400 text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>
              {isEn ? "Urgent Restock Needed" : "तुरंत सामान मंगाने की आवश्यकता"}: {metrics.lowStockCount}{" "}
              {isEn ? "items below threshold" : "आइटम कम स्टॉक सीमा से नीचे"}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {metrics.lowStockProducts.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/15 px-3 py-1 text-xs font-bold text-red-600 dark:text-red-300"
              >
                {formatItemNameByLang(p.name, language)}: {p.stock_qty} {p.unit} (Limit: {p.low_stock_limit})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Inventory & 1-Tap Retail Sales Table */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border/60">
          <div>
            <h2 className="text-lg font-black text-foreground flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-500" />
              <span>{isEn ? "Store Inventory Register" : "दुकान का लाइव स्टॉक रजिस्टर"}</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isEn
                ? "Directly connected to public.products with weighted average buy rates"
                : "सुपाबेस टेबल public.products से लाइव कनेक्टेड"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={isEn ? "Search products..." : "सामान खोजें..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full pl-9 pr-4 text-xs font-medium rounded-full border border-border/80 bg-background focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <Link href="/products">
              <Button size="sm" variant="ghost" className="text-xs font-bold gap-1 text-muted-foreground hover:text-foreground">
                <span>{isEn ? "Manage" : "प्रबंधित करें"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Empty Inventory State */}
        {products.length === 0 ? (
          <div className="py-12 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
            <h3 className="text-base font-bold text-foreground">
              {isEn ? "No Products in Store Yet" : "दुकान में अभी कोई सामान दर्ज नहीं है"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {isEn
                ? "Click 'Add First Product' to start, or execute supabase/seed.sql in your Supabase SQL Editor to load sample inventory."
                : "नया सामान जोड़ने के लिए बटन पर क्लिक करें या Supabase SQL Editor में seed.sql चलाएं।"}
            </p>
            <div className="mt-5">
              <Link href="/products">
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full gap-2 px-5">
                  <Plus className="h-4 w-4" />
                  {isEn ? "Add First Product" : "पहला सामान जोड़ें"}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/70 text-muted-foreground">
                  <th className="py-3 px-3 font-bold">{isEn ? "Product Name" : "सामान"}</th>
                  <th className="py-3 px-3 font-bold">{isEn ? "Category" : "कैटेगरी"}</th>
                  <th className="py-3 px-3 font-bold text-right">{isEn ? "Current Stock" : "स्टॉक"}</th>
                  <th className="py-3 px-3 font-bold text-right">{isEn ? "Buy Rate (Avg)" : "खरीद दर"}</th>
                  <th className="py-3 px-3 font-bold text-right">{isEn ? "Sell Rate" : "बिक्री दर"}</th>
                  <th className="py-3 px-3 font-bold text-right">{isEn ? "Margin" : "मार्जिन"}</th>
                  <th className="py-3 px-3 font-bold text-center">{isEn ? "Status" : "स्थिति"}</th>
                  <th className="py-3 px-3 font-bold text-center">{isEn ? "1-Click Action" : "एक्शन"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredProducts.map((p) => {
                  const { margin, marginPct, badgeColor } = calculateMargin(p.sell_price, p.avg_cost)
                  const isLow = p.stock_qty <= p.low_stock_limit

                  return (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-foreground">
                        {formatItemNameByLang(p.name, language)}
                      </td>
                      <td className="py-3.5 px-3 text-muted-foreground">
                        {formatCategoryByLang(p.category, language)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-black">
                        <span className={isLow ? "text-red-600 font-bold" : "text-foreground"}>
                          {p.stock_qty} {p.unit}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right text-muted-foreground font-semibold">
                        ₹{p.avg_cost}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-foreground">
                        ₹{p.sell_price}
                      </td>
                      <td className="py-3.5 px-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                        +{formatINR(margin)} ({marginPct}%)
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                            isLow
                              ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30"
                              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          {isLow ? (isEn ? "LOW STOCK" : "कम स्टॉक") : isEn ? "HEALTHY" : "पर्याप्त"}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <Button
                          size="sm"
                          disabled={p.stock_qty <= 0}
                          onClick={() => handleQuickSale(p.id, p.sell_price, p.stock_qty)}
                          className="h-8 px-3 text-[11px] font-bold rounded-full bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-xs disabled:opacity-40"
                        >
                          {isEn ? "+ Sell 1" : "+ 1 बेचें"}
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom Grid: Recent Sales & Recent Purchases (Live registers) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-emerald-500" />
              <span>{isEn ? "Latest Sales Register" : "हालिया बिक्री रजिस्टर"}</span>
            </h3>
            <Link href="/sales" className="text-xs font-bold text-emerald-600 hover:underline">
              {isEn ? "View All" : "सभी देखें"} →
            </Link>
          </div>

          <div className="mt-4 space-y-2.5">
            {sales.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                {isEn ? "No sales recorded yet." : "अभी कोई बिक्री दर्ज नहीं है।"}
              </p>
            ) : (
              sales.slice(0, 5).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/60 hover:bg-muted/40 transition-colors"
                >
                  <div>
                    <p className="text-xs font-bold text-foreground">{s.product_name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {s.qty} pcs @ ₹{s.sell_per_unit} • {s.sold_at}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-foreground">{formatINR(s.total_sale)}</p>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatINR(s.profit)} {isEn ? "profit" : "मुनाफा"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Purchases */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-cyan-500" />
              <span>{isEn ? "Latest Purchases Register" : "हालिया खरीद रजिस्टर"}</span>
            </h3>
            <Link href="/purchases" className="text-xs font-bold text-cyan-600 hover:underline">
              {isEn ? "View All" : "सभी देखें"} →
            </Link>
          </div>

          <div className="mt-4 space-y-2.5">
            {purchases.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                {isEn ? "No purchases recorded yet." : "अभी कोई खरीद दर्ज नहीं है।"}
              </p>
            ) : (
              purchases.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/60 hover:bg-muted/40 transition-colors"
                >
                  <div>
                    <p className="text-xs font-bold text-foreground">{p.product_name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {p.qty} pcs @ ₹{p.cost_per_unit} • {p.purchased_at}
                      {p.supplier ? ` • ${p.supplier}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-foreground">{formatINR(p.total_cost)}</p>
                    <span className="text-[10px] text-muted-foreground">
                      {isEn ? "Inward Stock" : "आवक स्टॉक"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
