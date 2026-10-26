"use client"

import Link from "next/link"
import { ArrowRight, Store, Sparkles } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { SonarGrid } from "@/components/ui/sonar-grid"

const settings = {
  ringWidth: 90,
  speed: 260,
  amplitude: 2.2,
  pingEvery: 2.4,
  interactive: true,
  spacing: 26,
  baseOpacity: 0.28,
  useThemeColor: true,
  color: "#15803d",
  eyebrow: "दुकान खाता 2.0 • Live Accounting",
  headline: "दुकान का सही हिसाब, हर बिक्री पर पक्का मुनाफा",
  subline: "हर खरीद और बिक्री पर रियल-टाइम मार्जिन व स्टॉक ट्रैकिंग। कहीं भी क्लिक करें और लाइव पिंग देखें।",
}

export default function SonarDemo(props: Partial<typeof settings>) {
  const s = { ...settings, ...props }
  const reduce = useReducedMotion()
  const enter = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14, filter: "blur(6px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
        }

  return (
    <SonarGrid
      id="sonar-grid-demo"
      ringWidth={s.ringWidth}
      speed={s.speed}
      amplitude={s.amplitude}
      pingEvery={s.pingEvery}
      interactive={s.interactive}
      spacing={s.spacing}
      baseOpacity={s.baseOpacity}
      color={s.useThemeColor ? undefined : s.color}
      pingArea={[0.22, 0.18, 0.78, 0.82]}
      className="bg-background flex min-h-[max(560px,85svh)] w-full flex-col justify-center border-b border-border/60"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_34%_30%_at_50%_50%,var(--color-background)_0%,transparent_100%)]"
      />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div className="flex max-w-3xl flex-col items-center">
          <motion.p
            {...enter(0)}
            className="text-muted-foreground border-border/80 mb-5 inline-flex items-center gap-2 rounded-full border bg-card/60 px-3.5 py-1 text-xs font-semibold backdrop-blur-sm"
          >
            <span aria-hidden="true" className="bg-emerald-600 size-2 rounded-full animate-ping" />
            {s.eyebrow}
          </motion.p>
          <motion.h1
            {...enter(0.08)}
            className="text-foreground text-4xl font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl"
          >
            {s.headline}
          </motion.h1>
          <motion.p {...enter(0.16)} className="text-muted-foreground mt-6 max-w-2xl text-base text-pretty sm:text-lg">
            {s.subline}
          </motion.p>
          <motion.div {...enter(0.24)} className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link href="/dashboard">
              <button
                type="button"
                id="cta-primary"
                className="group bg-emerald-700 hover:bg-emerald-800 text-white focus-visible:ring-emerald-600/50 inline-flex h-12 cursor-pointer items-center gap-2 rounded-full px-7 text-sm font-semibold shadow-lg shadow-emerald-700/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Store className="size-4" />
                खाता खोलें (Open Dashboard)
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </button>
            </Link>
            <Link href="/sales">
              <button
                type="button"
                className="bg-card/80 text-foreground border-border hover:bg-accent focus-visible:ring-ring/50 inline-flex h-12 cursor-pointer items-center gap-2 rounded-full border px-6 text-sm font-medium backdrop-blur transition-all active:scale-[0.98]"
              >
                <Sparkles className="size-4 text-emerald-600" />
                बिक्री दर्ज करें (Enter Sale)
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </SonarGrid>
  )
}
