"use client"

import * as React from "react"
import Link from "next/link"
import {
  ShoppingBag,
  TrendingDown,
  CheckCircle2,
  X,
  Trash2,
  AlertTriangle,
  PackagePlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore, getTodayDate } from "@/lib/store"
import { useTranslation } from "@/lib/i18n"
import { calculateWeightedAverage, formatINR } from "@/lib/calc"
import { purchaseSchema } from "@/lib/validators"
import { AuthGuard } from "@/lib/auth"

export default function PurchasesPage() {
  return (
    <AuthGuard>
      <PurchasesContent />
    </AuthGuard>
  )
}

function PurchasesContent() {
  const { products, purchases, addPurchase, deletePurchase } = useStore()
  const { t, isEn, formatProductName } = useTranslation()

  // Form State
  const [selectedProductId, setSelectedProductId] = React.useState("")
  const [qty, setQty] = React.useState("")
  const [costPerUnit, setCostPerUnit] = React.useState("")
  const [supplier, setSupplier] = React.useState("")
  const [purchasedAt, setPurchasedAt] = React.useState(getTodayDate())
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [successToast, setSuccessToast] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Ensure default product selection when products load
  React.useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id)
      if (products[0].avg_cost > 0) {
        setCostPerUnit(products[0].avg_cost.toString())
      }
    }
  }, [products, selectedProductId])

  // Selected Product details
  const selectedProduct = React.useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || products[0]
  }, [products, selectedProductId])

  // When selected product changes, autofill cost if available
  React.useEffect(() => {
    if (selectedProduct && selectedProduct.avg_cost > 0 && !costPerUnit) {
      setCostPerUnit(selectedProduct.avg_cost.toString())
    }
  }, [selectedProduct, costPerUnit])

  // Live Preview Calculation
  const livePreview = React.useMemo(() => {
    if (!selectedProduct) return null
    const q = Number(qty) || 0
    const cost = Number(costPerUnit) || 0

    if (q <= 0 || cost < 0) return null

    const totalCost = Math.round(q * cost * 100) / 100
    const { newStock, newAvgCost } = calculateWeightedAverage(
      selectedProduct.stock_qty,
      selectedProduct.avg_cost,
      q,
      cost
    )

    return { totalCost, newStock, newAvgCost }
  }, [selectedProduct, qty, costPerUnit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!selectedProduct) {
      setErrorMsg(isEn ? "Please select a product first." : "कृपया पहले सामान चुनें।")
      return
    }

    try {
      setIsSubmitting(true)
      const parsed = purchaseSchema.parse({
        product_id: selectedProductId,
        qty: Number(qty),
        cost_per_unit: Number(costPerUnit),
        supplier: supplier.trim() || undefined,
        purchased_at: purchasedAt,
      })

      const newRecord = await addPurchase({
        product_id: parsed.product_id,
        qty: parsed.qty,
        cost_per_unit: parsed.cost_per_unit,
        supplier: parsed.supplier,
        purchased_at: parsed.purchased_at,
      })

      const prodName = formatProductName(selectedProduct?.name)
      setSuccessToast(
        `${isEn ? "Purchase Recorded" : "माल खरीदा"}: ${prodName} (${parsed.qty} ${
          selectedProduct?.unit
        }) • ${formatINR(newRecord.total_cost)}`
      )
      setTimeout(() => setSuccessToast(null), 5000)

      // Reset form
      setQty("")
      setCostPerUnit("")
      setSupplier("")
      setPurchasedAt(getTodayDate())
    } catch (err: any) {
      console.error("Purchase submission error:", err)
      if (err.errors && err.errors[0]) {
        setErrorMsg(err.errors[0].message)
      } else {
        setErrorMsg(
          err.message ||
            (isEn
              ? "Failed to save purchase. Please check details."
              : "खरीद सेव नहीं हो पाई। कृपया विवरण जांचें।")
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (purchaseId: string) => {
    if (
      !confirm(
        isEn
          ? "Are you sure you want to delete this purchase? Stock will be reduced automatically."
          : "क्या आप यह खरीद हटाना चाहते हैं? सामान का स्टॉक स्वतः घट जाएगा।"
      )
    ) {
      return
    }

    try {
      setErrorMsg(null)
      await deletePurchase(purchaseId)
      setSuccessToast(isEn ? "Purchase deleted and stock reduced." : "खरीद हटा दी गई और स्टॉक घट गया।")
      setTimeout(() => setSuccessToast(null), 4000)
    } catch (err: any) {
      setErrorMsg(err.message || (isEn ? "Failed to delete purchase." : "खरीद हटाने में त्रुटि।"))
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/70">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl flex items-center gap-2">
            {isEn ? "Record Purchase" : "माल खरीद दर्ज करें"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEn
              ? "Stock & weighted average buy rate will update automatically in Supabase"
              : "स्टॉक और औसत खरीद दर सुपाबेस में स्वतः अपडेट होगी"}
          </p>
        </div>
      </div>

      {/* VISIBLE SUCCESS BANNER */}
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
              <ShoppingBag className="h-4 w-4 text-emerald-700" />
              <span>{isEn ? "Purchase Entry" : "खरीद विवरण"}</span>
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
                    if (p && p.avg_cost > 0) setCostPerUnit(p.avg_cost.toString())
                  }}
                  disabled={products.length === 0}
                  className="mt-1 flex h-11 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm font-semibold ring-offset-background focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {products.length === 0 ? (
                    <option value="">{isEn ? "-- No Products Available --" : "-- कोई सामान नहीं मिला --"}</option>
                  ) : (
                    products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {formatProductName(p.name)} ({isEn ? "Current Stock:" : "मौजूदा स्टॉक:"}{" "}
                        {p.stock_qty} {p.unit} | {isEn ? "Avg Buy:" : "औसत खरीद:"} ₹
                        {p.avg_cost})
                      </option>
                    ))
                  )}
                </select>
                {selectedProduct && (
                  <p className="mt-1 text-xs text-muted-foreground px-1">
                    {isEn ? "Current Stock:" : "वर्तमान स्टॉक:"}{" "}
                    <strong>
                      {selectedProduct.stock_qty} {selectedProduct.unit}
                    </strong>{" "}
                    | {isEn ? "Current Avg Cost:" : "वर्तमान औसत लागत:"}{" "}
                    <strong>₹{selectedProduct.avg_cost}</strong>
                  </p>
                )}
              </div>

              {/* Quantity and Cost Per Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="qty" className="text-xs font-bold">
                    {isEn ? "Quantity Inward" : "खरीदी गई मात्रा"} (
                    {selectedProduct?.unit || (isEn ? "Unit" : "इकाई")}) *
                  </Label>
                  <Input
                    id="qty"
                    type="number"
                    step="0.001"
                    inputMode="decimal"
                    placeholder="10"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    required
                    className="mt-1 h-11 rounded-2xl font-bold"
                  />
                </div>

                <div>
                  <Label htmlFor="cost" className="text-xs font-bold">
                    {isEn ? "Cost Per Unit" : "प्रति इकाई खरीद दर"} ₹ *
                  </Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="45.00"
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(e.target.value)}
                    required
                    className="mt-1 h-11 rounded-2xl font-bold"
                  />
                </div>
              </div>

              {/* Supplier and Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier" className="text-xs font-bold">
                    {isEn ? "Supplier / Mandi" : "सप्लायर / मंडी का नाम"}
                  </Label>
                  <Input
                    id="supplier"
                    type="text"
                    placeholder={isEn ? "e.g. Kisan Mandi" : "उदा. किसान मंडी"}
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="mt-1 h-11 rounded-2xl"
                  />
                </div>

                {/* Editable Date Field (Defaults to Today, saved to purchased_at) */}
                <div>
                  <Label htmlFor="date" className="text-xs font-bold">
                    {isEn ? "Date of Purchase (purchased_at)" : "खरीद की तारीख"} *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={purchasedAt}
                    onChange={(e) => setPurchasedAt(e.target.value)}
                    required
                    className="mt-1 h-11 rounded-2xl font-medium cursor-pointer"
                  />
                </div>
              </div>

              {/* LIVE WEIGHTED AVERAGE CALCULATION PREVIEW */}
              {livePreview && (
                <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 p-4 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground block">
                        {isEn ? "Total Inward Bill" : "कुल खरीद बिल"}
                      </span>
                      <span className="text-lg font-black text-foreground">
                        {formatINR(livePreview.totalCost)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-muted-foreground block">
                        {isEn ? "New Stock" : "नया स्टॉक"}
                      </span>
                      <span className="text-lg font-black text-foreground">
                        {livePreview.newStock} {selectedProduct?.unit}
                      </span>
                    </div>

                    <div className="text-right pl-3 border-l border-border/70">
                      <span className="text-xs text-muted-foreground block">
                        {isEn ? "New Avg Cost" : "नई औसत खरीद दर"}
                      </span>
                      <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                        ₹{livePreview.newAvgCost}
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
                  disabled={isSubmitting || Number(qty) <= 0 || Number(costPerUnit) < 0 || !selectedProduct}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold h-12 rounded-full shadow-md text-base disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting
                    ? isEn
                      ? "Recording Purchase..."
                      : "खरीद दर्ज हो रही है..."
                    : isEn
                    ? "Save Purchase & Update Stock"
                    : "खरीद सेव करें और स्टॉक अपडेट करें"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Recent Purchases Stream */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
            <h2 className="text-base font-bold text-foreground border-b border-border/60 pb-3 flex items-center justify-between">
              <span>{isEn ? "Recent Purchases" : "हालिया खरीद"}</span>
              <span className="text-xs font-bold text-muted-foreground">
                {isEn ? "Total" : "कुल"}: {purchases.length}
              </span>
            </h2>

            <div className="mt-4">
              {purchases.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  {isEn
                    ? "No purchases recorded yet."
                    : "अभी कोई खरीद दर्ज नहीं है।"}
                </p>
              ) : (
                <div className="space-y-3">
                  {purchases.slice(0, 8).map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/20 p-3.5 hover:bg-muted/40 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {formatProductName(p.product_name)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {p.qty} • ₹{p.cost_per_unit} • {p.purchased_at}
                          {p.supplier ? ` • ${p.supplier}` : ""}
                        </p>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        <span className="text-sm font-black text-foreground">
                          {formatINR(p.total_cost)}
                        </span>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-muted-foreground hover:text-red-600 transition-colors p-1 cursor-pointer"
                          title={isEn ? "Delete purchase" : "खरीद हटाएं"}
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
