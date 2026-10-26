"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingBag, ShoppingCart, Package, History } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

export function BottomNav() {
  const pathname = usePathname()
  const { t, isEn } = useTranslation()

  if (pathname === "/") {
    return null
  }

  const navItems = [
    {
      title: t("dashboard", isEn ? "Dashboard" : "डैशबोर्ड"),
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: t("purchases", isEn ? "Purchases" : "खरीदा"),
      href: "/purchases",
      icon: ShoppingBag,
    },
    {
      title: t("sales", isEn ? "Sales" : "बिक्री"),
      href: "/sales",
      icon: ShoppingCart,
      highlight: true,
    },
    {
      title: t("products", isEn ? "Products" : "सामान"),
      href: "/products",
      icon: Package,
    },
    {
      title: t("history", isEn ? "History" : "इतिहास"),
      href: "/history",
      icon: History,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-around border-t border-white/10 bg-black/80 backdrop-blur-xl md:hidden">
      {navItems.map((item, index) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        if (item.highlight) {
          return (
            <Link
              key={index}
              href={item.href}
              className="relative -top-3 flex flex-col items-center justify-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 text-black shadow-lg shadow-emerald-500/30 transition-transform active:scale-95">
                <Icon className="h-6 w-6" />
              </div>
              <span className="mt-1 text-[10px] font-bold text-emerald-400">
                {item.title}
              </span>
            </Link>
          )
        }

        return (
          <Link
            key={index}
            href={item.href}
            className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center py-1 transition-colors ${
              isActive
                ? "text-emerald-700 dark:text-emerald-400 font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5px]" : "stroke-[1.75px]"}`} />
            <span className="text-[11px] font-medium leading-none mt-1 truncate max-w-[65px] text-center">
              {item.title}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
