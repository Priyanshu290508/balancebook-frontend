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
      title: t("dashboard", isEn ? "Console" : "कंसोल"),
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: t("purchases", isEn ? "Purchases" : "खरीद"),
      href: "/purchases",
      icon: ShoppingBag,
    },
    {
      title: t("sales", isEn ? "New Sale" : "बिक्री"),
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-around border-t border-white/10 bg-[#090b0e]/95 backdrop-blur-xl md:hidden px-1 pb-safe">
      {navItems.map((item, index) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        if (item.highlight) {
          return (
            <Link
              key={index}
              href={item.href}
              className="relative -top-2 flex flex-col items-center justify-center shrink-0 px-1"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 text-black shadow-lg shadow-emerald-500/30 transition-transform active:scale-95">
                <Icon className="h-5 w-5 stroke-[2.2px]" />
              </div>
              <span className="mt-1 text-[9px] font-bold tracking-tight text-emerald-400">
                {item.title}
              </span>
            </Link>
          )
        }

        return (
          <Link
            key={index}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-1.5 transition-colors shrink-0 ${
              isActive
                ? "text-emerald-400 font-bold"
                : "text-white/50 hover:text-white"
            }`}
          >
            <Icon className={`h-4.5 w-4.5 ${isActive ? "stroke-[2.5px]" : "stroke-[1.75px]"}`} />
            <span className="text-[10px] font-medium leading-none mt-1 text-center tracking-tight">
              {item.title}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
