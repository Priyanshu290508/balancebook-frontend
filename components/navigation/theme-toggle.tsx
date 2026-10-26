"use client"

import * as React from "react"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "@/lib/theme"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-card/90 text-foreground hover:bg-accent transition-all cursor-pointer shadow-xs"
      title={theme === "dark" ? "Light Mode" : "Dark Mode"}
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-amber-400 animate-in spin-in-90" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700 animate-in spin-in-90" />
      )}
    </button>
  )
}
