"use client"

import * as React from "react"
import Link from "next/link"
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  TrendingUp,
  Tag,
  CheckCircle2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useStore } from "@/lib/store"
import { useTranslation } from "@/lib/i18n"
import { calculateMargin, formatINR } from "@/lib/calc"
import { productSchema } from "@/lib/validators"

export default function ProductsPage() {
  const { products, addProduct } = useStore()
  const { t, isEn, formatProductName, formatCategoryName } = useTranslation()
  const [search, setSearch] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState("ALL")
  const [isAddOpen, setIsAddOpen] = React.useState(false)

  // Form State
  const [formData, setFormData] = React.useState({
    name: "",
    category: "Grains",
    unit: "kg" as "kg" | "g" | "L" | "ml" | "pcs" | "packet",
    sell_price: "",
    avg_cost: "",
    stock_qty: "",
    low_stock_limit: "5",
  })
  const [formError, setFormError] = React.useState<string | null>(null)
  const [successToast, setSuccessToast] = React.useState<string | null>(null)

  // Unique categories normalized for display
  const categories = React.useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => set.add(formatCategoryName(p.category)))
    return ["ALL", ...Array.from(set)]
  }, [products, formatCategoryName])

  // Filtered products
  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      const pName = formatProductName(p.name).toLowerCase()
      const rawName = p.name.toLowerCase()
      const pCat = formatCategoryName(p.category).toLowerCase()
      const rawCat = p.category.toLowerCase()
      const q = search.toLowerCase()

      const matchesSearch =
        pName.includes(q) ||
        rawName.includes(q) ||
        pCat.includes(q) ||
        rawCat.includes(q)

      const matchesCategory =
        selectedCategory === "ALL" ||
        formatCategoryName(p.category) === selectedCategory ||
        p.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [products, search, selectedCategory, formatProductName, formatCategoryName])

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    try {
      const parsed = productSchema.parse({
        name: formData.name.trim(),
        category: formData.category,
        unit: formData.unit,
        sell_price: Number(formData.sell_price),
        avg_cost: formData.avg_cost ? Number(formData.avg_cost) : 0,
        stock_qty: formData.stock_qty ? Number(formData.stock_qty) : 0,
        low_stock_limit: formData.low_stock_limit
          ? Number(formData.low_stock_limit)
          : 5,
      })

      await addProduct({
        name: parsed.name,
        category: parsed.category,
        unit: parsed.unit,
        sell_price: parsed.sell_price,
        avg_cost: parsed.avg_cost,
        stock_qty: parsed.stock_qty,
        low_stock_limit: parsed.low_stock_limit,
      })

      setSuccessToast(`"${parsed.name}" successfully added!`)
      setTimeout(() => setSuccessToast(null), 4000)

      setFormData({
        name: "",
        category: isEn ? "Grains" : "अनाज (Grains)",
        unit: "kg",
        sell_price: "",
        avg_cost: "",
        stock_qty: "",
        low_stock_limit: "5",
      })
      setIsAddOpen(false)
    } catch (err: any) {
      if (err.errors && err.errors[0]) {
        setFormError(err.errors[0].message)
      } else {
        setFormError(err.message || "Please fill all details correctly")
      }
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/70">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl flex items-center gap-2">
            {t("products", isEn ? "Products & Stock" : "सामान सूची")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEn
              ? "Avg Cost (Buy Rate), Sell Rate & Margin %"
              : `${t("buy_rate", "खरीद दर")}, ${t("sell_rate", "बिक्री दर")} एवं ${t("margin_pct", "मार्जिन %")}`}
          </p>
        </div>

        {/* Add Product Button & Drawer */}
        <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
          <SheetTrigger asChild>
            <Button className="bg-white hover:bg-white/90 text-black font-bold rounded-full gap-1.5 shadow-sm px-5 cursor-pointer">
              <Plus className="h-4 w-4 text-black" />
              {t("add_item", isEn ? "+ Add New Product" : "+ नया सामान जोड़ें")}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[90%] sm:max-w-md overflow-y-auto bg-[#0e1218] border-l border-white/10 text-white">
            <SheetHeader className="text-left pb-4 border-b">
              <SheetTitle className="text-lg font-black flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-700" />
                {t("add_item", isEn ? "Add New Product" : "नया सामान जोड़ें")}
              </SheetTitle>
            </SheetHeader>

            <form onSubmit={handleCreateProduct} className="py-4 space-y-4">
              {formError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                  {formError}
                </div>
              )}

              <div>
                <Label htmlFor="name" className="text-xs font-bold">
                  {t("product_name", isEn ? "Product Name" : "सामान का नाम")} *
                </Label>
                <Input
                  id="name"
                  placeholder={isEn ? "e.g. Basmati Rice or Fortune Oil" : "उदा. बासमती चावल या फॉर्च्यून तेल"}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="mt-1 h-11 rounded-2xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="category" className="text-xs font-bold">
                    {t("category", isEn ? "Category" : "कैटेगरी")}
                  </Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="mt-1 flex h-11 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="Grains">{isEn ? "Grains" : "अनाज (Grains)"}</option>
                    <option value="Pulses">{isEn ? "Pulses" : "दालें (Pulses)"}</option>
                    <option value="Oil">{isEn ? "Cooking Oil" : "तेल (Oil)"}</option>
                    <option value="Spices & Salt">{isEn ? "Spices & Salt" : "मसाले व नमक"}</option>
                    <option value="Dairy">{isEn ? "Dairy" : "डेयरी (Dairy)"}</option>
                    <option value="Snacks">{isEn ? "Snacks" : "स्नैक्स (Snacks)"}</option>
                    <option value="Grocery">{isEn ? "Grocery" : "किराना (Grocery)"}</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="unit" className="text-xs font-bold">
                    {t("unit", isEn ? "Unit" : "इकाई")}
                  </Label>
                  <select
                    id="unit"
                    value={formData.unit}
                    onChange={(e: any) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    className="mt-1 flex h-11 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="kg">kg {isEn ? "" : "(किलो)"}</option>
                    <option value="g">g {isEn ? "" : "(ग्राम)"}</option>
                    <option value="L">L {isEn ? "" : "(लीटर)"}</option>
                    <option value="ml">ml {isEn ? "" : "(मिली)"}</option>
                    <option value="packet">packet {isEn ? "" : "(पैकेट)"}</option>
                    <option value="pcs">pcs {isEn ? "" : "(पीस)"}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="sell_price" className="text-xs font-bold">
                    {t("sell_rate", isEn ? "Sell Rate" : "बिक्री दर")} (₹) *
                  </Label>
                  <Input
                    id="sell_price"
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="60.00"
                    value={formData.sell_price}
                    onChange={(e) =>
                      setFormData({ ...formData, sell_price: e.target.value })
                    }
                    required
                    className="mt-1 h-11 rounded-2xl font-bold"
                  />
                </div>

                <div>
                  <Label htmlFor="avg_cost" className="text-xs font-bold">
                    {t("buy_rate", isEn ? "Avg Cost" : "खरीद दर")} (₹)
                  </Label>
                  <Input
                    id="avg_cost"
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="48.00"
                    value={formData.avg_cost}
                    onChange={(e) =>
                      setFormData({ ...formData, avg_cost: e.target.value })
                    }
                    className="mt-1 h-11 rounded-2xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="stock" className="text-xs font-bold">
                    {t("stock", isEn ? "Initial Stock" : "शुरुआती स्टॉक")}
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    step="0.001"
                    inputMode="decimal"
                    placeholder="0"
                    value={formData.stock_qty}
                    onChange={(e) =>
                      setFormData({ ...formData, stock_qty: e.target.value })
                    }
                    className="mt-1 h-11 rounded-2xl"
                  />
                </div>

                <div>
                  <Label htmlFor="low_stock" className="text-xs font-bold">
                    {t("low_stock_alert", isEn ? "Low Stock Threshold" : "अलर्ट सीमा")}
                  </Label>
                  <Input
                    id="low_stock"
                    type="number"
                    step="0.001"
                    inputMode="decimal"
                    placeholder="5"
                    value={formData.low_stock_limit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        low_stock_limit: e.target.value,
                      })
                    }
                    className="mt-1 h-11 rounded-2xl"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold h-12 rounded-full shadow-md cursor-pointer"
                >
                  {t("save_item", isEn ? "Save Product" : "सामान सेव करें")}
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {/* Success Notification Banner */}
      {successToast && (
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 p-3.5 text-sm font-bold text-emerald-800 dark:text-emerald-300 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-700" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search Bar & Category Filter Chips */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search_placeholder", isEn ? "Search product or category..." : "सामान या कैटेगरी खोजें...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-2xl bg-card border-border/80"
          />
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-white text-black shadow-xs"
                  : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-white/10"
              }`}
            >
              {cat === "ALL" ? t("all_categories", isEn ? "All" : "सभी") : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="mt-6 rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-3 text-base font-bold text-foreground">
              {t("no_products_found", isEn ? "No products found" : "कोई सामान नहीं मिला")}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("try_changing_search", isEn ? "Try changing search terms or add a new product above." : "खोज शब्द बदलें या ऊपर दिए गए बटन से नया सामान जोड़ें।")}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Product Cards (Phone Optimized) */}
            <div className="space-y-3 block md:hidden p-3">
              {filteredProducts.map((p) => {
                const { margin, marginPct, badgeColor } = calculateMargin(
                  p.sell_price,
                  p.avg_cost
                )
                const isLowStock = p.stock_qty <= p.low_stock_limit

                return (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl border border-border/80 bg-card space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-foreground flex flex-wrap items-center gap-1.5">
                          <span>{formatProductName(p.name)}</span>
                          {isLowStock && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-red-500/10 text-red-500 text-[9px] font-bold px-1.5 py-0.2 border border-red-500/20">
                              <AlertTriangle className="h-2.5 w-2.5" />
                              {t("low_stock_alert", isEn ? "Low Stock" : "कम स्टॉक")}
                            </span>
                          )}
                        </h4>
                        <span className="text-[10px] text-muted-foreground mt-0.5 block">
                          {formatCategoryName(p.category)}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                          badgeColor === "green"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : badgeColor === "amber"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                        }`}
                      >
                        {marginPct}% Margin
                      </span>
                    </div>

                    <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[9px] text-muted-foreground block uppercase font-mono">Stock</span>
                        <span className={`font-black ${isLowStock ? "text-red-500" : "text-foreground"}`}>
                          {p.stock_qty} {p.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-muted-foreground block uppercase font-mono">Buy Cost</span>
                        <span className="font-semibold text-muted-foreground">{formatINR(p.avg_cost)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-muted-foreground block uppercase font-mono">Sell Rate</span>
                        <span className="font-black text-foreground">{formatINR(p.sell_price)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[650px]">
                <thead className="border-b border-border/80 bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3.5 sm:px-6 font-bold">{t("product_name", isEn ? "Product Name" : "सामान का नाम")}</th>
                    <th className="px-4 py-3.5 font-bold">{t("category", isEn ? "Category" : "कैटेगरी")}</th>
                    <th className="px-4 py-3.5 font-bold text-right">{t("stock", isEn ? "Stock" : "स्टॉक")}</th>
                    <th className="px-4 py-3.5 font-bold text-right">{t("buy_rate", isEn ? "Avg Cost (Buy Rate)" : "खरीद दर")}</th>
                    <th className="px-4 py-3.5 font-bold text-right">{t("sell_rate", isEn ? "Sell Rate" : "बिक्री दर")}</th>
                    <th className="px-4 py-3.5 font-bold text-right">{t("margin", isEn ? "Margin ₹" : "मार्जिन ₹")}</th>
                    <th className="px-4 py-3.5 sm:px-6 font-bold text-center">{t("margin_pct", isEn ? "Margin %" : "मार्जिन %")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredProducts.map((p) => {
                    const { margin, marginPct, badgeColor } = calculateMargin(
                      p.sell_price,
                      p.avg_cost
                    )
                    const isLowStock = p.stock_qty <= p.low_stock_limit

                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-muted/30 transition-colors group"
                      >
                        {/* Name */}
                        <td className="px-4 py-4 sm:px-6 font-bold text-foreground">
                          <div className="flex items-center gap-2">
                            <span>{formatProductName(p.name)}</span>
                            {isLowStock && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-950 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:text-red-400">
                                <AlertTriangle className="h-3 w-3" />
                                {t("low_stock_alert", isEn ? "Low Stock Alert" : "कम स्टॉक")}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-4 text-xs text-muted-foreground">
                          <span className="rounded-full bg-muted px-2.5 py-1 font-semibold">
                            {formatCategoryName(p.category)}
                          </span>
                        </td>

                        {/* Stock */}
                        <td className="px-4 py-4 text-right font-medium">
                          <span
                            className={`font-black ${
                              isLowStock
                                ? "text-red-600 dark:text-red-400"
                                : "text-foreground"
                            }`}
                          >
                            {p.stock_qty} {p.unit}
                          </span>
                        </td>

                        {/* Avg Cost */}
                        <td className="px-4 py-4 text-right text-muted-foreground font-semibold">
                          {formatINR(p.avg_cost)}
                        </td>

                        {/* Sell Rate */}
                        <td className="px-4 py-4 text-right font-black text-foreground">
                          {formatINR(p.sell_price)}
                        </td>

                        {/* Margin Amount */}
                        <td className="px-4 py-4 text-right font-black text-emerald-800 dark:text-emerald-300">
                          +{formatINR(margin)}
                        </td>

                        {/* Margin % Chip */}
                        <td className="px-4 py-4 sm:px-6 text-center">
                          <span
                            className={`inline-block rounded-full px-2.5 py-1 text-xs font-black shadow-2xs ${
                              badgeColor === "green"
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                                : badgeColor === "amber"
                                ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                                : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800"
                            }`}
                          >
                            {marginPct}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
