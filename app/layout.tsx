import type { Metadata, Viewport } from "next"
import "./globals.css"
import { ThemeProvider } from "@/lib/theme"
import { LanguageProvider } from "@/lib/i18n"
import { AuthProvider } from "@/lib/auth"
import { StoreProvider } from "@/lib/store"
import { AppNavbar } from "@/components/navigation/navbar"
import { BottomNav } from "@/components/navigation/bottom-nav"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0c0c0c",
}

export const metadata: Metadata = {
  title: "BalanceBook — Smart Grocery Accounting & Margin Tracker",
  description:
    "BalanceBook: Track every purchase and sale with automatic weighted average cost, live profit margin, and instant low-stock alerts.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full dark" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#0c0c0c] text-white antialiased selection:bg-emerald-500/30 selection:text-white transition-colors duration-200 relative overflow-x-hidden">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <StoreProvider>
                {/* ========================================================= */}
                {/* Global Background Ambient Video & Lighting for ALL pages */}
                {/* ========================================================= */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover pointer-events-none opacity-40 mix-blend-screen"
                    src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />
                </div>

                {/* Vertical Container Guide Lines */}
                <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 -translate-x-[calc(50%+36rem)] w-px bg-white/10 z-[5]" />
                <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 translate-x-[calc(-50%+36rem)] w-px bg-white/10 z-[5]" />

                {/* Noise Filter for Shiny Gradients */}
                <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
                  <defs>
                    <filter id="c3-noise">
                      <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.9"
                        numOctaves="2"
                        stitchTiles="stitch"
                      />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0"
                      />
                      <feComposite in2="SourceGraphic" operator="in" result="noise" />
                      <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
                    </filter>
                  </defs>
                </svg>

                {/* App Content Layer */}
                <div className="relative z-10 flex flex-col min-h-screen">
                  <AppNavbar />
                  <main className="flex-1 pb-16 md:pb-6">{children}</main>
                  <BottomNav />
                </div>
              </StoreProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
