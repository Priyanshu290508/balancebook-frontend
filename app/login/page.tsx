"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Store, ArrowRight, Lock, Mail, UserPlus, LogIn, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslation } from "@/lib/i18n"
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const { t, isEn } = useTranslation()
  const { user, isAuthLoading } = useAuth()

  const [mode, setMode] = React.useState<"signin" | "signup">("signin")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [infoMsg, setInfoMsg] = React.useState<string | null>(null)

  // Redirect to dashboard if already authenticated
  React.useEffect(() => {
    if (!isAuthLoading && user) {
      router.replace("/dashboard")
    }
  }, [user, isAuthLoading, router])

  if (isAuthLoading || user) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="text-sm font-semibold text-muted-foreground animate-pulse">
          {user
            ? isEn
              ? "Opening your store console..."
              : "दुकान खाता खोला जा रहा है..."
            : isEn
            ? "Checking store session..."
            : "खाता जांचा जा रहा है..."}
        </p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setInfoMsg(null)

    if (!isSupabaseConfigured || !supabase) {
      setErrorMsg("Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and ANON_KEY.")
      setLoading(false)
      return
    }

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        })

        if (error) {
          setErrorMsg(error.message)
          setLoading(false)
          return
        }

        if (data.session) {
          router.push("/dashboard")
        } else {
          setInfoMsg(
            isEn
              ? "Account created! You can now log in with your email and password."
              : "खाता सफलतापूर्वक बन गया! अब आप अपने ईमेल और पासवर्ड से लॉगिन कर सकते हैं।"
          )
          setMode("signin")
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        })

        if (error) {
          setErrorMsg(error.message)
          setLoading(false)
          return
        }

        if (data.session) {
          router.push("/dashboard")
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected authentication error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Headline */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 border border-white/20 text-white shadow-xl">
            <Store className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {mode === "signin"
              ? isEn
                ? "Store Owner Login"
                : "दुकानदार लॉगिन"
              : isEn
              ? "Create Store Account"
              : "नया दुकानदार खाता बनाएं"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("app_name", "BalanceBook")} • {isEn ? "Supabase Retail Cloud" : "सुपाबेस रिटेल क्लाउड"}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-border/80 bg-card p-8 shadow-xl backdrop-blur-md">
          {/* Mode Switch Tabs */}
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-muted/40 p-1.5 border border-border/70">
            <button
              type="button"
              onClick={() => {
                setMode("signin")
                setErrorMsg(null)
                setInfoMsg(null)
              }}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
                mode === "signin"
                  ? "bg-white text-black shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LogIn className="h-4 w-4" />
              <span>{isEn ? "Sign In" : "लॉगिन"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("signup")
                setErrorMsg(null)
                setInfoMsg(null)
              }}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
                mode === "signup"
                  ? "bg-white text-black shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserPlus className="h-4 w-4" />
              <span>{isEn ? "Sign Up" : "नया खाता"}</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-4 rounded-2xl border border-red-300 bg-red-100 dark:bg-red-950/80 p-3.5 text-xs font-bold text-red-800 dark:text-red-300">
              {errorMsg}
            </div>
          )}

          {/* Info Banner */}
          {infoMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 p-3.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
              <span>{infoMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-xs font-bold">
                {isEn ? "Email Address" : "ईमेल आईडी"} *
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="owner@yourstore.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-12 rounded-2xl"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-xs font-bold">
                {isEn ? "Password" : "पासवर्ड (कम से कम 6 अक्षर)"} *
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-10 h-12 rounded-2xl"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-full shadow-lg text-sm cursor-pointer mt-2"
            >
              {loading
                ? isEn
                  ? "Please wait..."
                  : "कृपया प्रतीक्षा करें..."
                : mode === "signin"
                ? isEn
                  ? "Sign In to Store"
                  : "खाता खोलें (Sign In)"
                : isEn
                ? "Register & Create Account"
                : "नया खाता बनाएं (Sign Up)"}
            </Button>
          </form>
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
