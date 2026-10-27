"use client"

import * as React from "react"
import {
  History as HistoryIcon,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useStore } from "@/lib/store"
import { useTranslation } from "@/lib/i18n"
import { formatINR } from "@/lib/calc"

export default function HistoryPage() {
  const { sales, purchases, deleteSale, deletePurchase } = useStore()
  const { t, isEn, formatProductName } = useTranslation()
  const [activeTab, setActiveTab] = React.useState<"sales" | "purchases">("sales")
  const [searchTerm, setSearchTerm] = React.useState("")
  const [dateFilter, setDateFilter] = React.useState("")

  // Filtered sales
  const filteredSales = React.useMemo(() => {
    return sales.filter((s) => {
      const matchesSearch =
        !searchTerm ||
        (s.product_name &&
          s.product_name.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesDate = !dateFilter || s.sold_at === dateFilter
      return matchesSearch && matchesDate
    })
  }, [sales, searchTerm, dateFilter])

  // Filtered purchases
  const filteredPurchases = React.useMemo(() => {
    return purchases.filter((p) => {
      const matchesSearch =
        !searchTerm ||
        (p.product_name &&
          p.product_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.supplier &&
          p.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesDate = !dateFilter || p.purchased_at === dateFilter
      return matchesSearch && matchesDate
    })
  }, [purchases, searchTerm, dateFilter])

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/70">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl flex items-center gap-2">
            {isEn ? "Transaction History" : "लेन-देन इतिहास"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEn
              ? "Stock will be automatically reversed on deletion."
              : "हटाने पर स्टॉक स्वतः वापस जुड़ जाएगा।"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-border/70 pb-3">
        <button
          onClick={() => setActiveTab("sales")}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "sales"
              ? "bg-white text-black shadow-md"
              : "bg-card border border-border/70 text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          {isEn ? "Sales" : "बिक्री"} ({sales.length})
        </button>

        <button
          onClick={() => setActiveTab("purchases")}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "purchases"
              ? "bg-white text-black shadow-md"
              : "bg-card border border-border/70 text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          {isEn ? "Purchases" : "खरीद"} ({purchases.length})
        </button>
      </div>

      {/* Search & Date Filters */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={
              isEn
                ? "Search product or supplier..."
                : "सामान या सप्लायर खोजें..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 rounded-2xl bg-card border-border/80"
          />
        </div>

        <div className="relative flex items-center gap-2">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-11 rounded-2xl bg-card border-border/80 font-medium"
          />
          {dateFilter && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDateFilter("")}
              className="h-11 rounded-2xl text-xs whitespace-nowrap cursor-pointer"
            >
              {isEn ? "Clear" : "रीसेट"}
            </Button>
          )}
        </div>
      </div>

      {/* Records Table */}
      <div className="mt-6 rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm">
        {activeTab === "sales" ? (
          filteredSales.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <ShoppingCart className="mx-auto h-12 w-12 opacity-40 mb-2" />
              {isEn ? "No sales records found." : "कोई बिक्री रिकॉर्ड नहीं मिला।"}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="divide-y divide-border/60 block md:hidden">
                {filteredSales.map((s) => (
                  <div key={s.id} className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-black text-foreground">
                          {formatProductName(s.product_name)}
                        </h4>
                        <span className="text-[11px] text-muted-foreground">
                          {s.sold_at} • ID: #{s.id.slice(0, 6)}
                        </span>
                      </div>
                      <button
                        onClick={async () => {
                          if (
                            confirm(
                              isEn
                                ? "Are you sure you want to delete this sale? Stock will be reversed automatically."
                                : "क्या आप यह बिक्री हटाना चाहते हैं? सामान का स्टॉक स्वतः वापस जुड़ जाएगा।"
                            )
                          ) {
                            await deleteSale(s.id)
                          }
                        }}
                        className="rounded-xl p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors cursor-pointer"
                        title={isEn ? "Delete sale" : "बिक्री हटाएं"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 p-2.5 rounded-xl border border-border/50">
                      <div>
                        <span className="text-muted-foreground text-[10px] block uppercase font-bold">{isEn ? "Quantity & Rate" : "मात्रा व दर"}</span>
                        <span className="font-bold text-foreground">{s.qty} × {formatINR(s.sell_per_unit)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-[10px] block uppercase font-bold">{isEn ? "Cost Snapshot" : "लागत दर"}</span>
                        <span className="font-medium text-muted-foreground">₹{s.cost_at_sale}/unit</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">{isEn ? "Total Sale" : "कुल बिक्री"}</span>
                        <span className="text-base font-black text-foreground">{formatINR(s.total_sale)}</span>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-black text-emerald-400 border border-emerald-500/20">
                          +{formatINR(s.profit)} {isEn ? "Profit" : "मुनाफा"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto min-w-[700px]">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border/80 bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3.5 sm:px-6 font-bold">{isEn ? "Date" : "तारीख"}</th>
                      <th className="px-4 py-3.5 font-bold">{isEn ? "Product Name" : "सामान का नाम"}</th>
                      <th className="px-4 py-3.5 font-bold text-right">{isEn ? "Qty" : "मात्रा"}</th>
                      <th className="px-4 py-3.5 font-bold text-right">{isEn ? "Sell Rate" : "बिक्री दर"}</th>
                      <th className="px-4 py-3.5 font-bold text-right">{isEn ? "Cost Snapshot" : "लागत स्नैपशॉट"}</th>
                      <th className="px-4 py-3.5 font-bold text-right">{isEn ? "Total Sale" : "कुल बिक्री"}</th>
                      <th className="px-4 py-3.5 font-bold text-right">{isEn ? "Profit" : "मुनाफा"}</th>
                      <th className="px-4 py-3.5 sm:px-6 font-bold text-center">{isEn ? "Action" : "एक्शन"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredSales.map((s) => (
                      <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-4 sm:px-6 text-xs text-muted-foreground font-medium">
                          {s.sold_at}
                        </td>
                        <td className="px-4 py-4 font-bold text-foreground">
                          {formatProductName(s.product_name)}
                        </td>
                        <td className="px-4 py-4 text-right font-medium">
                          {s.qty}
                        </td>
                        <td className="px-4 py-4 text-right font-medium text-foreground">
                          {formatINR(s.sell_per_unit)}
                        </td>
                        <td className="px-4 py-4 text-right text-xs text-muted-foreground">
                          ₹{s.cost_at_sale}
                        </td>
                        <td className="px-4 py-4 text-right font-black text-foreground">
                          {formatINR(s.total_sale)}
                        </td>
                        <td className="px-4 py-4 text-right font-black text-emerald-800 dark:text-emerald-300">
                          +{formatINR(s.profit)}
                        </td>
                        <td className="px-4 py-4 sm:px-6 text-center">
                          <button
                            onClick={async () => {
                              if (
                                confirm(
                                  isEn
                                    ? "Are you sure you want to delete this sale? Stock will be reversed automatically."
                                    : "क्या आप यह बिक्री हटाना चाहते हैं? सामान का स्टॉक स्वतः वापस जुड़ जाएगा।"
                                )
                              ) {
                                await deleteSale(s.id)
                              }
                            }}
                            className="rounded-full p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )
        ) : (
          filteredPurchases.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <ShoppingBag className="mx-auto h-12 w-12 opacity-40 mb-2" />
              {isEn ? "No purchase records found." : "कोई खरीद रिकॉर्ड नहीं मिला।"}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="divide-y divide-border/60 block md:hidden">
                {filteredPurchases.map((p) => (
                  <div key={p.id} className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-black text-foreground">
                          {formatProductName(p.product_name)}
                        </h4>
                        <span className="text-[11px] text-muted-foreground">
                          {p.purchased_at} {p.supplier ? `• ${p.supplier}` : ""}
                        </span>
                      </div>
                      <button
                        onClick={async () => {
                          if (
                            confirm(
                              isEn
                                ? "Are you sure you want to delete this purchase record? Stock will be reversed automatically."
                                : "क्या आप यह खरीद रिकॉर्ड हटाना चाहते हैं? सामान का स्टॉक स्वतः वापस कम हो जाएगा।"
                            )
                          ) {
                            await deletePurchase(p.id)
                          }
                        }}
                        className="rounded-xl p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors cursor-pointer"
                        title={isEn ? "Delete purchase" : "खरीद हटाएं"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 p-2.5 rounded-xl border border-border/50">
                      <div>
                        <span className="text-muted-foreground text-[10px] block uppercase font-bold">{isEn ? "Intake Quantity" : "खरीदी मात्रा"}</span>
                        <span className="font-bold text-foreground">{p.qty} units</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-[10px] block uppercase font-bold">{isEn ? "Buy Rate" : "खरीद दर"}</span>
                        <span className="font-bold text-foreground">{formatINR(p.cost_per_unit)}/unit</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">{isEn ? "Total Wholesale Cost" : "कुल खरीद लागत"}</span>
                      <span className="text-base font-black text-foreground">{formatINR(p.total_cost)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto min-w-[700px]">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border/80 bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3.5 sm:px-6 font-bold">{isEn ? "Date" : "तारीख"}</th>
                      <th className="px-4 py-3.5 font-bold">{isEn ? "Product Name" : "सामान का नाम"}</th>
                      <th className="px-4 py-3.5 font-bold">{isEn ? "Supplier" : "सप्लायर"}</th>
                      <th className="px-4 py-3.5 font-bold text-right">{isEn ? "Qty" : "मात्रा"}</th>
                      <th className="px-4 py-3.5 font-bold text-right">{isEn ? "Buy Rate" : "खरीद दर"}</th>
                      <th className="px-4 py-3.5 font-bold text-right">{isEn ? "Total Cost" : "कुल लागत"}</th>
                      <th className="px-4 py-3.5 sm:px-6 font-bold text-center">{isEn ? "Action" : "एक्शन"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredPurchases.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-4 sm:px-6 text-xs text-muted-foreground font-medium">
                          {p.purchased_at}
                        </td>
                        <td className="px-4 py-4 font-bold text-foreground">
                          {formatProductName(p.product_name)}
                        </td>
                        <td className="px-4 py-4 text-xs text-muted-foreground">
                          {p.supplier || "—"}
                        </td>
                        <td className="px-4 py-4 text-right font-medium">
                          {p.qty}
                        </td>
                        <td className="px-4 py-4 text-right font-medium text-foreground">
                          {formatINR(p.cost_per_unit)}
                        </td>
                        <td className="px-4 py-4 text-right font-black text-foreground">
                          {formatINR(p.total_cost)}
                        </td>
                        <td className="px-4 py-4 sm:px-6 text-center">
                          <button
                            onClick={async () => {
                              if (
                                confirm(
                                  isEn
                                    ? "Are you sure you want to delete this purchase record? Stock will be reversed automatically."
                                    : "क्या आप यह खरीद रिकॉर्ड हटाना चाहते हैं? सामान का स्टॉक स्वतः वापस कम हो जाएगा।"
                                )
                              ) {
                                await deletePurchase(p.id)
                              }
                            }}
                            className="rounded-full p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )
        )}
      </div>
    </div>
  )
}
