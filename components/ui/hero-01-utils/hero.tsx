"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "motion/react"
import { ArrowRight, TrendingUp, ShieldCheck, Zap, Sparkles, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface AvatarList {
  image: string
}

interface HeroSectionProps {
  avatarList: AvatarList[]
}

export default function HeroSection({ avatarList }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          
          {/* Left Column: Copy & Actions */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:col-span-7">
            
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-50/80 px-3.5 py-1 text-xs font-semibold text-emerald-800 backdrop-blur-sm dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 shadow-sm"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>BalanceBook 2.0 • Realtime Grocery Accounting</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:leading-[1.15]"
            >
              दुकान का सही हिसाब, <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                हर बिक्री पर पक्का मुनाफा
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg md:leading-relaxed"
            >
              अब कॉपी-रजिस्टर की झंझट खत्म। <strong>खरीद (Purchase)</strong> और <strong>बिक्री (Sale)</strong> दर्ज करें, सिस्टम तुरंत <strong>Weighted Average Cost</strong> और <strong>Margin %</strong> निकाल कर लाइव डैशबोर्ड पर दिखाएगा — बिना किसी पेज रिफ्रेश के!
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:justify-start"
            >
              <Link href="/dashboard">
                <Button size="lg" className="h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-7 shadow-lg shadow-emerald-700/25 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  डैशबोर्ड खोलें (Open App)
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/products">
                <Button size="lg" variant="outline" className="h-12 rounded-xl border-border bg-card/80 font-medium px-6 hover:bg-accent backdrop-blur-sm">
                  सामान सूची (Items List)
                </Button>
              </Link>
            </motion.div>

            {/* Trust & Social Proof with Avatars */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4 border-t border-border/70 pt-6 lg:justify-start"
            >
              <div className="flex -space-x-2.5 overflow-hidden">
                {avatarList.map((avatar, idx) => (
                  <img
                    key={idx}
                    src={avatar.image}
                    alt="Shop owner user"
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-background object-cover"
                  />
                ))}
              </div>
              <div className="text-left text-xs sm:text-sm">
                <div className="flex items-center gap-1 font-semibold text-foreground">
                  <span>5,000+ किराना व जनरल स्टोर</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 inline" />
                </div>
                <p className="text-muted-foreground text-xs">
                  डेली ₹10L+ बिक्री और सटीक मार्जिन की ट्रैकिंग
                </p>
              </div>
            </motion.div>

          </div>

          {/* Right Column: Live Mockup / Glass Card Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="relative mx-auto w-full max-w-md rounded-2xl border border-border/80 bg-card/90 p-5 shadow-2xl backdrop-blur-xl transition-all">
              {/* Header inside card */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-semibold text-muted-foreground">आज का लाइव हिसाब (Live Today)</span>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                  Live Sync
                </span>
              </div>

              {/* 2x2 Metric Grid in Card */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-emerald-100 dark:border-emerald-950 bg-emerald-50/60 dark:bg-emerald-950/40 p-3.5">
                  <span className="text-xs font-medium text-muted-foreground">आज की बिक्री (Sales)</span>
                  <p className="text-xl font-bold text-foreground mt-1">₹14,850.00</p>
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5 mt-0.5">
                    <TrendingUp className="h-3 w-3" /> +18.4% vs कल
                  </span>
                </div>
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-100/60 dark:bg-emerald-900/40 p-3.5">
                  <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">आज का मुनाफा (Profit)</span>
                  <p className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mt-1">₹3,420.00</p>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-white/70 dark:bg-emerald-950 px-1.5 py-0.2 rounded">
                    23.0% शुद्ध मार्जिन
                  </span>
                </div>
                <div className="rounded-xl border border-border/70 bg-background/60 p-3.5">
                  <span className="text-xs font-medium text-muted-foreground">इस माह का कुल मुनाफा</span>
                  <p className="text-lg font-bold text-foreground mt-1">₹68,400.00</p>
                  <span className="text-[10px] text-muted-foreground">Oct 2026 तक</span>
                </div>
                <div className="rounded-xl border border-red-100 dark:border-red-950 bg-red-50/50 dark:bg-red-950/30 p-3.5">
                  <span className="text-xs font-medium text-red-700 dark:text-red-400">कम स्टॉक अलर्ट</span>
                  <p className="text-lg font-bold text-red-600 mt-1">3 सामान</p>
                  <span className="text-[10px] text-red-600 font-medium">फॉर्च्यून तेल, बेसन...</span>
                </div>
              </div>

              {/* Live Transaction Preview Item */}
              <div className="mt-4 rounded-xl border border-border/60 bg-muted/40 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">ताजा बिक्री: बासमती चावल (5 kg)</span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                    +₹65.00 मुनाफा
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>खरीद ₹42/kg • बिक्री ₹55/kg</span>
                  <span>स्टॉक बचा: 45 kg</span>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="mt-4 flex gap-2">
                <Link href="/sales" className="flex-1">
                  <Button size="sm" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-9 font-medium">
                    + नई बिक्री दर्ज करें
                  </Button>
                </Link>
                <Link href="/purchases" className="flex-1">
                  <Button size="sm" variant="outline" className="w-full text-xs h-9 font-medium">
                    + नया माल खरीदा
                  </Button>
                </Link>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
