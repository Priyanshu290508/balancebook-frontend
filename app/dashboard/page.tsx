"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
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
  ShieldCheck,
  Award,
  Truck,
  DollarSign,
  BarChart3,
  Users,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { useTranslation } from "@/lib/i18n"
import { formatINR, formatItemNameByLang, formatCategoryByLang, calculateMargin } from "@/lib/calc"

export default function DashboardPage() {
  const { metrics, sales, purchases, products, addSale } = useStore()
  const { t, language, isEn } = useTranslation()

  // Active console sidebar view
  const [activeConsoleNav, setActiveConsoleNav] = React.useState<
    "Storage Pools" | "Workspaces" | "Retention" | "Access" | "Transfers" | "Reports"
  >("Storage Pools")

  // Console toast notification
  const [consoleToast, setConsoleToast] = React.useState<{
    title: string
    subtitle: string
  } | null>({
    title: "BalanceBook Engine",
    subtitle: "Realtime retail accounting active",
  })

  // Financial Analytics for Reports
  const analytics = React.useMemo(() => {
    let totalInventoryCost = 0
    let totalRetailValue = 0

    products.forEach((p) => {
      totalInventoryCost += p.stock_qty * p.avg_cost
      totalRetailValue += p.stock_qty * p.sell_price
    })

    const potentialProfit = Math.max(0, totalRetailValue - totalInventoryCost)
    const grossMarginPct =
      totalInventoryCost > 0
        ? ((potentialProfit / totalInventoryCost) * 100).toFixed(1)
        : "0.0"

    const rankedProducts = [...products]
      .map((p) => {
        const { margin, marginPct, badgeColor } = calculateMargin(
          p.sell_price,
          p.avg_cost
        )
        return {
          ...p,
          margin,
          marginPct,
          badgeColor,
        }
      })
      .sort((a, b) => b.marginPct - a.marginPct)

    return {
      totalInventoryCost,
      totalRetailValue,
      potentialProfit,
      grossMarginPct,
      rankedProducts,
    }
  }, [products])

  // Formatted inventory rows for Storage Pools
  const tableRows = React.useMemo(() => {
    return products.map((item) => {
      const isLow = item.stock_qty <= item.low_stock_limit
      const marginVal = item.sell_price - item.avg_cost
      const marginPct =
        item.avg_cost > 0
          ? ((marginVal / item.avg_cost) * 100).toFixed(1)
          : "0.0"

      let state: "HEALTHY" | "SYNCING" | "LOW STOCK" = "HEALTHY"
      if (isLow) {
        state = "LOW STOCK"
      } else if (item.stock_qty < item.low_stock_limit * 2) {
        state = "SYNCING"
      }

      return {
        id: item.id,
        name: formatItemNameByLang(item.name, language).toLowerCase().replace(/\s+/g, "-"),
        displayName: formatItemNameByLang(item.name, language),
        category: formatCategoryByLang(item.category, language),
        stock: `${item.stock_qty} ${item.unit}`,
        policy: `+${marginPct}% Margin`,
        rawCost: item.avg_cost,
        rawSell: item.sell_price,
        rawStock: item.stock_qty,
        rawUnit: item.unit,
        rawLimit: item.low_stock_limit,
        state,
      }
    })
  }, [products, language])

  // Trigger quick 1-tap sale from row
  const handleQuickSale = async (product: (typeof tableRows)[0]) => {
    if (product.rawStock <= 0) return
    const profit = Math.round((product.rawSell - product.rawCost) * 100) / 100
    try {
      await addSale({
        product_id: product.id,
        qty: 1,
        sell_per_unit: product.rawSell,
        sold_at: new Date().toISOString().split("T")[0],
      })
      setConsoleToast({
        title: "1-Tap Sale Logged",
        subtitle: `${product.displayName} · +₹${profit} Profit recorded`,
      })
    } catch (err: any) {
      setConsoleToast({
        title: "Sale Failed",
        subtitle: err.message || "Could not log sale",
      })
    }
  }

  // Navigation Items with descriptive store names
  const consoleNavItems = [
    {
      id: "Storage Pools" as const,
      title: "Storage Pools",
      storeLabel: isEn ? "All Inventory" : "इन्वेंट्री पूल",
      count: products.length,
      badgeColor: "bg-cyan-500/20 text-cyan-300",
    },
    {
      id: "Retention" as const,
      title: "Retention",
      storeLabel: isEn ? "Low Stock Alerts" : "कम स्टॉक चेतावनी",
      count: metrics.lowStockProducts.length,
      badgeColor: "bg-amber-500/20 text-amber-300",
    },
    {
      id: "Workspaces" as const,
      title: "Workspaces",
      storeLabel: isEn ? "Sales Register" : "बिक्री खाता",
      count: sales.length,
      badgeColor: "bg-emerald-500/20 text-emerald-300",
    },
    {
      id: "Transfers" as const,
      title: "Transfers",
      storeLabel: isEn ? "Inward Stock (Purchases)" : "माल आवक (खरीद)",
      count: purchases.length,
      badgeColor: "bg-purple-500/20 text-purple-300",
    },
    {
      id: "Reports" as const,
      title: "Reports",
      storeLabel: isEn ? "Profit & Margins" : "मुनाफा रिपोर्ट्स",
    },
    {
      id: "Access" as const,
      title: "Access",
      storeLabel: isEn ? "Staff & Permissions" : "स्टाफ एक्सेस",
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Top Console Eyebrow & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-white/10 bg-[#0e1217] text-[10px] sm:text-[11px] font-mono text-white/70">
            <span className="text-white/40">0 . 2</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="tracking-widest uppercase text-white/90">
              BALANCEBOOK LIVE CONSOLE
            </span>
          </div>
          <span className="text-xs text-white/40 font-mono hidden sm:inline">
            ledger: client-vault &bull; accounting: retail-sync
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/sales" className="flex-1 sm:flex-none">
            <button className="w-full sm:w-auto px-3 py-1.5 rounded border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-mono tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
              <span>{isEn ? "+ NEW SALE" : "+ नई बिक्री"}</span>
            </button>
          </Link>
          <Link href="/purchases" className="flex-1 sm:flex-none">
            <button className="w-full sm:w-auto px-3 py-1.5 rounded border border-white/20 bg-transparent hover:bg-white/5 text-white/80 hover:text-white text-xs font-mono tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
              <span>{isEn ? "+ PURCHASE" : "+ माल खरीदा"}</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metrics Strip (Compact 2x2 on Mobile) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        {/* Card 1: Today's Sales */}
        <div className="rounded-xl border border-white/10 bg-[#0c0f12] p-3 sm:p-4 text-white">
          <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono text-white/40 uppercase tracking-wider">
            <span>{isEn ? "Today's Sales" : "आज की बिक्री"}</span>
            <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-400 shrink-0" />
          </div>
          <div className="mt-1.5 sm:mt-2">
            <p className="text-lg sm:text-2xl font-bold font-mono tracking-tight text-white">
              {formatINR(metrics.todaySales)}
            </p>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] font-mono text-white/50 truncate">
              {sales.length} {isEn ? "receipts" : "बिल"}
            </p>
          </div>
        </div>

        {/* Card 2: Today's Profit (Highlighted) */}
        <div className="rounded-xl border border-teal-500/30 bg-[#0e2229]/60 p-3 sm:p-4 text-white">
          <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono text-teal-300 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              {isEn ? "Today's Profit" : "आज का मुनाफा"}
            </span>
            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400 shrink-0" />
          </div>
          <div className="mt-1.5 sm:mt-2">
            <p className="text-lg sm:text-2xl font-bold font-mono tracking-tight text-emerald-400">
              {formatINR(metrics.todayProfit)}
            </p>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] font-mono text-teal-300/70 truncate">
              {metrics.todaySales > 0
                ? `${((metrics.todayProfit / metrics.todaySales) * 100).toFixed(1)}% ${isEn ? "Margin" : "मार्जिन"}`
                : isEn ? "Live Margin" : "लाइव मार्जिन"}
            </p>
          </div>
        </div>

        {/* Card 3: Month's Profit */}
        <div className="rounded-xl border border-white/10 bg-[#0c0f12] p-3 sm:p-4 text-white">
          <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono text-white/40 uppercase tracking-wider">
            <span>{isEn ? "Month's Profit" : "माह का मुनाफा"}</span>
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/60 shrink-0" />
          </div>
          <div className="mt-1.5 sm:mt-2">
            <p className="text-lg sm:text-2xl font-bold font-mono tracking-tight text-white">
              {formatINR(metrics.monthProfit)}
            </p>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] font-mono text-white/50 truncate">
              {isEn ? "Monthly net" : "कुल शुद्ध"}
            </p>
          </div>
        </div>

        {/* Card 4: Today's Purchases */}
        <div className="rounded-xl border border-white/10 bg-[#0c0f12] p-3 sm:p-4 text-white">
          <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono text-white/40 uppercase tracking-wider">
            <span>{isEn ? "Purchases" : "आज की खरीद"}</span>
            <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 shrink-0" />
          </div>
          <div className="mt-1.5 sm:mt-2">
            <p className="text-lg sm:text-2xl font-bold font-mono tracking-tight text-white">
              {formatINR(metrics.todayPurchases)}
            </p>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] font-mono text-white/50 truncate">
              {purchases.length} {isEn ? "deliveries" : "आवक"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Console Frame */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl overflow-hidden border border-white/10 bg-[#0c0f12] shadow-2xl relative"
      >
        {/* Top Window Bar */}
        <div className="h-9 px-3 sm:px-4 border-b border-white/10 bg-[#090b0e] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
          </div>
          <div className="text-[10px] sm:text-[11px] font-mono text-white/40 tracking-wider truncate px-2">
            console.balancebook.in &bull; {activeConsoleNav.toLowerCase()}
          </div>
          <div className="w-6 sm:w-10" />
        </div>

        {/* Mobile Horizontal Module Switcher (Visible only on phone screens) */}
        <div className="block md:hidden border-b border-white/10 bg-[#090c0f] p-2.5 overflow-hidden">
          <div className="text-[10px] font-mono font-semibold text-white/40 uppercase tracking-wider px-1 mb-2">
            Store Modules &bull; Swipe to switch
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {consoleNavItems.map((item) => {
              const isSelected = activeConsoleNav === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveConsoleNav(item.id)
                    setConsoleToast({
                      title: item.title,
                      subtitle: `${item.storeLabel} view active`,
                    })
                  }}
                  className={`shrink-0 px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-[#18232c] text-white font-bold border border-teal-500/50 shadow-sm"
                      : "bg-white/[0.04] text-white/60 hover:text-white border border-white/5"
                  }`}
                >
                  <span>{item.title}</span>
                  {typeof item.count === "number" && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        item.badgeColor || "bg-white/10 text-white/70"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Console Body: Desktop Left Sidebar + Right Main Area */}
        <div className="grid grid-cols-12 min-h-[520px]">
          {/* Desktop Left Sidebar (Hidden on mobile) */}
          <div className="hidden md:flex md:col-span-3 border-r border-white/10 bg-[#090c0f] p-4 flex-col justify-between">
            <div>
              <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider px-2 mb-3">
                Store Vault &bull; Modules
              </div>

              <nav className="space-y-1.5">
                {consoleNavItems.map((item) => {
                  const isSelected = activeConsoleNav === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveConsoleNav(item.id)
                        setConsoleToast({
                          title: item.title,
                          subtitle: `${item.storeLabel} view active`,
                        })
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-[#18232c] text-white font-bold border border-teal-500/30 shadow-xs"
                          : "text-white/50 hover:bg-white/[0.03] hover:text-white/80"
                      }`}
                    >
                      <div>
                        <span className="block text-white/90">{item.title}</span>
                        <span className="text-[10px] text-white/40 block font-normal">
                          {item.storeLabel}
                        </span>
                      </div>
                      {typeof item.count === "number" && (
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            item.badgeColor || "bg-white/10 text-white/70"
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-white/5 text-[10px] text-white/30 font-mono flex items-center justify-between">
              <span>LEDGER: ONLINE</span>
              <span className="text-emerald-400 font-semibold">100% SYNCED</span>
            </div>
          </div>

          {/* Right Main Content Area: Responsive Mobile Cards + Desktop Table */}
          <div className="col-span-12 md:col-span-9 p-4 sm:p-6 md:p-8 flex flex-col justify-between relative bg-[#0c0f12]">
            <div>
              {/* TAB 1: STORAGE POOLS (ALL INVENTORY & 1-TAP SALE) */}
              {activeConsoleNav === "Storage Pools" && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 gap-3 border-b border-white/5 sm:border-transparent">
                    <div>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white flex flex-wrap items-center gap-2">
                        <span>Storage Pools</span>
                        <span className="text-xs sm:text-sm font-normal text-white/50 font-mono">
                          (All Inventory & Margins)
                        </span>
                      </h2>
                      <p className="text-[11px] sm:text-xs text-white/50 font-mono mt-1">
                        {products.length} {isEn ? "active inventory items tracked with live 1-tap sale trigger" : "सामान सक्रिय व मार्जिन इंजन से जुड़े हैं"}
                      </p>
                    </div>

                    <Link href="/products" className="self-start sm:self-auto">
                      <button className="px-3.5 py-1.5 rounded border border-white/20 bg-transparent hover:bg-white/5 text-[11px] font-mono tracking-wider uppercase text-white/90 hover:text-white transition-all cursor-pointer">
                        + NEW PRODUCT
                      </button>
                    </Link>
                  </div>

                  {/* MOBILE VIEW: Touch-Friendly Product Cards */}
                  <div className="space-y-3 block md:hidden mt-4">
                    {tableRows.map((row) => (
                      <div
                        key={row.id}
                        className="p-3.5 rounded-xl border border-white/10 bg-[#101419] space-y-2.5 transition-all hover:border-white/20"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-white tracking-tight truncate">
                              {row.displayName}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/60">
                                {row.category}
                              </span>
                              <span
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                                  row.state === "HEALTHY"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : row.state === "SYNCING"
                                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                }`}
                              >
                                {row.state}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-mono font-bold text-emerald-400 block">
                              {row.policy}
                            </span>
                            <span className="text-[10px] font-mono text-white/40 block mt-0.5">
                              ₹{row.rawSell} / {row.rawUnit}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] font-mono text-white/40 uppercase block">
                              Stock in Hand
                            </span>
                            <span className="text-xs font-mono font-bold text-white">
                              {row.stock}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleQuickSale(row)}
                            className="px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 active:bg-emerald-500/30 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                          >
                            <span>+ 1-TAP SALE</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* DESKTOP VIEW: Full Wide Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[650px]">
                      <thead>
                        <tr className="border-b border-white/10 text-[10px] font-mono tracking-wider uppercase text-white/40">
                          <th className="pb-3 font-medium">ITEM NAME</th>
                          <th className="pb-3 font-medium">CATEGORY</th>
                          <th className="pb-3 font-medium">STOCK IN HAND</th>
                          <th className="pb-3 font-medium">MARGIN RATE</th>
                          <th className="pb-3 font-medium text-left">STATUS</th>
                          <th className="pb-3 font-medium text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs font-mono">
                        {tableRows.map((row) => (
                          <tr
                            key={row.id}
                            className="group hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="py-3.5 text-white/90 font-medium group-hover:text-white">
                              <div className="truncate max-w-[200px]" title={row.displayName}>
                                {row.displayName}
                              </div>
                            </td>
                            <td className="py-3.5 text-white/60">{row.category}</td>
                            <td className="py-3.5 text-white/70">{row.stock}</td>
                            <td className="py-3.5 text-white/60">{row.policy}</td>
                            <td className="py-3.5 text-left">
                              <span
                                className={`text-[11px] font-bold tracking-wide ${
                                  row.state === "HEALTHY"
                                    ? "text-[#10b981]"
                                    : row.state === "SYNCING"
                                    ? "text-[#06b6d4]"
                                    : "text-[#f59e0b]"
                                }`}
                              >
                                {row.state}
                              </span>
                            </td>
                            <td className="py-3.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleQuickSale(row)}
                                className="px-2.5 py-1 rounded border border-white/10 hover:border-emerald-500/40 bg-white/5 hover:bg-emerald-500/10 text-white/70 hover:text-emerald-300 text-[10px] font-mono transition-colors cursor-pointer"
                              >
                                1-TAP SALE
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: RETENTION (LOW STOCK RESTOCK ALERTS ONLY) */}
              {activeConsoleNav === "Retention" && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 gap-3 border-b border-white/5 sm:border-transparent">
                    <div>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white flex flex-wrap items-center gap-2">
                        <span>Retention</span>
                        <span className="text-xs sm:text-sm font-normal text-amber-400 font-mono">
                          (Low Stock Restock Alerts)
                        </span>
                      </h2>
                      <p className="text-[11px] sm:text-xs text-white/50 font-mono mt-1">
                        {metrics.lowStockProducts.length} {isEn ? "items below safety threshold requiring vendor replenishment" : "सामान कम स्टॉक में हैं, तुरंत ऑर्डर दें"}
                      </p>
                    </div>

                    <Link href="/purchases" className="self-start sm:self-auto">
                      <button className="px-3.5 py-1.5 rounded border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-[11px] font-mono tracking-wider uppercase text-amber-300 transition-all cursor-pointer">
                        + REORDER NOW
                      </button>
                    </Link>
                  </div>

                  {metrics.lowStockProducts.length === 0 ? (
                    <div className="p-8 sm:p-12 text-center border border-white/10 rounded-xl bg-white/[0.02]">
                      <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400 mb-3" />
                      <h3 className="text-base font-bold text-white">
                        {isEn ? "All Inventory is Adequately Stocked" : "सभी सामान पर्याप्त स्टॉक में हैं"}
                      </h3>
                      <p className="text-xs text-white/50 font-mono mt-1">
                        {isEn ? "Zero items are below their safety limit." : "कोई भी सामान कम स्टॉक सीमा से नीचे नहीं है।"}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* MOBILE VIEW: Low Stock Alert Cards */}
                      <div className="space-y-3 block md:hidden mt-4">
                        {metrics.lowStockProducts.map((item) => (
                          <div
                            key={item.id}
                            className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                  <h4 className="text-sm font-bold text-white tracking-tight">
                                    {formatItemNameByLang(item.name, language)}
                                  </h4>
                                  <span className="text-[10px] font-mono text-white/50 block mt-0.5">
                                    {formatCategoryByLang(item.category, language)}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-[9px] font-mono text-white/40 uppercase block">Buy Rate</span>
                                <span className="text-xs font-mono font-bold text-white/80">{formatINR(item.avg_cost)}</span>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                              <div>
                                <span className="text-[11px] font-mono text-red-400 font-bold block">
                                  {item.stock_qty} {item.unit} remaining
                                </span>
                                <span className="text-[9px] font-mono text-white/40 block">
                                  Alert limit: {item.low_stock_limit} {item.unit}
                                </span>
                              </div>
                              <Link href="/purchases">
                                <button className="px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/20 text-amber-300 text-xs font-mono font-bold transition-colors cursor-pointer">
                                  REORDER &rarr;
                                </button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* DESKTOP VIEW: Full Wide Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[650px]">
                          <thead>
                            <tr className="border-b border-white/10 text-[10px] font-mono tracking-wider uppercase text-white/40">
                              <th className="pb-3 font-medium">LOW STOCK ITEM</th>
                              <th className="pb-3 font-medium">CATEGORY</th>
                              <th className="pb-3 font-medium">REMAINING QTY</th>
                              <th className="pb-3 font-medium">ALERT LIMIT</th>
                              <th className="pb-3 font-medium">BUY RATE</th>
                              <th className="pb-3 font-medium text-right">ACTION</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-xs font-mono">
                            {metrics.lowStockProducts.map((item) => (
                              <tr
                                key={item.id}
                                className="group hover:bg-white/[0.02] transition-colors"
                              >
                                <td className="py-3.5 text-white/90 font-bold flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                                  <span>{formatItemNameByLang(item.name, language)}</span>
                                </td>
                                <td className="py-3.5 text-white/60">
                                  {formatCategoryByLang(item.category, language)}
                                </td>
                                <td className="py-3.5 text-red-400 font-bold">
                                  {item.stock_qty} {item.unit}
                                </td>
                                <td className="py-3.5 text-white/50">
                                  {item.low_stock_limit} {item.unit}
                                </td>
                                <td className="py-3.5 text-white/70">
                                  {formatINR(item.avg_cost)}
                                </td>
                                <td className="py-3.5 text-right">
                                  <Link href="/purchases">
                                    <button className="px-2.5 py-1 rounded border border-amber-500/30 hover:border-amber-400 bg-amber-500/10 text-amber-300 text-[10px] font-mono transition-colors cursor-pointer">
                                      REORDER STOCK &rarr;
                                    </button>
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 3: WORKSPACES (SALES REGISTER & TRANSACTIONS) */}
              {activeConsoleNav === "Workspaces" && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 gap-3 border-b border-white/5 sm:border-transparent">
                    <div>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white flex flex-wrap items-center gap-2">
                        <span>Workspaces</span>
                        <span className="text-xs sm:text-sm font-normal text-emerald-400 font-mono">
                          (Daily Sales Register)
                        </span>
                      </h2>
                      <p className="text-[11px] sm:text-xs text-white/50 font-mono mt-1">
                        {sales.length} {isEn ? "customer sales receipts issued with instant profit snapshots" : "बिक्री पर्चियां व मुनाफा स्नैपशॉट"}
                      </p>
                    </div>

                    <Link href="/sales" className="self-start sm:self-auto">
                      <button className="px-3.5 py-1.5 rounded border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-[11px] font-mono tracking-wider uppercase text-emerald-300 transition-all cursor-pointer">
                        + NEW SALE
                      </button>
                    </Link>
                  </div>

                  {sales.length === 0 ? (
                    <div className="p-8 sm:p-12 text-center border border-white/10 rounded-xl bg-white/[0.02]">
                      <ShoppingCart className="mx-auto h-10 w-10 text-white/40 mb-3" />
                      <h3 className="text-base font-bold text-white">
                        {isEn ? "No Sales Recorded Today" : "आज अभी तक कोई बिक्री दर्ज नहीं हुई"}
                      </h3>
                      <p className="text-xs text-white/50 font-mono mt-1">
                        {isEn ? "Use the '+ NEW SALE' button above to issue a customer receipt." : "नई बिक्री दर्ज करने के लिए ऊपर दिए बटन का उपयोग करें।"}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* MOBILE VIEW: Sales Receipt Cards */}
                      <div className="space-y-3 block md:hidden mt-4">
                        {sales.slice(0, 10).map((s) => (
                          <div
                            key={s.id}
                            className="p-3.5 rounded-xl border border-white/10 bg-[#101419] space-y-2"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-sm font-bold text-white">
                                  {formatItemNameByLang(s.product_name || s.product_id, language)}
                                </h4>
                                <span className="text-[10px] font-mono text-white/40 block">
                                  {s.id} &bull; {s.sold_at}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-mono font-bold text-emerald-400 block">
                                  +{formatINR(s.profit)} Profit
                                </span>
                                <span className="text-[10px] font-mono text-white/70 block">
                                  Total {formatINR(s.total_sale)}
                                </span>
                              </div>
                            </div>
                            <div className="pt-1.5 border-t border-white/5 text-[10px] font-mono text-white/50 flex justify-between">
                              <span>Qty: {s.qty}</span>
                              <span>Sell Rate: {formatINR(s.sell_per_unit)}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* DESKTOP VIEW: Full Wide Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[650px]">
                          <thead>
                            <tr className="border-b border-white/10 text-[10px] font-mono tracking-wider uppercase text-white/40">
                              <th className="pb-3 font-medium">SALE ID / DATE</th>
                              <th className="pb-3 font-medium">ITEM SOLD</th>
                              <th className="pb-3 font-medium text-right">QUANTITY</th>
                              <th className="pb-3 font-medium text-right">SELL RATE</th>
                              <th className="pb-3 font-medium text-right">PROFIT</th>
                              <th className="pb-3 font-medium text-right">TOTAL SALE</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-xs font-mono">
                            {sales.slice(0, 10).map((s) => (
                              <tr
                                key={s.id}
                                className="group hover:bg-white/[0.02] transition-colors"
                              >
                                <td className="py-3.5 text-white/50">
                                  <div>{s.id}</div>
                                  <div className="text-[10px] text-white/30">{s.sold_at}</div>
                                </td>
                                <td className="py-3.5 text-white/90 font-bold">
                                  {formatItemNameByLang(s.product_name || s.product_id, language)}
                                </td>
                                <td className="py-3.5 text-right text-white/70">{s.qty}</td>
                                <td className="py-3.5 text-right text-white/70">{formatINR(s.sell_per_unit)}</td>
                                <td className="py-3.5 text-right font-bold text-emerald-400">
                                  +{formatINR(s.profit)}
                                </td>
                                <td className="py-3.5 text-right font-black text-white">
                                  {formatINR(s.total_sale)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 4: TRANSFERS (INWARD STOCK & SUPPLIER PURCHASES) */}
              {activeConsoleNav === "Transfers" && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 gap-3 border-b border-white/5 sm:border-transparent">
                    <div>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white flex flex-wrap items-center gap-2">
                        <span>Transfers</span>
                        <span className="text-xs sm:text-sm font-normal text-purple-400 font-mono">
                          (Inward Stock & Purchases)
                        </span>
                      </h2>
                      <p className="text-[11px] sm:text-xs text-white/50 font-mono mt-1">
                        {purchases.length} {isEn ? "supplier deliveries & inward stock intake recorded" : "सप्लायर से माल आवक व खरीद विवरण"}
                      </p>
                    </div>

                    <Link href="/purchases" className="self-start sm:self-auto">
                      <button className="px-3.5 py-1.5 rounded border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-[11px] font-mono tracking-wider uppercase text-purple-300 transition-all cursor-pointer">
                        + INWARD PURCHASE
                      </button>
                    </Link>
                  </div>

                  {purchases.length === 0 ? (
                    <div className="p-8 sm:p-12 text-center border border-white/10 rounded-xl bg-white/[0.02]">
                      <Truck className="mx-auto h-10 w-10 text-white/40 mb-3" />
                      <h3 className="text-base font-bold text-white">
                        {isEn ? "No Inward Purchases Logged" : "कोई खरीद आवक दर्ज नहीं है"}
                      </h3>
                      <p className="text-xs text-white/50 font-mono mt-1">
                        {isEn ? "Record incoming wholesale deliveries to compute weighted average cost." : "औसत खरीद दर अपडेट करने के लिए माल आवक दर्ज करें।"}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* MOBILE VIEW: Inward Purchase Cards */}
                      <div className="space-y-3 block md:hidden mt-4">
                        {purchases.slice(0, 10).map((p) => (
                          <div
                            key={p.id}
                            className="p-3.5 rounded-xl border border-white/10 bg-[#101419] space-y-2"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-sm font-bold text-white">
                                  {formatItemNameByLang(p.product_name || p.product_id, language)}
                                </h4>
                                <span className="text-[10px] font-mono text-white/40 block">
                                  {p.supplier || "Supplier"} &bull; {p.purchased_at}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-mono font-bold text-purple-300 block">
                                  {formatINR(p.total_cost)}
                                </span>
                                <span className="text-[10px] font-mono text-white/40 block">
                                  Total Cost
                                </span>
                              </div>
                            </div>
                            <div className="pt-1.5 border-t border-white/5 text-[10px] font-mono text-white/50 flex justify-between">
                              <span>Intake: {p.qty}</span>
                              <span>Rate: {formatINR(p.cost_per_unit)} / unit</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* DESKTOP VIEW: Full Wide Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[650px]">
                          <thead>
                            <tr className="border-b border-white/10 text-[10px] font-mono tracking-wider uppercase text-white/40">
                              <th className="pb-3 font-medium">PURCHASE ID</th>
                              <th className="pb-3 font-medium">DATE</th>
                              <th className="pb-3 font-medium">SUPPLIER</th>
                              <th className="pb-3 font-medium">ITEM INTAKE</th>
                              <th className="pb-3 font-medium text-right">QTY RECEIVED</th>
                              <th className="pb-3 font-medium text-right">COST / UNIT</th>
                              <th className="pb-3 font-medium text-right">TOTAL COST</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-xs font-mono">
                            {purchases.slice(0, 10).map((p) => (
                              <tr
                                key={p.id}
                                className="group hover:bg-white/[0.02] transition-colors"
                              >
                                <td className="py-3.5 text-white/50">{p.id}</td>
                                <td className="py-3.5 text-white/50">{p.purchased_at}</td>
                                <td className="py-3.5 text-white/80">{p.supplier || "—"}</td>
                                <td className="py-3.5 text-white/90 font-bold">
                                  {formatItemNameByLang(p.product_name || p.product_id, language)}
                                </td>
                                <td className="py-3.5 text-right text-white/70">{p.qty}</td>
                                <td className="py-3.5 text-right text-white/70">{formatINR(p.cost_per_unit)}</td>
                                <td className="py-3.5 text-right font-black text-white">
                                  {formatINR(p.total_cost)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 5: REPORTS (PROFIT & MARGIN ANALYTICS) */}
              {activeConsoleNav === "Reports" && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 gap-3 border-b border-white/5 sm:border-transparent">
                    <div>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white flex flex-wrap items-center gap-2">
                        <span>Reports</span>
                        <span className="text-xs sm:text-sm font-normal text-cyan-400 font-mono">
                          (Profit & Margin Analytics)
                        </span>
                      </h2>
                      <p className="text-[11px] sm:text-xs text-white/50 font-mono mt-1">
                        {isEn ? "Financial valuation, gross profit margins & product performance" : "दुकान की कुल इन्वेंट्री लागत, संभावित मुनाफा व मार्जिन रैंकिंग"}
                      </p>
                    </div>

                    <Link href="/history" className="self-start sm:self-auto">
                      <button className="px-3.5 py-1.5 rounded border border-white/20 bg-transparent hover:bg-white/5 text-[11px] font-mono tracking-wider uppercase text-white/90 hover:text-white transition-all cursor-pointer">
                        AUDIT HISTORY &rarr;
                      </button>
                    </Link>
                  </div>

                  {/* 3 Metric Summary Boxes (Stack on phone, 3 cols on tablet+) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-5">
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 sm:p-3.5">
                      <span className="text-[9px] sm:text-[10px] font-mono text-white/40 uppercase block">
                        {isEn ? "Total Inventory Valuation (Cost)" : "दुकान में कुल माल लागत"}
                      </span>
                      <p className="text-lg sm:text-xl font-bold font-mono text-white mt-1">
                        {formatINR(analytics.totalInventoryCost)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 sm:p-3.5">
                      <span className="text-[9px] sm:text-[10px] font-mono text-white/40 uppercase block">
                        {isEn ? "Total Retail Sale Value" : "कुल बिक्री मूल्य"}
                      </span>
                      <p className="text-lg sm:text-xl font-bold font-mono text-white mt-1">
                        {formatINR(analytics.totalRetailValue)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-3 sm:p-3.5">
                      <span className="text-[9px] sm:text-[10px] font-mono text-teal-300 uppercase block">
                        {isEn ? "Expected Gross Margin" : "संभावित कुल मुनाफा"}
                      </span>
                      <p className="text-lg sm:text-xl font-bold font-mono text-emerald-400 mt-1">
                        +{formatINR(analytics.potentialProfit)}{" "}
                        <span className="text-xs text-teal-300 font-normal">
                          ({analytics.grossMarginPct}%)
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* MOBILE VIEW: Product Ranking Cards */}
                  <div className="space-y-3 block md:hidden">
                    {analytics.rankedProducts.map((p, index) => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-xl border border-white/10 bg-[#101419] space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-white/40">
                              #{index + 1}
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-white">
                                {formatItemNameByLang(p.name, language)}
                              </h4>
                              <span className="text-[10px] font-mono text-white/40">
                                {formatCategoryByLang(p.category, language)}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                              p.badgeColor === "green"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : p.badgeColor === "amber"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            {p.marginPct}% Margin
                          </span>
                        </div>
                        <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                          <span className="text-white/50">
                            Buy: {formatINR(p.avg_cost)} &bull; Sell: {formatINR(p.sell_price)}
                          </span>
                          <span className="font-bold text-emerald-400">
                            +{formatINR(p.margin)} / unit
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* DESKTOP VIEW: Full Wide Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[650px]">
                      <thead>
                        <tr className="border-b border-white/10 text-[10px] font-mono tracking-wider uppercase text-white/40">
                          <th className="pb-3 font-medium">RANK / PRODUCT</th>
                          <th className="pb-3 font-medium">CATEGORY</th>
                          <th className="pb-3 font-medium text-right">AVG BUY COST</th>
                          <th className="pb-3 font-medium text-right">SELL RATE</th>
                          <th className="pb-3 font-medium text-right">PROFIT / UNIT</th>
                          <th className="pb-3 font-medium text-right">MARGIN %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs font-mono">
                        {analytics.rankedProducts.map((p, index) => (
                          <tr
                            key={p.id}
                            className="group hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="py-3.5 text-white/90 font-medium flex items-center gap-2">
                              <span className="w-5 text-white/40 font-mono text-[10px]">
                                #{index + 1}
                              </span>
                              <span>{formatItemNameByLang(p.name, language)}</span>
                            </td>
                            <td className="py-3.5 text-white/60">
                              {formatCategoryByLang(p.category, language)}
                            </td>
                            <td className="py-3.5 text-right text-white/70">
                              {formatINR(p.avg_cost)}
                            </td>
                            <td className="py-3.5 text-right text-white/90">
                              {formatINR(p.sell_price)}
                            </td>
                            <td className="py-3.5 text-right font-bold text-emerald-400">
                              +{formatINR(p.margin)}
                            </td>
                            <td className="py-3.5 text-right">
                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                                  p.badgeColor === "green"
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : p.badgeColor === "amber"
                                    ? "bg-amber-500/20 text-amber-300"
                                    : "bg-red-500/20 text-red-300"
                                }`}
                              >
                                {p.marginPct}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: ACCESS (STAFF, COUNTERS & SECURITY) */}
              {activeConsoleNav === "Access" && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 gap-3 border-b border-white/5 sm:border-transparent">
                    <div>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white flex flex-wrap items-center gap-2">
                        <span>Access</span>
                        <span className="text-xs sm:text-sm font-normal text-white/50 font-mono">
                          (Staff Roles & Counter Security)
                        </span>
                      </h2>
                      <p className="text-[11px] sm:text-xs text-white/50 font-mono mt-1">
                        {isEn ? "Role-based billing access & owner security permissions" : "दुकानदार व स्टाफ की अनुमतियां व बिलिंग काउंटर सुरक्षा"}
                      </p>
                    </div>

                    <Link href="/login" className="self-start sm:self-auto">
                      <button className="px-3.5 py-1.5 rounded border border-white/20 bg-transparent hover:bg-white/5 text-[11px] font-mono tracking-wider uppercase text-white/90 hover:text-white transition-all cursor-pointer">
                        OWNER PORTAL &rarr;
                      </button>
                    </Link>
                  </div>

                  {/* Access Roles Cards (Fully mobile-responsive) */}
                  <div className="space-y-3 mt-4">
                    <div className="p-3.5 sm:p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white flex flex-wrap items-center gap-1.5">
                            <span>Store Owner (Super Admin)</span>
                            <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                              ACTIVE • YOU
                            </span>
                          </p>
                          <p className="text-xs text-white/50 mt-0.5">
                            {isEn ? "Full rights: view buy rates, profit margins, delete records, modify database." : "पूर्ण अधिकार: खरीद दर, मुनाफा देखना, रिकॉर्ड हटाना व डेटाबेस संपादन।"}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 font-bold shrink-0 self-end sm:self-auto">100% ACCESS</span>
                    </div>

                    <div className="p-3.5 sm:p-4 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-white/10 flex items-center justify-center text-white/70 shrink-0">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white flex flex-wrap items-center gap-1.5">
                            <span>Cashier / Staff Counter Mode</span>
                            <span className="text-[9px] font-mono bg-white/10 text-white/60 px-2 py-0.5 rounded">
                              RESTRICTED
                            </span>
                          </p>
                          <p className="text-xs text-white/50 mt-0.5">
                            {isEn ? "Sales entry allowed. Buy costs and profit margins are hidden from billing staff." : "बिक्री दर्ज करने की अनुमति। खरीद लागत और मुनाफा स्टाफ से छिपा रहता है।"}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-white/40 shrink-0 self-end sm:self-auto">READY</span>
                    </div>

                    <div className="p-3.5 sm:p-4 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-white/10 flex items-center justify-center text-white/70 shrink-0">
                          <Truck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white flex flex-wrap items-center gap-1.5">
                            <span>Inward Stock Receiver</span>
                            <span className="text-[9px] font-mono bg-white/10 text-white/60 px-2 py-0.5 rounded">
                              PURCHASE ONLY
                            </span>
                          </p>
                          <p className="text-xs text-white/50 mt-0.5">
                            {isEn ? "Receiving staff logs vendor deliveries & bills without seeing customer profits." : "माल आवक और सप्लायर बिल दर्ज करने की अनुमति।"}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-white/40 shrink-0 self-end sm:self-auto">READY</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Status / Ledger Info */}
            <div className="mt-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 font-mono gap-2">
              <div>
                {t("app_name", "BalanceBook")} Ledger &bull; {sales.length} Sales &bull; {purchases.length} Purchases
              </div>
              <div className="flex items-center gap-4">
                <Link href="/products" className="text-emerald-400 hover:underline">
                  {isEn ? "All Products" : "सभी सामान"} &rarr;
                </Link>
                <Link href="/history" className="text-emerald-400 hover:underline">
                  {isEn ? "Full Audit History" : "लेन-देन इतिहास"} &rarr;
                </Link>
              </div>
            </div>

            {/* Floating Bottom-Right Toast Notification */}
            <AnimatePresence>
              {consoleToast && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed sm:absolute bottom-20 sm:bottom-6 right-4 sm:right-6 p-3.5 sm:p-4 rounded-lg bg-[#0e2229] border border-teal-500/40 shadow-xl max-w-xs cursor-pointer z-50"
                  onClick={() => setConsoleToast(null)}
                >
                  <div className="text-xs text-white/90 font-medium">
                    {consoleToast.title}
                  </div>
                  <div className="text-xs text-teal-300 font-semibold mt-0.5">
                    {consoleToast.subtitle}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
