"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
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

  // Active product in live POS showcase
  const [activeProductIndex, setActiveProductIndex] = React.useState(0)
  const [activeNavTab, setActiveNavTab] = React.useState<"all" | "low" | "high">("all")
  const [saleQty, setSaleQty] = React.useState(1)
  const [saleSuccessMessage, setSaleSuccessMessage] = React.useState<string | null>(null)
  // Nimbus Grid Console State from Reference Screenshot
  const [activeConsoleNav, setActiveConsoleNav] = React.useState("Storage Pools")
  const [consoleDataset, setConsoleDataset] = React.useState<"cloud" | "grocery">("cloud")
  const [consoleToast, setConsoleToast] = React.useState<{ title: string; subtitle: string } | null>({
    title: "Pool created",
    subtitle: "finance-vault ready",
  })
  const [customPools, setCustomPools] = React.useState<
    Array<{
      name: string
      region: string
      used: string
      policy: string
      state: "HEALTHY" | "SYNCING" | "QUEUED" | "LOW STOCK"
    }>
  >([])
  const [activeBarIndex, setActiveBarIndex] = React.useState(1)

  // Products adapted based on language
  const groceryProducts = React.useMemo(() => {
    return [
      {
        id: 0,
        name: isEn ? "Aashirvaad Whole Wheat Flour 10kg" : isHi ? "आशीर्वाद शुद्ध चक्की आटा 10kg" : "Aashirvaad Shudh Chakki Atta 10kg",
        category: isEn ? "Staples & Flour" : isHi ? "राशन और आटा" : "Ration & Atta",
        unit: isEn ? "packet" : isHi ? "पैकेट" : "packet",
        stock: 42,
        costPrice: 380,
        sellPrice: 460,
        lowStockThreshold: 10,
        supplier: isEn ? "Shree Ganesh Wholesalers" : "श्री गणेश ट्रेडर्स",
        lastUpdated: isEn ? "Today, 10:15 AM" : isHi ? "आज, 10:15 AM" : "Aaj, 10:15 AM",
      },
      {
        id: 1,
        name: isEn ? "India Gate Basmati Rice 5kg" : isHi ? "इंडिया गेट बासमती चावल 5kg" : "India Gate Basmati Chawal 5kg",
        category: isEn ? "Staples & Grains" : isHi ? "राशन और अनाज" : "Ration & Atta",
        unit: isEn ? "bag" : isHi ? "बोरी" : "bag",
        stock: 18,
        costPrice: 410,
        sellPrice: 520,
        lowStockThreshold: 5,
        supplier: isEn ? "Kisan Rice Mills" : "किसान राइस मिल",
        lastUpdated: isEn ? "Today, 9:30 AM" : isHi ? "आज, 9:30 AM" : "Aaj, 9:30 AM",
      },
      {
        id: 2,
        name: isEn ? "Fortune Mustard Oil 1L" : isHi ? "फॉर्च्यून कच्ची घानी सरसों तेल 1L" : "Fortune Kachi Ghani Mustard Oil 1L",
        category: isEn ? "Oils & Spices" : isHi ? "तेल और मसाले" : "Tel & Masale",
        unit: isEn ? "bottle" : isHi ? "बोतल" : "bottle",
        stock: 4,
        costPrice: 125,
        sellPrice: 155,
        lowStockThreshold: 8,
        supplier: isEn ? "Agrawal Oil Distributors" : "अग्रवाल ऑइल डिपो",
        lastUpdated: isEn ? "Yesterday, 6:40 PM" : isHi ? "कल, 6:40 PM" : "Kal, 6:40 PM",
      },
      {
        id: 3,
        name: isEn ? "Maggi 2-Minute Noodles (Pack of 24)" : isHi ? "मैगी 2-मिनट नूडल्स (24 का पैक)" : "Maggi 2-Minute Masala Noodles (Pack 24)",
        category: isEn ? "Packaged Snacks" : isHi ? "स्नैक्स और नाश्ता" : "Snacks & Quick Food",
        unit: isEn ? "carton" : isHi ? "कार्टन" : "carton",
        stock: 14,
        costPrice: 288,
        sellPrice: 336,
        lowStockThreshold: 5,
        supplier: isEn ? "Nestle Regional Agency" : "नेस्ले सिटी एजेंसी",
        lastUpdated: isEn ? "Yesterday, 2:10 PM" : isHi ? "कल, 2:10 PM" : "Kal, 2:10 PM",
      },
      {
        id: 4,
        name: isEn ? "Tata Salt Vacuum Evaporated 1kg" : isHi ? "टाटा नमक 1kg" : "Tata Salt Vacuum Evaporated 1kg",
        category: isEn ? "Daily Essentials" : isHi ? "दैनिक किराना" : "Kirana Daily",
        unit: isEn ? "packet" : isHi ? "पैकेट" : "packet",
        stock: 65,
        costPrice: 22,
        sellPrice: 28,
        lowStockThreshold: 15,
        supplier: isEn ? "National Grocery Wholesaler" : "नेशनल होलसेलर",
        lastUpdated: isEn ? "2 Days Ago" : isHi ? "2 दिन पहले" : "2 Din Pehle",
      },
      {
        id: 5,
        name: isEn ? "Amul Pasteurized Butter 500g" : isHi ? "अमूल मक्खन 500g" : "Amul Pasteurised Butter 500g",
        category: isEn ? "Dairy & Cold Storage" : isHi ? "डेयरी उत्पाद" : "Dairy & Bakery",
        unit: isEn ? "pack" : isHi ? "पैक" : "brick",
        stock: 3,
        costPrice: 245,
        sellPrice: 275,
        lowStockThreshold: 6,
        supplier: isEn ? "Amul Fresh Depot" : "अमूल फ्रेश डिपो",
        lastUpdated: isEn ? "Today, 8:00 AM" : isHi ? "आज, 8:00 AM" : "Aaj, 8:00 AM",
      },
    ]
  }, [isEn, isHi])

  const activeProduct = groceryProducts[activeProductIndex] || groceryProducts[0]
  const marginPerUnit = activeProduct.sellPrice - activeProduct.costPrice
  const marginPercent = ((marginPerUnit / activeProduct.costPrice) * 100).toFixed(1)

  // Quick sale handler for interactive feedback
  const handleSimulateSale = () => {
    const totalSale = saleQty * activeProduct.sellPrice
    const totalProfit = saleQty * marginPerUnit
    const msg = isEn
      ? `Sale Recorded! ₹${totalSale} Total · Net Profit: +₹${totalProfit}`
      : isHi
      ? `बिक्री दर्ज हो गई! ₹${totalSale} कुल राशि · मुनाफा: +₹${totalProfit}`
      : `Bikri Record Ho Gayi! ₹${totalSale} Total · Munafa: +₹${totalProfit}`

    setSaleSuccessMessage(msg)
    setTimeout(() => {
      setSaleSuccessMessage(null)
    }, 3500)
  }

  // Datasets for the Nimbus Grid Console
  const cloudStoragePools = React.useMemo(() => {
    return [
      { name: "finance-vault", region: "EU Central", used: "18.4 TiB", policy: "7 years", state: "HEALTHY" as const },
      { name: "design-assets", region: "US East", used: "9.8 TiB", policy: "Versioned", state: "SYNCING" as const },
      { name: "legal-archive", region: "EU Central", used: "42.1 TiB", policy: "Immutable", state: "HEALTHY" as const },
      { name: "migration-lane", region: "AP South", used: "6.2 TiB", policy: "Temporary", state: "QUEUED" as const },
      ...customPools,
    ]
  }, [customPools])

  const groceryStoragePools = React.useMemo(() => {
    return [
      { name: "atta-chakki-vault", region: isEn ? "North Depot" : "उत्तर डिपो", used: "42 pkts", policy: "+21.0% Margin", state: "HEALTHY" as const },
      { name: "basmati-rice-pool", region: isEn ? "East Silo" : "पूर्व साइलो", used: "18 bags", policy: "+26.8% Margin", state: "HEALTHY" as const },
      { name: "mustard-oil-lane", region: isEn ? "Central Depot" : "सेंट्रल डिपो", used: "4 bottles", policy: "Reorder Limit 8", state: "SYNCING" as const },
      { name: "amul-butter-vault", region: isEn ? "Cold Chain 01" : "कोल्ड चेन 01", used: "3 bricks", policy: "Reorder Limit 6", state: "QUEUED" as const },
      ...customPools,
    ]
  }, [isEn, customPools])

  const handleNewPoolClick = () => {
    const randomId = Math.floor(Math.random() * 800 + 100)
    const newName = consoleDataset === "cloud" ? `vault-node-${randomId}` : `inventory-pool-${randomId}`
    const newPool = {
      name: newName,
      region: "AP South",
      used: "2.4 TiB",
      policy: "Instant Cache",
      state: "HEALTHY" as const,
    }
    setCustomPools((prev) => [newPool, ...prev])
    setConsoleToast({
      title: "Pool created",
      subtitle: `${newName} ready`,
    })
  }

  const navLinks = [
    { label: t("dashboard", "Dashboard"), href: "/dashboard" },
    { label: t("products", "Products & Stock"), href: "/products" },
    { label: t("purchases", "Purchases"), href: "/purchases" },
    { label: t("sales", "Sales"), href: "/sales" },
    { label: t("history", "History"), href: "/history" },
  ]

  const triageData = React.useMemo(() => {
    if (isEn) {
      return [
        {
          tier: "High Profit Margin (≥20%)",
          count: "18 items",
          color: "#10b981",
          items: ["Tata Salt (+27.3% margin)", "Basmati Rice (+26.8% margin)", "Wheat Flour 10kg (+21.0% margin)"],
        },
        {
          tier: "Low Stock Alert",
          count: "3 items",
          color: "#ef4444",
          items: ["Mustard Oil 1L (4 left — reorder limit 8)", "Butter 500g (3 left — reorder limit 6)"],
        },
        {
          tier: "Today's Total Sales",
          count: "₹24,850",
          color: "#00d2ff",
          items: ["38 receipts issued", "Average basket ₹654", "Peak hours: 6:00 PM – 8:30 PM"],
        },
        {
          tier: "Safe Inventory",
          count: "64 items",
          color: "#a3a3a3",
          items: ["Table Salt (65 pkts)", "Refined Sugar (120 kg)", "Yellow Lentils (80 kg)"],
        },
      ]
    }
    if (isHi) {
      return [
        {
          tier: "अधिक मुनाफा मार्जिन (≥20%)",
          count: "18 सामान",
          color: "#10b981",
          items: ["टाटा नमक (+27.3% मार्जिन)", "बासमती चावल (+26.8% मार्जिन)", "आशीर्वाद आटा (+21.0% मार्जिन)"],
        },
        {
          tier: "कम स्टॉक चेतावनी",
          count: "3 सामान",
          color: "#ef4444",
          items: ["फॉर्च्यून सरसों तेल (4 बची हैं — सीमा 8)", "अमूल मक्खन (3 बचे हैं — सीमा 6)"],
        },
        {
          tier: "आज की कुल बिक्री",
          count: "₹24,850",
          color: "#00d2ff",
          items: ["38 बिल दर्ज", "औसत ग्राहक बिल ₹654", "व्यस्त समय: शाम 6:00 – 8:30"],
        },
        {
          tier: "पर्याप्त सुरक्षित स्टॉक",
          count: "64 सामान",
          color: "#a3a3a3",
          items: ["टाटा नमक (65 पैकेट)", "चीनी (120 kg)", "चना दाल (80 kg)"],
        },
      ]
    }
    return [
      {
        tier: "High Profit Margin (≥20%)",
        count: "18 items",
        color: "#10b981",
        items: ["Tata Salt (+27.3% margin)", "Basmati Chawal (+26.8% margin)", "Atta 10kg (+21.0% margin)"],
      },
      {
        tier: "Kam Stock Alert",
        count: "3 items",
        color: "#ef4444",
        items: ["Fortune Mustard Oil (4 bachi hai — limit 8)", "Amul Butter (3 bachi hai — limit 6)"],
      },
      {
        tier: "Aaj Ki Bikri (Sales)",
        count: "₹24,850",
        color: "#00d2ff",
        items: ["38 bills generated", "Avg basket ₹654", "Peak hour: 6:00 PM – 8:30 PM"],
      },
      {
        tier: "Surplus Safe Stock",
        count: "64 items",
        color: "#a3a3a3",
        items: ["Tata Salt (65 pkts)", "Sugar M-30 (120 kg)", "Chana Dal (80 kg)"],
      },
    ]
  }, [isEn, isHi])

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

          {/* Quick Metrics Trust Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/10 w-full max-w-3xl text-left"
          >
            <div>
              <div className="text-2xl font-bold text-white tracking-tight">₹0</div>
              <div className="text-xs text-white/50 mt-0.5">{t("metric_free", "100% Free for single shop")}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400 tracking-tight">100%</div>
              <div className="text-xs text-white/50 mt-0.5">{t("metric_margin", "Exact margin calculation")}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-cyan-400 tracking-tight">{isEn ? "Zero" : "ज़ीरो"}</div>
              <div className="text-xs text-white/50 mt-0.5">{t("metric_zero_neg", "Zero negative stock guarantee")}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white tracking-tight">20+</div>
              <div className="text-xs text-white/50 mt-0.5">{t("metric_langs", "Languages supported")}</div>
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
        {/* Section 4 — Nimbus Grid Console Showcase */}
        {/* ========================================================= */}
        <section className="max-w-6xl mx-auto px-6 py-14 md:py-20">
          {/* Top Split Section: Left bold headline, Right paragraph + stacked interactive bars */}
          <div className="grid md:grid-cols-12 gap-8 items-end mb-10">
            {/* Left Column: Big Bold Statement */}
            <div className="md:col-span-7">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
                {isEn ? (
                  <>
                    The biggest forward leap in <br className="hidden sm:inline" />
                    business cloud storage <br className="hidden sm:inline" />
                    operations.
                  </>
                ) : isHi ? (
                  <>
                    व्यापारिक क्लाउड स्टोरेज और <br className="hidden sm:inline" />
                    दुकान संचालन में <br className="hidden sm:inline" />
                    सबसे बड़ा क्रांतिकारी कदम।
                  </>
                ) : (
                  <>
                    Business cloud storage aur <br className="hidden sm:inline" />
                    inventory operations me <br className="hidden sm:inline" />
                    sabse bada forward leap.
                  </>
                )}
              </h2>
            </div>

            {/* Right Column: Paragraph + Stacked Interactive Bar Tabs with Cursor */}
            <div className="md:col-span-5 flex flex-col justify-between">
              <p className="text-sm text-white/60 leading-relaxed">
                {isEn
                  ? "A single control plane for provisioning storage pools, reviewing policy, watching growth, and shipping audit-ready reports without asking teams to change how they work."
                  : isHi
                  ? "स्टोरेज पूल बनाने, पॉलिसी देखने, विकास ट्रैक करने और बिना काम के तरीके बदले ऑडिट-रेडी रिपोर्ट तैयार करने का एकमात्र संपूर्ण कंट्रोल प्लेन।"
                  : "Storage pools manage karne, policy review, growth track aur audit-ready reports ship karne ka single control plane bina working style badle."}
              </p>

              {/* Stacked Interactive Horizontal Bars with Mouse Cursor indicator */}
              <div className="mt-5 space-y-2 relative">
                {[
                  { label: isEn ? "Autonomous Balancing" : "ऑटोनॉमस बैलेंसिंग", active: activeBarIndex === 0 },
                  { label: isEn ? "Encrypted Vault Sync" : "एन्क्रिप्टेड सिंक", active: activeBarIndex === 1 },
                  { label: isEn ? "Realtime Audit Stream" : "रियल-टाइम ऑडिट स्ट्रीम", active: activeBarIndex === 2 },
                ].map((bar, idx) => (
                  <div
                    key={bar.label}
                    onClick={() => setActiveBarIndex(idx)}
                    className={`h-9 px-4 rounded-md flex items-center justify-between text-xs cursor-pointer transition-all border ${
                      activeBarIndex === idx
                        ? "bg-white/[0.08] border-white/20 text-white font-medium shadow-sm"
                        : "bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.04] hover:text-white/70"
                    }`}
                  >
                    <span>{bar.label}</span>
                    <span className="text-[10px] font-mono text-white/30">0{idx + 1}</span>
                  </div>
                ))}

                {/* Floating Cursor Pointer Icon matching screenshot */}
                <div
                  className="absolute right-8 pointer-events-none transition-all duration-300 transform -translate-y-1/2 z-10"
                  style={{ top: `${activeBarIndex * 44 + 20}px` }}
                >
                  <svg
                    className="w-5 h-5 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] filter"
                    viewBox="0 0 24 24"
                    fill="white"
                    stroke="black"
                    strokeWidth="1.5"
                  >
                    <path d="M4 3l7.5 17 2.5-6.5L20 11 4 3z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Micro Eyebrow Badge right above the console window */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-white/10 bg-[#0e1217] text-[11px] font-mono text-white/60">
              <span className="text-white/40">0 . 2</span>
              <span className="w-1 h-1 rounded-full bg-cyan-400" />
              <span className="tracking-widest uppercase text-white/80">NIMBUS GRID WEB CONSOLE</span>
            </div>

            {/* Toggle between Nimbus Cloud Storage Pools and BalanceBook Retail Pools */}
            <div className="flex items-center gap-1.5 p-0.5 rounded-lg border border-white/10 bg-black/40 text-[11px]">
              <button
                type="button"
                onClick={() => setConsoleDataset("cloud")}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  consoleDataset === "cloud"
                    ? "bg-white/15 text-white font-medium"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {isEn ? "Cloud Storage Pools" : "क्लाउड स्टोरेज पूल"}
              </button>
              <button
                type="button"
                onClick={() => setConsoleDataset("grocery")}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  consoleDataset === "grocery"
                    ? "bg-white/15 text-white font-medium"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {isEn ? "BalanceBook Retail Pools" : "बैलेंसबुक रिटेल पूल"}
              </button>
            </div>
          </div>

          {/* Console Window Container */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0c0f12] shadow-2xl"
          >
            {/* Console Top Window Header */}
            <div className="h-9 px-4 border-b border-white/10 bg-[#090b0e] flex items-center justify-between">
              {/* Window dots */}
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
              </div>
              <div className="text-[11px] font-mono text-white/40 tracking-wider">
                console.balancebook.io &bull; balancebook-runtime
              </div>
              <div className="w-10" />
            </div>

            {/* Console Body: Left Sidebar + Right Main Area */}
            <div className="grid grid-cols-12 min-h-[460px]">
              {/* Left Sidebar */}
              <div className="col-span-12 md:col-span-3 border-b md:border-b-0 md:border-r border-white/10 bg-[#090c0f] p-4 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider px-2 mb-3">
                    Client Vault
                  </div>

                  <nav className="space-y-1">
                    {[
                      "Workspaces",
                      "Storage Pools",
                      "Retention",
                      "Access",
                      "Transfers",
                      "Reports",
                    ].map((item) => {
                      const isSelected = activeConsoleNav === item
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setActiveConsoleNav(item)
                            setConsoleToast({
                              title: `${item} active`,
                              subtitle: `Viewing ${item.toLowerCase()} registry`,
                            })
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "bg-[#18232c] text-white font-medium border border-teal-500/20"
                              : "text-white/50 hover:bg-white/[0.03] hover:text-white/80"
                          }`}
                        >
                          <span>{item}</span>
                        </button>
                      )
                    })}
                  </nav>
                </div>

                <div className="pt-4 border-t border-white/5 text-[10px] text-white/30 font-mono flex items-center justify-between">
                  <span>REGION: AP-SOUTH-1</span>
                  <span className="text-emerald-400 font-semibold">SYNCED</span>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="col-span-12 md:col-span-9 p-6 sm:p-8 flex flex-col justify-between relative bg-[#0c0f12]">
                <div>
                  {/* Heading & New Pool Button */}
                  <div className="flex items-center justify-between pb-6">
                    <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                      {activeConsoleNav}
                    </h3>

                    <button
                      type="button"
                      onClick={handleNewPoolClick}
                      className="px-3.5 py-1.5 rounded border border-white/20 bg-transparent hover:bg-white/5 text-[11px] font-mono tracking-wider uppercase text-white/90 hover:text-white transition-all cursor-pointer active:scale-95"
                    >
                      NEW POOL
                    </button>
                  </div>

                  {/* Data Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-[10px] font-mono tracking-wider uppercase text-white/40">
                          <th className="pb-3 font-medium">NAME</th>
                          <th className="pb-3 font-medium">REGION</th>
                          <th className="pb-3 font-medium">USED</th>
                          <th className="pb-3 font-medium">POLICY</th>
                          <th className="pb-3 font-medium text-right sm:text-left">STATE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs font-mono">
                        {(consoleDataset === "cloud" ? cloudStoragePools : groceryStoragePools).map(
                          (row, idx) => (
                            <tr
                              key={row.name + idx}
                              onClick={() => {
                                setConsoleToast({
                                  title: "Pool created",
                                  subtitle: `${row.name} ready`,
                                })
                              }}
                              className="group hover:bg-white/[0.02] cursor-pointer transition-colors"
                            >
                              <td className="py-3.5 text-white/90 font-medium group-hover:text-white">
                                {row.name}
                              </td>
                              <td className="py-3.5 text-white/60">
                                {row.region}
                              </td>
                              <td className="py-3.5 text-white/70">
                                {row.used}
                              </td>
                              <td className="py-3.5 text-white/60">
                                {row.policy}
                              </td>
                              <td className="py-3.5 text-right sm:text-left">
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
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Floating Bottom-Right Toast Notification (matching screenshot) */}
                <AnimatePresence>
                  {consoleToast && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute bottom-6 right-6 p-4 rounded-lg bg-[#0e2229] border border-teal-500/40 shadow-xl max-w-xs cursor-pointer z-10"
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
                <span className="text-emerald-400 font-mono">42 {t("triage_recorded", "Transactions Recorded")}</span>
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
