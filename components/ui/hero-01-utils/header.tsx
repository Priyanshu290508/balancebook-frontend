"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, Store, ArrowRight, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export interface NavigationSection {
  title: string
  href: string
  isActive?: boolean
}

interface HeaderProps {
  navigationData: NavigationSection[]
}

export default function Header({ navigationData }: HeaderProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white shadow-md shadow-emerald-700/20">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5">
              BalanceBook <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">Pro</span>
            </span>
            <span className="block text-[10px] text-muted-foreground font-medium -mt-1 tracking-wider uppercase">
              Smart Grocery Accounting
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navigationData.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                item.isActive
                  ? "text-primary bg-primary/10 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
              }`}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Header Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="font-medium text-muted-foreground hover:text-foreground">
              लॉगिन (Login)
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium shadow-sm gap-1.5 rounded-full px-4">
              <Sparkles className="h-3.5 w-3.5" />
              खाता खोलें
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/dashboard">
            <Button size="sm" className="h-9 px-3 text-xs bg-emerald-700 hover:bg-emerald-800 text-white rounded-full">
              खाता खोलें
            </Button>
          </Link>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
              <SheetHeader className="text-left pb-4 border-b">
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white">
                    <Store className="h-4 w-4" />
                  </div>
                  <span>BalanceBook</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 py-4">
                {navigationData.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                  >
                    <span>{item.title}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
              <div className="mt-6 flex flex-col gap-2.5 pt-4 border-t">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">
                    लॉगिन (Login)
                  </Button>
                </Link>
                <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                  <Button className="w-full justify-center bg-emerald-700 hover:bg-emerald-800 text-white">
                    खाता खोलें (Dashboard)
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
