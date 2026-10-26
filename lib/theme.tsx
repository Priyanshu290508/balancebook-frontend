"use client"

import * as React from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("light")

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("dukan_khata_theme") as Theme | null
      if (saved === "dark" || saved === "light") {
        setThemeState(saved)
        document.documentElement.classList.toggle("dark", saved === "dark")
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setThemeState("dark")
        document.documentElement.classList.add("dark")
      }
    } catch {}
  }, [])

  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
    try {
      localStorage.setItem("dukan_khata_theme", newTheme)
    } catch {}
  }, [])

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light")
  }, [theme, setTheme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}
