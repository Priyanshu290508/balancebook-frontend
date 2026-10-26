/**
 * lib/calc.ts — BalanceBook Core Business Logic Formulas & Helpers
 * Follows PRD.md Section 4 and rules.md strictly.
 * 
 * NOTE: The primary business calculations execute in DB triggers.
 * This file provides identical calculations for UI live previews and client validations.
 */

export interface ProductItem {
  id: string
  name: string
  category: string
  unit: string
  sell_price: number
  avg_cost: number
  stock_qty: number
  low_stock_limit: number
  is_active: boolean
}

export interface PurchaseRecord {
  id: string
  product_id: string
  product_name?: string
  supplier?: string
  qty: number
  cost_per_unit: number
  total_cost: number
  purchased_at: string
  created_at: string
}

export interface SaleRecord {
  id: string
  product_id: string
  product_name?: string
  qty: number
  sell_per_unit: number
  cost_at_sale: number
  total_sale: number
  profit: number
  sold_at: string
  created_at: string
}

/**
 * Calculates new weighted average cost after a purchase
 * new_avg = (old_stock * old_avg + new_qty * new_cost) / (old_stock + new_qty)
 */
export function calculateWeightedAverage(
  currentStock: number,
  currentAvgCost: number,
  newQty: number,
  newUnitCost: number
): { newStock: number; newAvgCost: number } {
  const oldStock = Math.max(0, Number(currentStock) || 0)
  const oldAvg = Math.max(0, Number(currentAvgCost) || 0)
  const qty = Math.max(0, Number(newQty) || 0)
  const cost = Math.max(0, Number(newUnitCost) || 0)

  const newStock = oldStock + qty

  if (newStock <= 0) {
    return { newStock: 0, newAvgCost: cost }
  }

  // If old stock was 0, the new avg cost is simply the new purchase cost
  if (oldStock === 0) {
    return { newStock, newAvgCost: cost }
  }

  const totalOldCost = oldStock * oldAvg
  const totalNewCost = qty * cost
  const rawAvg = (totalOldCost + totalNewCost) / newStock

  // Round to 4 decimal places for precision
  const newAvgCost = Math.round(rawAvg * 10000) / 10000

  return { newStock, newAvgCost }
}

/**
 * Calculates profit on a sale
 * sale profit = (sell_per_unit - cost_at_sale) * qty
 */
export function calculateSaleProfit(
  qty: number,
  sellRate: number,
  costAtSale: number
): { totalSale: number; profit: number; marginPerUnit: number; marginPct: number } {
  const q = Math.max(0, Number(qty) || 0)
  const sRate = Math.max(0, Number(sellRate) || 0)
  const cRate = Math.max(0, Number(costAtSale) || 0)

  const totalSale = Math.round(q * sRate * 100) / 100
  const marginPerUnit = Math.round((sRate - cRate) * 100) / 100
  const profit = Math.round(marginPerUnit * q * 100) / 100

  let marginPct = 0
  if (cRate > 0) {
    marginPct = Math.round(((sRate - cRate) / cRate) * 10000) / 100
  }

  return { totalSale, profit, marginPerUnit, marginPct }
}

/**
 * Calculates margin per unit and percentage for product listing
 */
export function calculateMargin(
  sellPrice: number,
  avgCost: number
): { margin: number; marginPct: number; badgeColor: "green" | "amber" | "red" } {
  const sell = Number(sellPrice) || 0
  const cost = Number(avgCost) || 0
  const margin = Math.round((sell - cost) * 100) / 100

  let marginPct = 0
  if (cost > 0) {
    marginPct = Math.round(((sell - cost) / cost) * 1000) / 10
  }

  let badgeColor: "green" | "amber" | "red" = "green"
  if (marginPct >= 20) {
    badgeColor = "green"
  } else if (marginPct >= 10) {
    badgeColor = "amber"
  } else {
    badgeColor = "red"
  }

  return { margin, marginPct, badgeColor }
}

/**
 * Indian Rupee currency formatting (e.g. ₹1,23,456.50)
 */
export function formatINR(amount: number): string {
  const num = Number(amount) || 0
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

const PRODUCT_MAP: Array<{ en: string; hi: string; matchers: (string | RegExp)[] }> = [
  { en: "Basmati Rice", hi: "बासमती चावल", matchers: [/basmati/i, /बासमती/, /चावल/] },
  { en: "Arhar Dal (Toor Dal)", hi: "तूर दाल", matchers: [/arhar/i, /toor/i, /तूर/, /दाल/] },
  { en: "Fortune Mustard Oil", hi: "फॉर्च्यून सरसों तेल", matchers: [/mustard/i, /fortune/i, /सरसों/, /फॉर्च्यून/] },
  { en: "Tata Salt 1kg", hi: "टाटा नमक 1kg", matchers: [/tata/i, /टाटा/, /नमक/] },
  { en: "Aashirvaad Atta 5kg", hi: "आशीर्वाद आटा 5kg", matchers: [/aashirvaad/i, /आशीर्वाद/, /आटा/] },
  { en: "Amul Taaza Milk 500ml", hi: "अमूल ताजा दूध 500ml", matchers: [/amul/i, /अमूल/, /दूध/] },
  { en: "MDH Turmeric 100g", hi: "एमडीएच हल्दी पाउडर 100g", matchers: [/mdh/i, /एमडीएच/, /हल्दी/] },
  { en: "Sugar Regular", hi: "चीनी", matchers: [/sugar/i, /चीनी/] },
  { en: "Parle-G Biscuit 100g", hi: "पारले-जी बिस्कुट 100g", matchers: [/parle/i, /पारले/, /बिस्कुट/] },
  { en: "Rajdhani Besan 500g", hi: "राजधानी बेसन 500g", matchers: [/besan/i, /बेसन/, /राजधानी/] },
]

const CATEGORY_MAP: Array<{ en: string; hi: string; matchers: (string | RegExp)[] }> = [
  { en: "All", hi: "सभी", matchers: [/^all$/i, /^सभी$/i] },
  { en: "Spices & Salt", hi: "मसाले व नमक", matchers: [/spices & salt/i, /मसाले व नमक/] },
  { en: "Grains", hi: "अनाज", matchers: [/grain/i, /अनाज/] },
  { en: "Pulses", hi: "दालें", matchers: [/pulse/i, /दाल/] },
  { en: "Cooking Oil", hi: "तेल", matchers: [/oil/i, /तेल/] },
  { en: "Dairy", hi: "डेयरी", matchers: [/dairy/i, /डेयरी/, /दूध/] },
  { en: "Spices", hi: "मसाले", matchers: [/spice/i, /मसाले/] },
  { en: "Grocery", hi: "किराना", matchers: [/grocer/i, /किराना/] },
  { en: "Snacks", hi: "स्नैक्स", matchers: [/snack/i, /स्नैक्स/, /नमकीन/] },
]

/**
 * Format item name cleanly based on language
 * In "en" (or non-Hindi) mode: returns clean 100% English name (never leaves Hindi script or "(Basmati Rice)" tags)
 * In "hi" mode: returns clean 100% Hindi name (never leaves English tags)
 */
export function formatItemNameByLang(name: string, lang: string = "en"): string {
  if (!name) return ""
  const isEn = lang === "en" || !["hi", "hinglish"].includes(lang)

  // 1. Check parenthesized format like "बासमती चावल (Basmati Rice)"
  const parenMatch = name.match(/^(.*?)\s*\((.*?)\)$/)
  if (parenMatch) {
    const hindiPart = parenMatch[1].trim()
    const englishPart = parenMatch[2].trim()
    if (isEn) return englishPart
    if (lang === "hi") return hindiPart
  }

  // 2. Dictionary lookup
  for (const item of PRODUCT_MAP) {
    if (item.matchers.some((m) => (typeof m === "string" ? name.includes(m) : m.test(name)))) {
      if (isEn) return item.en
      if (lang === "hi") return item.hi
      return item.en
    }
  }

  // 3. Fallback: if in English mode but contains Devanagari, clean out Hindi script
  if (isEn && /[\u0900-\u097F]/.test(name)) {
    const cleaned = name.replace(/[\u0900-\u097F()]/g, "").trim()
    if (cleaned.length > 0) return cleaned
  }

  return name
}

/**
 * Format category cleanly based on language
 * In "en" mode: returns clean English ("Grains", "Pulses", "Spices & Salt", "Cooking Oil", etc.)
 * In "hi" mode: returns clean Hindi ("अनाज", "दालें", "मसाले व नमक", "तेल", etc.)
 */
export function formatCategoryByLang(category: string, lang: string = "en"): string {
  if (!category) return ""
  const isEn = lang === "en" || !["hi", "hinglish"].includes(lang)

  // 1. Check parenthesized format like "अनाज (Grains)"
  const parenMatch = category.match(/^(.*?)\s*\((.*?)\)$/)
  if (parenMatch) {
    const hindiPart = parenMatch[1].trim()
    const englishPart = parenMatch[2].trim()
    if (isEn) return englishPart
    if (lang === "hi") return hindiPart
  }

  // 2. Dictionary lookup
  for (const item of CATEGORY_MAP) {
    if (item.matchers.some((m) => (typeof m === "string" ? category.includes(m) : m.test(category)))) {
      if (isEn) return item.en
      if (lang === "hi") return item.hi
      return item.en
    }
  }

  // 3. Fallback: clean Devanagari in English mode
  if (isEn && /[\u0900-\u097F]/.test(category)) {
    const cleaned = category.replace(/[\u0900-\u097F()]/g, "").trim()
    if (cleaned.length > 0) return cleaned
  }

  return category
}

