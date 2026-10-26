"use client"

import * as React from "react"
import Link from "next/link"
import {
  ShoppingBag,
  Plus,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  X,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore } from "@/lib/store"
import { useTranslation } from "@/lib/i18n"
import { calculateWeightedAverage, formatINR } from "@/lib/calc"
import { purchaseSchema } from "@/lib/validators"

export default function PurchasesPage() {
  const { products, purchases, addPurchase, deletePurchase } = useStore()
  const { t, isEn, formatProductName } = useTranslation()

  // Form State
  const [selectedProductId, setSelectedProductId] = React.useState(
    products[0]?.id || ""
  )
  const [qty, setQty] = React.useState("")
  const [costPerUnit, setCostPerUnit] = React.useState("")
  const [supplier, setSupplier] = React.useState("")
  const [purchasedAt, setPurchasedAt] = React.useState("2026-10-25")
  React.useEffect(() => {
    setPurchasedAt(new Date().toISOString().split("T")[0])
  }, [])

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [successToast, setSuccessToast] = React.useState<string | null>(null)

  // Selected Product details
  const selectedProduct = React.useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || products[0]
  }, [products, selectedProductId])

  // When selected product changes, autofill cost if available
  React.useEffect(() => {
    if (selectedProduct && selectedProduct.avg_cost > 0 && !costPerUnit) {
      setCostPerUnit(selectedProduct.avg_cost.toString())
    }
  }, [selectedProduct])

  // Live Preview Calculation
  const livePreview = React.useMemo(() => {
    if (!selectedProduct) return null
    const q = Number(qty) || 0
    const cost = Number(costPerUnit) || 0

    const totalCost = Math.round(q * cost * 100) / 100
    const { newStock, newAvgCost } = calculateWeightedAverage(
      selectedProduct.stock_qty,
      selectedProduct.avg_cost,
      q,
      cost
    )

    return { totalCost, newStock, newAvgCost }
  }, [selectedProduct, qty, costPerUnit])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    try {
      const parsed = purchaseSchema.parse({
        product_id: selectedProductId,
        qty: Number(qty),
        cost_per_unit: Number(costPerUnit),
        supplier: supplier.trim() || undefined,
        purchased_at: purchasedAt,
      })

      const newRecord = addPurchase({
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
    } catch (err: any) {
      if (err.errors && err.errors[0]) {
        setErrorMsg(err.errors[0].message)
      } else {
        setErrorMsg(
          err.message ||
            (isEn
              ? "Please fill all details correctly"
              : "कृपया सभी विवरण सही से भरें")
        )
      }
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
              ? "Stock & weighted average buy rate will update automatically"
              : "स्टॉक और औसत खरीद दर स्वतः अपडेट होगी"}
          </p>
        </div>
      </div>

      {/* Success Banner */}
      {successToast && (
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 p-3.5 text-sm font-bold text-emerald-800 dark:text-emerald-300 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-700" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Form: Purchase Input */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-emerald-700" />
              {isEn ? "Record New Purchase" : "खरीद विवरण भरें"}
            </h2>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {errorMsg && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                  {errorMsg}
                </div>
              )}

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
                    if (p && p.avg_cost > 0)
                      setCostPerUnit(p.avg_cost.toString())
                  }}
                  className="mt-1 flex h-11 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm font-semibold ring-offset-background focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {formatProductName(p.name)} ({isEn ? "Stock:" : "स्टॉक:"}{" "}
                      {p.stock_qty} {p.unit} | {isEn ? "Buy Rate:" : "खरीद दर:"} ₹
                      {p.avg_cost})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity and Unit Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="qty" className="text-xs font-bold">
                    {isEn ? "Quantity" : "मात्रा"} (
                    {selectedProduct?.unit || (isEn ? "Unit" : "इकाई")}) *
                  </Label>
                  <Input
                    id="qty"
                    type="number"
                    step="0.001"
                    inputMode="decimal"
                    placeholder="50"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    required
                    className="mt-1 h-11 rounded-2xl font-bold"
                  />
                </div>

                <div>
                  <Label htmlFor="cost" className="text-xs font-bold">
                    {isEn ? "Buy Rate (Cost/Unit)" : "खरीद दर"} ₹ *
                  </Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="48.00"
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(e.target.value)}
                    required
                    className="mt-1 h-11 rounded-2xl font-bold"
                  />
                </div>
              </div>

              {/* Supplier & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier" className="text-xs font-bold">
                    {isEn ? "Supplier Name" : "सप्लायर का नाम"}
                  </Label>
                  <Input
                    id="supplier"
                    placeholder={
                      isEn
                        ? "e.g. Kisan Mandi, Wholesale Traders"
                        : "उदा. किसान मंडी, ट्रेडर्स"
                    }
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="mt-1 h-11 rounded-2xl"
                  />
                </div>

                <div>
                  <Label htmlFor="date" className="text-xs font-bold">
                    {isEn ? "Date" : "तारीख"} *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={purchasedAt}
                    onChange={(e) => setPurchasedAt(e.target.value)}
                    required
                    className="mt-1 h-11 rounded-2xl font-medium"
                  />
                </div>
              </div>

              {/* LIVE PREVIEW BOX */}
              {livePreview && Number(qty) > 0 && Number(costPerUnit) > 0 && (
                <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/40 p-4 animate-in fade-in">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4" />
                    {isEn ? "Live Preview" : "लाइव प्रिव्यू"}
                  </span>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground">
                        {isEn ? "Total Purchase Cost" : "कुल खरीद लागत"}
                      </span>
                      <p className="text-xl font-bold text-foreground">
                        {formatINR(livePreview.totalCost)}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs text-muted-foreground">
                        {isEn ? "New Avg Buy Rate" : "नया औसत रेट"}
                      </span>
                      <p className="text-xl font-bold text-emerald-800 dark:text-emerald-300">
                        {formatINR(livePreview.newAvgCost)} /{" "}
                        {selectedProduct?.unit}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold h-12 rounded-full shadow-md text-base cursor-pointer"
                >
                  {isEn ? "Save Purchase" : "खरीद सेव करें"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Recent Purchases List */}
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
                        </p>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="text-sm font-black text-foreground">
                            {formatINR(p.total_cost)}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                isEn
                                  ? "Are you sure you want to delete this purchase record? Stock will be reversed automatically."
                                  : "क्या आप यह खरीद रिकॉर्ड हटाना चाहते हैं? सामान का स्टॉक स्वतः वापस कम हो जाएगा।"
                              )
                            ) {
                              deletePurchase(p.id)
                            }
                          }}
                          className="text-muted-foreground hover:text-red-600 transition-colors p-1 cursor-pointer"
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
