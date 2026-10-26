"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Store, ArrowRight, ShieldCheck, Sparkles, Lock, Mail, Fingerprint } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslation } from "@/lib/i18n"
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const { t, isEn } = useTranslation()
  const [email, setEmail] = React.useState("owner@balancebook.in")
  const [password, setPassword] = React.useState("password123")
  const [loading, setLoading] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setErrorMsg(error.message)
        setLoading(false)
        return
      }
    }

    // Direct access on localhost
    router.push("/dashboard")
  }

  const handleDemoAccess = () => {
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        
        {/* Logo & Headline */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-foreground text-background shadow-xl">
            <Store className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {isEn ? "Login" : "लॉगिन"} • {t("app_name", "BalanceBook")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEn ? "Store Owner Portal" : "दुकानदार लॉगिन"}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-border/80 bg-card p-8 shadow-xl backdrop-blur-md">
          {errorMsg && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-xs font-bold">
                {isEn ? "Email Address" : "ईमेल"}
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-12 rounded-2xl"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-xs font-bold">
                {isEn ? "Password" : "पासवर्ड"}
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 h-12 rounded-2xl"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background hover:bg-foreground/90 font-bold h-12 rounded-full shadow-lg text-sm cursor-pointer"
            >
              {loading
                ? isEn
                  ? "Signing in..."
                  : "लॉगिन हो रहा है..."
                : isEn
                ? "Sign In"
                : "लॉगिन करें"}
            </Button>
          </form>

          {/* Quick Demo Access Button */}
          <div className="mt-6 border-t border-border/70 pt-5 text-center">
            <p className="text-xs text-muted-foreground mb-3">
              {isEn ? "Localhost 1-Click Fast Access:" : "लोकलहोस्ट पर 1-क्लिक एक्सेस:"}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleDemoAccess}
              className="w-full border-border/80 bg-muted/30 hover:bg-muted font-bold h-12 rounded-full gap-2.5 cursor-pointer shadow-xs"
            >
              <Fingerprint className="h-5 w-5 text-emerald-600" />
              <span>{isEn ? "Demo Owner Entry" : "डेमो ओनर एंट्री"}</span>
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
          </div>
        </div>

        {/* Back Link */}
        <p className="text-center text-xs text-muted-foreground">
          <Link href="/" className="font-bold text-foreground hover:underline">
            {isEn ? "← Back to Home" : "← होम पर वापस जाएं"}
          </Link>
        </p>

      </div>
    </div>
  )
}
