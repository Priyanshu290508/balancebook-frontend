"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Store, TrendingUp, AlertTriangle, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { useTranslation } from "@/lib/i18n"
import { formatINR } from "@/lib/calc"
import { LanguageModal } from "./language-modal"
import { ThemeToggle } from "./theme-toggle"

export function AppNavbar() {
  const pathname = usePathname()
  const { metrics } = useStore()
  const { t, isEn } = useTranslation()

  if (pathname === "/") {
    return null
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Logo & Store Info */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 text-black shadow-md transition-transform group-hover:scale-105">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-white tracking-tight text-base sm:text-lg group-hover:text-emerald-400 transition-colors">
                  {t("app_name", "BalanceBook")}
                </span>
                <span className="hidden sm:inline-flex rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-white/50 hidden sm:block">
                {t(
                  "app_tagline",
                  isEn
                    ? "Smart Grocery Accounting & Margin Tracker"
                    : "किराना दुकान का पक्का हिसाब व मार्जिन ट्रैकर"
                )}
              </p>
            </div>
          </Link>
        </div>

        {/* Live Top Ticker for Store Owner */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/10 px-3 py-1.5 shadow-xs">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <div className="text-xs">
              <span className="text-white/50 block text-[10px]">
                {t("today_profit", isEn ? "Today's Profit" : "आज का मुनाफा")}
              </span>
              <span className="font-extrabold text-emerald-400">
                {formatINR(metrics.todayProfit)}
              </span>
            </div>
          </div>

          {metrics.lowStockCount > 0 && (
            <Link
              href="/products"
              className="flex items-center gap-1.5 rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-1.5 hover:bg-red-500/20 transition-colors"
            >
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <div className="text-xs">
                <span className="text-red-300 font-bold">
                  {metrics.lowStockCount}{" "}
                  {t(
                    "items_in_low_stock",
                    isEn ? "items in low stock" : "सामान कम स्टॉक में"
                  )}
                </span>
              </div>
            </Link>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1.5">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-xl text-xs font-semibold ${
                pathname === "/dashboard"
                  ? "bg-white/15 text-white border border-white/15"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {t("dashboard", isEn ? "Dashboard" : "डैशबोर्ड")}
            </Button>
          </Link>
          <Link href="/products">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-xl text-xs font-semibold ${
                pathname === "/products"
                  ? "bg-white/15 text-white border border-white/15"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {t("products", isEn ? "Products & Stock" : "सामान")}
            </Button>
          </Link>
          <Link href="/purchases">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-xl text-xs font-semibold ${
                pathname === "/purchases"
                  ? "bg-white/15 text-white border border-white/15"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {t("purchases", isEn ? "Purchases" : "खरीदा")}
            </Button>
          </Link>
          <Link href="/sales">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-xl text-xs font-semibold ${
                pathname === "/sales"
                  ? "bg-white/15 text-white border border-white/15"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {t("sales", isEn ? "Sales" : "बिक्री")}
            </Button>
          </Link>
          <Link href="/history">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-xl text-xs font-semibold ${
                pathname === "/history"
                  ? "bg-white/15 text-white border border-white/15"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {t("history", isEn ? "Transaction History" : "इतिहास")}
            </Button>
          </Link>

          <Link href="/sales">
            <Button
              size="sm"
              className="ml-1 gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black shadow-xs font-bold px-3.5 cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              {t("new_sale", isEn ? "+ New Sale" : "+ नई बिक्री")}
            </Button>
          </Link>
        </div>

        {/* Global Controls: Language Converter & Theme Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <LanguageModal />

          {/* Mobile Quick Action */}
          <div className="flex md:hidden items-center ml-1">
            <Link href="/sales">
              <Button
                size="sm"
                className="h-8 px-2.5 text-xs bg-emerald-500 hover:bg-emerald-400 text-black rounded-full font-bold cursor-pointer"
              >
                {t("new_sale", isEn ? "+ Sale" : "+ बिक्री")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
