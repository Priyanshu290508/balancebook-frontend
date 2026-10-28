"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import type { User, Session } from "@supabase/supabase-js"
import { supabase, isSupabaseConfigured } from "./supabase/client"
import { Loader2 } from "lucide-react"

interface AuthContextType {
  user: User | null
  session: Session | null
  isAuthLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthLoading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [session, setSession] = React.useState<Session | null>(null)
  const [isAuthLoading, setIsAuthLoading] = React.useState<boolean>(true)
  const router = useRouter()

  React.useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsAuthLoading(false)
      return
    }

    let isMounted = true
    let initialSessionResolved = false

    // 1. Initial Session Retrieval from storage / cookie
    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession }, error }) => {
        if (!isMounted) return
        if (error) {
          console.error("Error retrieving Supabase session:", error)
        }
        setSession(initialSession)
        setUser(initialSession?.user ?? null)
        setIsAuthLoading(false)
        initialSessionResolved = true
      })
      .catch((err) => {
        if (!isMounted) return
        console.error("Supabase getSession exception:", err)
        setIsAuthLoading(false)
        initialSessionResolved = true
      })

    // 2. Realtime listener for Auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (!isMounted) return

      // Do NOT set isAuthLoading(false) if this is an empty initial event before getSession resolves!
      if (event === "INITIAL_SESSION") {
        if (currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)
          setIsAuthLoading(false)
          initialSessionResolved = true
        } else if (!initialSessionResolved) {
          // Wait for getSession() to finish verifying cookies/localStorage
          return
        }
      }

      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      setIsAuthLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = React.useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
    setSession(null)
    router.push("/login")
  }, [router])

  return (
    <AuthContext.Provider value={{ user, session, isAuthLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return React.useContext(AuthContext)
}

/**
 * Protects pages so that only authenticated users can view them.
 * Never redirects while the session is still loading from storage.
 * Redirects to /login ONLY when auth has resolved and there is truly no session.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    if (!isAuthLoading && !user && isSupabaseConfigured) {
      router.replace("/login")
    }
  }, [user, isAuthLoading, router, pathname])

  if (isAuthLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-sm font-semibold text-muted-foreground animate-pulse">
          खाता लोड हो रहा है (Checking session)...
        </p>
      </div>
    )
  }

  if (!user && isSupabaseConfigured) {
    return null
  }

  return <>{children}</>
}
