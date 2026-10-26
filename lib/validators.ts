import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(2, "नाम कम से कम 2 अक्षरों का होना चाहिए (Min 2 chars)"),
  category: z.string().min(1, "कैटेगरी चुनें (Select category)"),
  unit: z.enum(["kg", "g", "L", "ml", "pcs", "packet"], {
    message: "यूनिट चुनें (Select valid unit)",
  }),
  sell_price: z.number().positive("बिक्री दर 0 से अधिक होनी चाहिए (Sell price > 0)"),
  avg_cost: z.number().nonnegative("खरीद दर 0 या अधिक होनी चाहिए (Cost >= 0)").default(0),
  stock_qty: z.number().nonnegative("शुरुआती स्टॉक 0 या अधिक होना चाहिए (Stock >= 0)").default(0),
  low_stock_limit: z.number().nonnegative("कम स्टॉक लिमिट तय करें (Threshold >= 0)").default(5),
})

export const purchaseSchema = z.object({
  product_id: z.string().min(1, "सामान चुनें (Select product)"),
  qty: z.number().positive("मात्रा 0 से अधिक होनी चाहिए (Quantity > 0)"),
  cost_per_unit: z.number().nonnegative("खरीद दर 0 या अधिक होनी चाहिए (Cost >= 0)"),
  supplier: z.string().optional(),
  purchased_at: z.string().min(1, "तारीख चुनें (Select date)"),
})

export const saleSchema = z.object({
  product_id: z.string().min(1, "सामान चुनें (Select product)"),
  qty: z.number().positive("मात्रा 0 से अधिक होनी चाहिए (Quantity > 0)"),
  sell_per_unit: z.number().positive("बिक्री दर 0 से अधिक होनी चाहिए (Sell rate > 0)"),
  sold_at: z.string().min(1, "तारीख चुनें (Select date)"),
})

export type ProductInput = z.infer<typeof productSchema>
export type PurchaseInput = z.infer<typeof purchaseSchema>
export type SaleInput = z.infer<typeof saleSchema>
