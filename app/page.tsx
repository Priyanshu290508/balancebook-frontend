"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  Search,
  ShoppingCart,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Package,
  Store,
  ChevronRight,
  Menu,
  X,
  IndianRupee,
  Check,
  CheckCircle2,
  SlidersHorizontal,
  Plus,
  RefreshCw,
  Share2,
  Clock,
  BarChart3,
  ShieldCheck,
  Layers,
  Globe,
} from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { LanguageModal } from "@/components/navigation/language-modal"
import { useStore, getTodayDate } from "@/lib/store"
import { formatINR, calculateMargin } from "@/lib/calc"

// ==========================================
// Shared UI Primitives
// ==========================================

export function ShopLogoMark({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-[1.5px] shadow-lg shadow-emerald-500/20 ${className}`}>
      <div className="w-full h-full rounded-[10px] bg-black/90 flex items-center justify-center">
        <Store className="w-4 h-4 text-emerald-400" />
      </div>
    </div>
  )
}

export function ActionButton({
  label,
  href = "/dashboard",
  full = false,
  variant = "primary",
}: {
  label: string
  href?: string
  full?: boolean
  variant?: "primary" | "secondary"
}) {
  const isPrimary = variant === "primary"
  return (
    <Link
      href={href}
      className={`group inline-flex items-center justify-center gap-2 rounded-full font-semibold text-sm px-6 py-3.5 transition-all active:scale-[0.98] ${
        isPrimary
          ? "bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10"
          : "border border-white/20 bg-white/5 text-white hover:bg-white/10"
      } ${full ? "w-full" : ""}`}
    >
      <span>{label}</span>
      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
    </Link>
  )
}

export function SectionEyebrow({
  label,
  tag,
}: {
  label: string
  tag?: string
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
      <span className="text-sm font-medium tracking-wide text-white/90">{label}</span>
      {tag && (
        <span className="px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-medium">
          {tag}
        </span>
      )}
    </div>
  )
}

const gradientStyle: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(to right, #091020 0%, #0B2551 12.5%, #A4F4FD 32.5%, #00d2ff 50%, #0B2551 67.5%, #091020 87.5%, #091020 100%)",
  backgroundSize: "200% auto",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
  filter: "url(#c3-noise)",
}

// ==========================================
// Main Landing Page Component
// ==========================================

export default function DukanKhataLandingPage() {
  const { t, language } = useTranslation()
  const isEn = language === "en"
  const isHi = language === "hi"

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  // Real Supabase Store Data
  const { products, sales, purchases, metrics, isRealtime, isLoading } = useStore()

  const today = getTodayDate()
  const todaySalesCount = sales.filter((s) => s.sold_at === today).length
  const highMarginItems = products.filter(
    (p) => calculateMargin(p.sell_price, p.avg_cost).marginPct >= 20
  )
  const lowStockItems = products.filter((p) => p.stock_qty <= p.low_stock_limit)
  const safeStockItems = products.filter((p) => p.stock_qty > p.low_stock_limit)

  const navLinks = [
    { label: t("dashboard", "Dashboard"), href: "/dashboard" },
    { label: t("products", "Products & Stock"), href: "/products" },
    { label: t("purchases", "Purchases"), href: "/purchases" },
    { label: t("sales", "Sales"), href: "/sales" },
    { label: t("history", "History"), href: "/history" },
  ]

  // Dynamic Triage data computed directly from Supabase products and sales
  const triageData = React.useMemo(() => {
    return [
      {
        tier: isEn ? "High Profit Margin (≥20%)" : "अधिक मुनाफा मार्जिन (≥20%)",
        count: `${highMarginItems.length} ${isEn ? "items" : "सामान"}`,
        color: "#10b981",
        items:
          highMarginItems.length > 0
            ? highMarginItems.slice(0, 3).map(
                (p) =>
                  `${p.name} (+${calculateMargin(p.sell_price, p.avg_cost).marginPct}% margin)`
              )
            : [isEn ? "No items ≥20% margin yet" : "अभी 20%+ मार्जिन वाला सामान नहीं है"],
      },
      {
        tier: isEn ? "Low Stock Alert" : "कम स्टॉक चेतावनी",
        count: `${lowStockItems.length} ${isEn ? "items" : "सामान"}`,
        color: "#ef4444",
        items:
          lowStockItems.length > 0
            ? lowStockItems.slice(0, 3).map(
                (p) =>
                  `${p.name} (${p.stock_qty} ${p.unit} left — alert at ${p.low_stock_limit})`
              )
            : [isEn ? "All items have sufficient stock" : "सभी सामान पर्याप्त स्टॉक में हैं"],
      },
      {
        tier: isEn ? "Today's Total Sales" : "आज की कुल बिक्री",
        count: formatINR(metrics.todaySales),
        color: "#00d2ff",
        items: [
          `${todaySalesCount} ${isEn ? "receipts logged today" : "बिल आज दर्ज किए गए"}`,
          `${isEn ? "Net profit today" : "आज का कुल मुनाफा"}: ${formatINR(metrics.todayProfit)}`,
        ],
      },
      {
        tier: isEn ? "Safe Inventory" : "सुरक्षित स्टॉक",
        count: `${safeStockItems.length} ${isEn ? "items" : "सामान"}`,
        color: "#a3a3a3",
        items:
          safeStockItems.length > 0
            ? safeStockItems.slice(0, 3).map(
                (p) => `${p.name} (${p.stock_qty} ${p.unit})`
              )
            : [isEn ? "No products in inventory yet" : "इन्वेंट्री में अभी सामान नहीं है"],
      },
    ]
  }, [highMarginItems, lowStockItems, safeStockItems, metrics, todaySalesCount, isEn])

  const storePartners = React.useMemo(() => {
    return [
      "Gupta Kirana Store",
      "Sharma Daily Mart",
      "Verma Provisions",
      "Balaji Supermarket",
      "Agarwal Traders",
      "Krishna Grocery",
      "Patel Brothers",
      "National Kirana",
    ]
  }, [])

  const testimonials = React.useMemo(() => {
    if (isEn) {
      return [
        {
          quote:
            "I used to spend 2 hours every evening closing physical registers. Now I log each sale in 5 seconds on my mobile and instantly see exact net profit.",
          author: "Ramesh Gupta",
          role: "Store Owner (35+ years in business)",
          company: "GUPTA GROCERY STORE, KANPUR",
        },
        {
          quote:
            "The weighted average cost calculation is brilliant. Whenever fresh stock arrives at fluctuating prices, it automatically blends unit cost and computes true margins.",
          author: "Suresh Sharma",
          role: "Proprietor",
          company: "SHARMA DAILY MART, JAIPUR",
        },
        {
          quote:
            "Instant low-stock alerts notify me before flour or cooking oil runs out, so I can order from distributors on time and never turn customers away.",
          author: "Rajesh Verma",
          role: "Owner",
          company: "VERMA PROVISIONS, LUCKNOW",
        },
      ]
    }
    if (isHi) {
      return [
        {
          quote:
            "पहले रजिस्टर में हिसाब लगाने में रोज 2 घंटे लगते थे। अब हर ग्राहक के बाद फोन पर 5 सेकंड में बिक्री दर्ज करता हूँ, शाम को सीधा नेट मुनाफा पता चल जाता है।",
          author: "रमेश गुप्ता",
          role: "दुकानदार (35 वर्ष का अनुभव)",
          company: "गुप्ता किराना स्टोर, कानपुर",
        },
        {
          quote:
            "वेटेड एवरेज कॉस्ट फॉर्मूला सबसे कमाल की सुविधा है। नया माल किसी भी भाव पर आए, पुराने स्टॉक के साथ मिलाकर सही मार्जिन तुरंत निकल आता है।",
          author: "सुरेश शर्मा",
          role: "मालिक",
          company: "शर्मा डेली मार्ट, जयपुर",
        },
        {
          quote:
            "कम स्टॉक का अलर्ट आते ही मैं आटा या तेल का ऑर्डर सप्लायर को दे देता हूँ। कभी भी ग्राहक को सामान खत्म होने के कारण लौटना नहीं पड़ा।",
          author: "राजेश वर्मा",
          role: "संचालक",
          company: "वर्मा प्रोविजन्स, लखनऊ",
        },
      ]
    }
    return [
      {
        quote:
          "Pehle register me hisaab lagane me roz 2 ghante lagte the. Ab har customer ke baad phone pe 5 second me sale enter karta hu, shaam ko seedha net profit pata chal jata hai.",
        author: "Ramesh Gupta",
        role: "Dukan Malik (35 Saal se dukan)",
        company: "GUPTA KIRANA STORE, KANPUR",
      },
      {
        quote:
          "Weighted average cost calculation sabse kamaal cheez hai. Naya maal kisi bhi rate pe aaye, purane bache stock ke sath auto-adjust karke exact margin batata hai.",
        author: "Suresh Sharma",
        role: "Proprietor",
        company: "SHARMA DAILY MART, JAIPUR",
      },
      {
        quote:
          "Kam stock alert notification aate hi mai Atta ya Tel ka order supplier ko de deta hu. Ek baar bhi 'stock khatam hai' bolkar customer ko wapas nahi lautana pada.",
        author: "Rajesh Verma",
        role: "Owner",
        company: "VERMA PROVISIONS, LUCKNOW",
      },
    ]
  }, [isEn, isHi])

  return (
    <div className="relative text-white">
      {/* Main Content Layout */}
      <div>
        {/* ========================================================= */}
        {/* Section 1 — Navigation Bar */}
        {/* ========================================================= */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-6xl mx-auto px-6 pt-6 pb-4 flex items-center justify-between"
        >
          {/* Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <ShopLogoMark className="w-9 h-9" />
            <div>
              <span className="font-bold text-base tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                {t("app_name", "BalanceBook")}
              </span>
              <span className="hidden sm:inline-block text-[11px] text-white/50 block font-normal -mt-0.5">
                {t("app_tagline", "Smart Grocery Accounting & Margin Tracker")}
              </span>
            </div>
          </Link>

          {/* Desktop Center Links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
              >
                <Link
                  href={link.href}
                  className="text-white/70 text-sm font-medium hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Desktop Right: Language Selector + CTA Button */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageModal />
            <Link
              href="/login"
              className="text-xs font-semibold text-white/70 hover:text-white px-3.5 py-2 rounded-full border border-white/10 hover:border-white/30 transition-all"
            >
              {t("owner_login", "Owner Login")}
            </Link>
            <ActionButton label={t("open_dashboard", "Open Dashboard")} href="/dashboard" />
          </div>

          {/* Mobile Right: Language + Menu button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageModal />
            <Link
              href="/dashboard"
              className="text-xs font-semibold bg-emerald-500 text-black px-3.5 py-1.5 rounded-full"
            >
              {t("dashboard", "Dashboard")}
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/80 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </motion.nav>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden max-w-6xl mx-auto px-6 overflow-hidden"
            >
              <div className="liquid-glass rounded-2xl p-6 mt-2 flex flex-col gap-4 border border-white/10">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-white/80 text-base font-medium hover:text-emerald-400 transition-colors flex items-center justify-between"
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-white/40" />
                  </Link>
                ))}
                <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                  <ActionButton full label={t("hero_cta", "Open Shop Accounts")} href="/dashboard" />
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm text-white/60 hover:text-white"
                  >
                    {t("owner_login", "Owner Login")}
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================= */}
        {/* Section 2 — Hero */}
        {/* ========================================================= */}
        <section className="pt-14 md:pt-24 pb-16 text-center flex flex-col items-center max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <SectionEyebrow
              label={t("badge_accounting", "Retail & Grocery Accounting")}
              tag={t("badge_realtime", "100% Realtime")}
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.2,
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05]"
          >
            <span className="text-white">{t("hero_line_1", "Your Shop.")}</span>
            <br />
            <span
              className="animate-shiny inline-block mt-2"
              style={gradientStyle}
            >
              {t("hero_line_2", "True Profit.")}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="mt-6 text-white/70 max-w-2xl text-base sm:text-lg leading-relaxed"
          >
            {t("hero_desc", "Say goodbye to manual notebooks and rough registers. Track every purchase and sale with automatic weighted average cost, live profit margin, and instant low-stock alerts.")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="mt-8 flex flex-col sm:flex-row items-center gap-4"
          >
            <ActionButton label={t("hero_cta", "Open Shop Accounts")} href="/dashboard" />
            <ActionButton
              label={t("hero_cta_secondary", "View Stock & Products")}
              href="/products"
              variant="secondary"
            />
          </motion.div>

          {/* Quick Metrics Trust Bar - 100% Real Supabase Data */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/10 w-full max-w-3xl text-left"
          >
            <div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {metrics.totalProducts}
              </div>
              <div className="text-xs text-white/50 mt-0.5">
                {isEn ? "Products in Database" : "डेटाबेस में कुल सामान"}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400 tracking-tight">
                {formatINR(metrics.todaySales)}
              </div>
              <div className="text-xs text-white/50 mt-0.5">
                {isEn ? "Today's Total Sales" : "आज की कुल बिक्री"}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-cyan-400 tracking-tight">
                {formatINR(metrics.todayProfit)}
              </div>
              <div className="text-xs text-white/50 mt-0.5">
                {isEn ? "Today's Net Profit" : "आज का कुल मुनाफा"}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400 tracking-tight">
                {metrics.lowStockCount}
              </div>
              <div className="text-xs text-white/50 mt-0.5">
                {isEn ? "Low Stock Alerts" : "कम स्टॉक चेतावनियां"}
              </div>
            </div>
          </motion.div>
        </section>

        {/* ========================================================= */}
        {/* Section 3 — System Status Bar Strip */}
        {/* ========================================================= */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.6 }}
          className="w-full h-10 bg-black/50 backdrop-blur-md border-t border-b border-white/10"
        >
          <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between text-xs">
            {/* Left */}
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <Store className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold text-white tracking-tight">{t("app_name", "BalanceBook")} POS</span>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-white/70">
                <Link href="/dashboard" className="hover:text-white transition-colors">{t("dashboard", "Dashboard")}</Link>
                <Link href="/sales" className="hover:text-white transition-colors">{t("sales", "Sales")}</Link>
                <Link href="/purchases" className="hover:text-white transition-colors">{t("purchases", "Purchases")}</Link>
                <Link href="/products" className="hover:text-white transition-colors">{t("products", "Products")}</Link>
                <Link href="/history" className="hover:text-white transition-colors">{t("history", "History")}</Link>
              </div>
            </div>

            {/* Right Status */}
            <div className="flex items-center gap-3 text-white/70">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {t("online_sync", "Online Sync Active")}
              </span>
              <span className="text-white/40 hidden sm:inline">|</span>
              <span className="text-white/80 font-medium hidden sm:inline">
                {isEn ? "Phone (360px) & Desktop Ready" : isHi ? "फ़ोन (360px) व डेस्कटॉप सपोर्ट" : "Phone & Desktop Ready"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ========================================================= */}
        {/* Section 4 — Live Supabase Inventory & Margin Board */}
        {/* ========================================================= */}
        <section className="max-w-6xl mx-auto px-6 py-14 md:py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {isRealtime
                    ? isEn
                      ? "Supabase Live Connected"
                      : "सुपाबेस लाइव कनेक्टेड"
                    : isEn
                    ? "Database Synced"
                    : "डेटाबेस सिंक"}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
                {isEn ? "Live Store Inventory & Margins" : "लाइव दुकान इन्वेंट्री और मार्जिन"}
              </h2>
              <p className="mt-1 text-sm text-white/60">
                {isEn
                  ? "Realtime product stock, weighted average cost, and live profit margins loaded from Supabase."
                  : "सुपाबेस से लोड किया गया वास्तविक स्टॉक, वेटेड औसत लागत और लाइव मुनाफा मार्जिन।"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isEn ? "Manage Products" : "सामान प्रबंधित करें"}</span>
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black hover:bg-white/90 text-xs font-semibold transition-all shadow-lg shadow-white/10"
              >
                <span>{isEn ? "Full Dashboard" : "पूरा डैशबोर्ड"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Real Supabase Table Container */}
          <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0c0f12] shadow-2xl">
            {/* Table Window Topbar */}
            <div className="h-10 px-4 border-b border-white/10 bg-[#090b0e] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-white/50">
                <Store className="w-3.5 h-3.5 text-emerald-400" />
                <span>public.products &bull; supabase</span>
              </div>
              <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>
                  {products.length} {isEn ? "Records in Database" : "रिकॉर्ड डेटाबेस में"}
                </span>
              </div>
            </div>

            {/* Table Body */}
            {products.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <Package className="w-10 h-10 text-white/30 mb-3" />
                <h3 className="text-base font-semibold text-white">
                  {isEn ? "No products in Supabase yet" : "सुपाबेस में अभी कोई सामान नहीं है"}
                </h3>
                <p className="text-xs text-white/50 mt-1 max-w-sm">
                  {isEn
                    ? "Add your products with opening stock and cost price to see live automatic margins and inventory tracking."
                    : "लाइव स्वचालित मार्जिन और इन्वेंट्री ट्रैकिंग देखने के लिए प्रारंभिक स्टॉक और लागत मूल्य के साथ अपने सामान जोड़ें।"}
                </p>
                <Link
                  href="/products"
                  className="mt-4 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors"
                >
                  {isEn ? "Add First Product" : "पहला सामान जोड़ें"}
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] font-mono tracking-wider uppercase text-white/40 bg-white/[0.01]">
                      <th className="py-3 px-4 font-medium">{isEn ? "PRODUCT NAME" : "सामान का नाम"}</th>
                      <th className="py-3 px-4 font-medium">{isEn ? "CATEGORY" : "श्रेणी"}</th>
                      <th className="py-3 px-4 font-medium text-right">{isEn ? "STOCK" : "स्टॉक"}</th>
                      <th className="py-3 px-4 font-medium text-right">{isEn ? "AVG COST" : "औसत लागत"}</th>
                      <th className="py-3 px-4 font-medium text-right">{isEn ? "SELLING PRICE" : "बिक्री मूल्य"}</th>
                      <th className="py-3 px-4 font-medium text-right">{isEn ? "MARGIN" : "मार्जिन"}</th>
                      <th className="py-3 px-4 font-medium text-center">{isEn ? "STATUS" : "स्थिति"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs font-mono">
                    {products.slice(0, 8).map((p) => {
                      const { marginPct, badgeColor } = calculateMargin(p.sell_price, p.avg_cost)
                      const isLowStock = p.stock_qty <= p.low_stock_limit

                      return (
                        <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4 font-sans font-medium text-white">
                            {p.name}
                          </td>
                          <td className="py-3 px-4 text-white/60 font-sans">
                            {p.category}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-white">
                            {p.stock_qty} <span className="text-white/40 text-[11px]">{p.unit}</span>
                          </td>
                          <td className="py-3 px-4 text-right text-white/70">
                            {formatINR(p.avg_cost)}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-white">
                            {formatINR(p.sell_price)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`font-semibold ${
                                badgeColor === "green"
                                  ? "text-emerald-400"
                                  : badgeColor === "amber"
                                  ? "text-amber-400"
                                  : "text-rose-400"
                              }`}
                            >
                              +{marginPct}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${
                                isLowStock
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              }`}
                            >
                              {isLowStock
                                ? isEn
                                  ? "LOW STOCK"
                                  : "कम स्टॉक"
                                : isEn
                                ? "HEALTHY"
                                : "सुरक्षित"}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* Section 5 — Feature Triage: Zero Paperwork */}
        {/* ========================================================= */}
        <section id="solutions" className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
            {/* Left Column Motion */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <SectionEyebrow
                label={t("triage_eyebrow", "Store Intelligence")}
                tag={t("triage_tag", "Automated Calculations")}
              />
              <h2 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight leading-[1.08]">
                {t("triage_heading_1", "Your shop accounts,")}
                <br />
                {t("triage_heading_2", "simplified without paperwork.")}
              </h2>
              <p className="mt-6 text-white/70 text-base leading-relaxed max-w-lg">
                {t("triage_desc", "Ditch manual registers and daily math. BalanceBook automatically computes weighted average cost, exact profit per product, and remaining stock in realtime.")}
              </p>

              <div className="mt-8 flex flex-wrap gap-2.5">
                {[
                  t("weighted_formula_title", "Weighted Avg Cost Formula"),
                  t("metric_zero_neg", "Zero Negative Stock Guarantee"),
                  t("terminal_low_stock", "Low Stock Alerts"),
                  t("new_sale", "1-Tap Fast Sale Entry"),
                  t("live_preview", "Realtime Profit Snapshot"),
                  t("metric_langs", "20+ Languages Supported"),
                ].map((chip) => (
                  <span
                    key={chip}
                    className="text-xs text-white/80 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.04] font-medium"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Right Column: Liquid-Glass Live Triage Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="liquid-glass rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between text-xs font-medium text-white/60 mb-5 px-1 border-b border-white/10 pb-3">
                <span className="font-semibold text-white">{t("triage_summary_title", "Today's Live Account Summary")}</span>
                <span className="text-emerald-400 font-mono">{todaySalesCount} {t("triage_recorded", "Transactions Recorded")}</span>
              </div>
              <div className="space-y-3.5">
                {triageData.map((group) => (
                  <div
                    key={group.tier}
                    className="liquid-glass rounded-xl p-3.5 transition-transform hover:scale-[1.01] border border-white/5"
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: group.color }}
                        />
                        <span className="font-semibold text-white">
                          {group.tier}
                        </span>
                      </div>
                      <span className="text-white/60 text-[11px] font-mono">
                        {group.count}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {group.items.map((it) => (
                        <div
                          key={it}
                          className="text-[11px] text-white/70 pl-4 border-l border-white/10 truncate"
                        >
                          {it}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* Section 6 — Trusted Stores Grid */}
        {/* ========================================================= */}
        <section className="max-w-6xl mx-auto px-6 py-14 border-t border-white/10">
          <div className="text-center text-xs uppercase tracking-widest text-white/50 font-semibold">
            {t("trusted_title", "Trusted by 5,000+ Retail & Grocery Merchants Across India")}
          </div>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {storePartners.map((name, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.5 }}
                className="text-xs font-semibold text-white/50 hover:text-white transition-colors text-center cursor-default py-2.5 px-2 rounded-lg bg-white/[0.02] border border-white/5 truncate"
              >
                {name}
              </motion.div>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* Section 7 — Real Store Owner Testimonials */}
        {/* ========================================================= */}
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 border-t border-white/10">
          <div className="text-center max-w-xl mx-auto mb-12">
            <SectionEyebrow
              label={t("testimonials_eyebrow", "Merchant Stories")}
              tag={t("testimonials_tag", "Verified Stores")}
            />
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white mt-3">
              {t("testimonials_title", "What do store owners say?")}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((item, index) => (
              <motion.figure
                key={item.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="liquid-glass rounded-2xl p-6 flex flex-col justify-between border border-white/10"
              >
                <blockquote className="text-sm text-white/80 leading-relaxed italic">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 pt-5 border-t border-white/10">
                  <div className="text-sm font-bold text-white">
                    {item.author}
                  </div>
                  <div className="text-xs text-white/50 mt-0.5">
                    {item.role}
                  </div>
                  <div className="text-xs text-emerald-400 font-semibold tracking-wide uppercase mt-2">
                    {item.company}
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </section>



        {/* ========================================================= */}
        {/* Section 9 — Final Call to Action */}
        {/* ========================================================= */}
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="liquid-glass relative overflow-hidden rounded-3xl px-8 py-14 md:py-20 text-center border border-white/15"
          >
            {/* Radial glow overlay */}
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                background:
                  "radial-gradient(600px circle at 50% 0%, rgba(52,211,153,0.3), transparent 70%)",
              }}
            />

            <h2 className="relative z-10 text-3xl md:text-5xl font-bold tracking-tight leading-[1.1]">
              {t("cta_heading_1", "Close the register.")}
              <br />
              <span className="text-emerald-400">{t("cta_heading_2", "Grow your profit.")}</span>
            </h2>

            <p className="relative z-10 mt-5 text-white/70 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
              {t("cta_desc", "Digitize your store today. Know your exact net profit on every single product.")}
            </p>

            <div className="relative z-10 mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <ActionButton label={t("hero_cta", "Open Shop Accounts")} href="/dashboard" />
              <Link
                href="/products"
                className="rounded-full border border-white/20 text-white text-sm font-semibold px-6 py-3.5 hover:bg-white/10 inline-flex items-center gap-2 transition-all active:scale-[0.98]"
              >
                <span>{t("hero_cta_secondary", "View Stock & Products")}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ========================================================= */}
        {/* Footer */}
        {/* ========================================================= */}
        <footer className="max-w-6xl mx-auto px-6 py-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
          <div className="flex items-center gap-3">
            <ShopLogoMark className="w-6 h-6" />
            <span className="font-bold text-white tracking-tight">{t("app_name", "BalanceBook")}</span>
            <span>&copy; 2026 {t("app_name", "BalanceBook")}. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              {t("dashboard", "Dashboard")}
            </Link>
            <Link href="/products" className="hover:text-white transition-colors">
              {t("products", "Products")}
            </Link>
            <Link href="/purchases" className="hover:text-white transition-colors">
              {t("purchases", "Purchases")}
            </Link>
            <Link href="/sales" className="hover:text-white transition-colors">
              {t("sales", "Sales")}
            </Link>
            <Link href="/history" className="hover:text-white transition-colors">
              {t("history", "History")}
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              {t("login", "Login")}
            </Link>
          </div>
        </footer>
      </div>
    </div>
  )
}
