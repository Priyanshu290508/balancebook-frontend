import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== "https://your-project.supabase.co" && 
  !supabaseUrl.includes("placeholder")
)

// Configure Supabase client with robust session persistence and auto-refresh
/**
 * Dual Cookie + LocalStorage storage adapter.
 * Ensures the authenticated Supabase session persists across page refreshes,
 * tab navigations, and works harmoniously with Next.js SSR without session dropouts.
 */
const cookieAndLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof document === "undefined") return null

    // 1. Try reading from document.cookie
    try {
      const name = encodeURIComponent(key) + "="
      const decodedCookie = document.cookie || ""
      const parts = decodedCookie.split(";")
      for (let c of parts) {
        c = c.trim()
        if (c.indexOf(name) === 0) {
          const raw = c.substring(name.length)
          return decodeURIComponent(raw)
        }
      }
    } catch {
      // ignore
    }

    // 2. Fallback to localStorage
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const val = window.localStorage.getItem(key)
        if (val) {
          // Mirror back into cookie
          try {
            const maxAge = 365 * 24 * 60 * 60
            document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(val)}; path=/; max-age=${maxAge}; SameSite=Lax`
          } catch {}
          return val
        }
      }
    } catch {
      // ignore
    }

    // 3. Check for previous Supabase default session key in localStorage (migration helper)
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i)
          if (k && k.startsWith("sb-") && k.endsWith("-auth-token")) {
            const val = window.localStorage.getItem(k)
            if (val) {
              cookieAndLocalStorage.setItem(key, val)
              return val
            }
          }
        }
      }
    } catch {}

    return null
  },

  setItem: (key: string, value: string): void => {
    if (typeof document === "undefined") return

    // 1. Save to document.cookie (1-year expiration)
    try {
      const maxAge = 365 * 24 * 60 * 60
      document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`
    } catch (e) {
      console.error("Failed to write auth cookie:", e)
    }

    // 2. Mirror into localStorage
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value)
      }
    } catch {
      // ignore
    }
  },

  removeItem: (key: string): void => {
    if (typeof document === "undefined") return

    // 1. Remove from cookie
    try {
      document.cookie = `${encodeURIComponent(key)}=; path=/; max-age=0; SameSite=Lax`
    } catch {
      // ignore
    }

    // 2. Remove from localStorage
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key)
      }
    } catch {
      // ignore
    }
  },
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "balancebook-supabase-auth",
        storage: cookieAndLocalStorage,
      },
    })
  : null
