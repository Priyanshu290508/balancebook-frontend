"use client"

import * as React from "react"
import Link from "next/link"
import {
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  X,
  Trash2,
  PackagePlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore, getTodayDate } from "@/lib/store"
import { useTranslation } from "@/lib/i18n"
import { calculateSaleProfit, formatINR } from "@/lib/calc"
import { saleSchema } from "@/lib/validators"
import { AuthGuard } from "@/lib/auth"

export default function SalesPage() {
  return (
    <AuthGuard>
      <SalesContent />
    </AuthGuard>
  )
}

function SalesContent() {
  const { products, sales, addSale, deleteSale } = useStore()
  const { t, isEn, formatProductName } = useTranslation()

  // Form State
  const [selectedProductId, setSelectedProductId] = React.useState("")
  const [qty, setQty] = React.useState("")
  const [sellPerUnit, setSellPerUnit] = React.useState("")
  const [soldAt, setSoldAt] = React.useState(getTodayDate())
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [successToast, setSuccessToast] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Ensure default product selection when products load
  React.useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id)
      setSellPerUnit(products[0].sell_price.toString())
    }
  }, [products, selectedProductId])

  // Selected product
  const selectedProduct = React.useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || products[0]
  }, [products, selectedProductId])

  // Autofill sell rate when product changes
  React.useEffect(() => {
    if (selectedProduct) {
      setSellPerUnit(selectedProduct.sell_price.toString())
    }
  }, [selectedProduct])

  // Stock Validation Check
  const enteredQty = Number(qty) || 0
  const isOutOfStock = Boolean(
    selectedProduct && enteredQty > selectedProduct.stock_qty
  )

  // Live Profit Preview
  const livePreview = React.useMemo(() => {
    if (!selectedProduct || enteredQty <= 0) return null
    const rate = Number(sellPerUnit) || 0
    return calculateSaleProfit(enteredQty, rate, selectedProduct.avg_cost)
  }, [selectedProduct, enteredQty, sellPerUnit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!selectedProduct) {
      setErrorMsg(isEn ? "Please select a product first." : "कृपया पहले सामान चुनें।")
      return
    }

    if (isOutOfStock) {
      setErrorMsg(
        `${t("insufficient_stock", isEn ? "Insufficient stock!" : "स्टॉक अपर्याप्त है!")} ${
          isEn ? "Available:" : "उपलब्ध:"
        } ${selectedProduct?.stock_qty} ${selectedProduct?.unit}`
      )
      return
    }

    try {
      setIsSubmitting(true)
      const parsed = saleSchema.parse({
        product_id: selectedProductId,
        qty: Number(qty),
        sell_per_unit: Number(sellPerUnit),
        sold_at: soldAt,
      })

      const newSale = await addSale({
        product_id: parsed.product_id,
        qty: parsed.qty,
        sell_per_unit: parsed.sell_per_unit,
        sold_at: parsed.sold_at,
      })

      const prodName = formatProductName(selectedProduct?.name)
      setSuccessToast(
        `${t("sales", isEn ? "Sale" : "बिक्री")}: ${prodName} (${parsed.qty} ${selectedProduct?.unit}) • ${formatINR(
          newSale.total_sale
        )} • +${formatINR(newSale.profit)}`
      )
      setTimeout(() => setSuccessToast(null), 5000)

      // Fast mode: clear qty and reset date back to today
      setQty("")
      setSoldAt(getTodayDate())
    } catch (err: any) {
      console.error("Sale submission error:", err)
      if (err.errors && err.errors[0]) {
        setErrorMsg(err.errors[0].message)
      } else {
        setErrorMsg(
          err.message ||
            (isEn
              ? "Failed to save sale. Please check details."
              : "बिक्री सेव नहीं हो पाई। कृपया विवरण जांचें।")
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (saleId: string) => {
    if (
      !confirm(
        isEn
          ? "Are you sure you want to delete this sale? Stock will be reversed automatically."
          : "क्या आप यह बिक्री हटाना चाहते हैं? सामान का स्टॉक स्वतः वापस जुड़ जाएगा।"
      )
    ) {
      return
    }

    try {
      setErrorMsg(null)
      await deleteSale(saleId)
      setSuccessToast(isEn ? "Sale deleted and stock reversed." : "बिक्री हटा दी गई और स्टॉक वापस जुड़ गया।")
      setTimeout(() => setSuccessToast(null), 4000)
    } catch (err: any) {
      setErrorMsg(err.message || (isEn ? "Failed to delete sale." : "बिक्री हटाने में त्रुटि।"))
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/70">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl flex items-center gap-2">
            {isEn ? "Record Sale" : "बिक्री दर्ज करें"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEn
              ? "Stock will decrease & profit snapshot will be recorded in Supabase"
              : "स्टॉक घटेगा और मुनाफे का स्नैपशॉट सुपाबेस में सेव होगा"}
          </p>
        </div>
      </div>

      {/* VISIBLE SUCCESS TOAST */}
      {successToast && (
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 p-4 text-sm font-bold text-emerald-800 dark:text-emerald-300 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-800 hover:text-emerald-950 p-1 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* VISIBLE ERROR BANNER (Fixes silent failure) */}
      {errorMsg && (
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-800 p-4 text-sm font-bold text-red-800 dark:text-red-300 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-red-800 hover:text-red-950 p-1 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* No Products Alert */}
      {products.length === 0 && (
        <div className="mt-6 rounded-3xl border border-amber-300/60 bg-amber-500/10 p-6 text-center">
          <p className="text-sm font-bold text-amber-500">
            {isEn ? "No products found in store." : "दुकान में अभी कोई सामान मौजूद नहीं है।"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {isEn
              ? "Add your first product or run supabase/seed.sql in your Supabase SQL Editor."
              : "पहले नया सामान जोड़ें या Supabase SQL Editor में seed.sql चलाएं।"}
          </p>
          <div className="mt-4">
            <Link href="/products">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 rounded-full font-bold">
                <PackagePlus className="h-4 w-4" />
                {isEn ? "Add Product" : "नया सामान जोड़ें"}
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
            <h2 className="text-base font-bold text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-emerald-700" />
              <span>{isEn ? "Sale Details" : "बिक्री विवरण"}</span>
            </h2>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Product Select */}
              <div>
                <Label htmlFor="product" className="text-xs font-bold">
                  {isEn ? "Select Product" : "सामान चुनें"} *
                </Label>
                <select
                  id="product"
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value)
                    const p = products.find((x) => x.id === e.target.value)
                    if (p) setSellPerUnit(p.sell_price.toString())
                  }}
                  disabled={products.length === 0}
                  className="mt-1 flex h-11 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm font-semibold ring-offset-background focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {products.length === 0 ? (
                    <option value="">{isEn ? "-- No Products Available --" : "-- कोई सामान नहीं मिला --"}</option>
                  ) : (
                    products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {formatProductName(p.name)} ({isEn ? "Stock:" : "स्टॉक:"}{" "}
                        {p.stock_qty} {p.unit} | {isEn ? "Cost:" : "लागत:"} ₹
                        {p.avg_cost} | {isEn ? "Rate:" : "दर:"} ₹{p.sell_price})
                      </option>
                    ))
                  )}
                </select>
                {selectedProduct && (
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground px-1">
                    <span>
                      {isEn ? "Stock:" : "स्टॉक:"}{" "}
                      <strong
                        className={
                          selectedProduct.stock_qty <= selectedProduct.low_stock_limit
                            ? "text-red-600 font-bold"
                            : "text-emerald-700 font-bold"
                        }
                      >
                        {selectedProduct.stock_qty} {selectedProduct.unit}
                      </strong>
                    </span>
                    <span>
                      {isEn ? "Buy Rate (Avg Cost):" : "खरीद लागत:"}{" "}
                      <strong>₹{selectedProduct.avg_cost}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Quantity and Sell Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="qty" className="text-xs font-bold">
                    {isEn ? "Quantity" : "मात्रा"} ({selectedProduct?.unit || (isEn ? "Unit" : "इकाई")}) *
                  </Label>
                  <Input
                    id="qty"
                    type="number"
                    step="0.001"
                    inputMode="decimal"
                    placeholder="2"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    required
                    className={`mt-1 h-11 rounded-2xl font-bold ${
                      isOutOfStock
                        ? "border-red-500 focus-visible:ring-red-500 bg-red-50/50"
                        : ""
                    }`}
                  />
                  {isOutOfStock && (
                    <p className="mt-1 text-xs font-bold text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {isEn
                        ? "Cannot enter quantity greater than current stock!"
                        : "स्टॉक से ज्यादा मात्रा दर्ज नहीं कर सकते!"}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="rate" className="text-xs font-bold">
                    {isEn ? "Sell Rate" : "बिक्री दर"} ₹ *
                  </Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="60.00"
                    value={sellPerUnit}
                    onChange={(e) => setSellPerUnit(e.target.value)}
                    required
                    className="mt-1 h-11 rounded-2xl font-bold"
                  />
                </div>
              </div>

              {/* Editable Date Field (Defaults to Today, saved to sold_at) */}
              <div>
                <Label htmlFor="date" className="text-xs font-bold">
                  {isEn ? "Date of Sale (sold_at)" : "बिक्री की तारीख"} *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={soldAt}
                  onChange={(e) => setSoldAt(e.target.value)}
                  required
                  className="mt-1 h-11 rounded-2xl font-medium max-w-xs cursor-pointer"
                />
              </div>

              {/* LIVE PROFIT & MARGIN PREVIEW */}
              {livePreview && enteredQty > 0 && (
                <div
                  className={`rounded-2xl border p-4 transition-all ${
                    isOutOfStock
                      ? "border-red-300 bg-red-50/60"
                      : "border-emerald-200 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground block">
                        {isEn ? "Total Sale" : "कुल बिक्री"}
                      </span>
                      <span className="text-lg font-black text-foreground">
                        {formatINR(livePreview.totalSale)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-muted-foreground block">
                        {isEn ? "Net Profit" : "शुद्ध मुनाफा"}
                      </span>
                      <span
                        className={`text-lg font-black ${
                          livePreview.profit >= 0
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-red-600"
                        }`}
                      >
                        {livePreview.profit >= 0 ? "+" : ""}
                        {formatINR(livePreview.profit)}
                      </span>
                    </div>

                    <div className="text-right pl-3 border-l border-border/70">
                      <span className="text-xs text-muted-foreground block">
                        {isEn ? "Margin %" : "मार्जिन %"}
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {livePreview.marginPct}% {isEn ? "Margin" : "मार्जिन"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting || isOutOfStock || enteredQty <= 0 || !selectedProduct}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold h-12 rounded-full shadow-md text-base disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting
                    ? isEn
                      ? "Saving Sale..."
                      : "बिक्री सेव हो रही है..."
                    : isEn
                    ? "Save Sale"
                    : "बिक्री सेव करें"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Recent Sales Stream */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
            <h2 className="text-base font-bold text-foreground border-b border-border/60 pb-3 flex items-center justify-between">
              <span>{isEn ? "Recent Sales" : "हालिया बिक्री"}</span>
              <span className="text-xs font-bold text-muted-foreground">
                {isEn ? "Total" : "कुल"}: {sales.length}
              </span>
            </h2>

            <div className="mt-4">
              {sales.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  {isEn
                    ? "No sales recorded yet."
                    : "अभी कोई बिक्री दर्ज नहीं है।"}
                </p>
              ) : (
                <div className="space-y-3">
                  {sales.slice(0, 8).map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/20 p-3.5 hover:bg-muted/40 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {formatProductName(s.product_name)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {s.qty} • ₹{s.sell_per_unit} • {s.sold_at}
                        </p>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="text-sm font-black text-foreground">
                            {formatINR(s.total_sale)}
                          </p>
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                            +{formatINR(s.profit)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="text-muted-foreground hover:text-red-600 transition-colors p-1 cursor-pointer"
                          title={isEn ? "Delete sale" : "बिक्री हटाएं"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
