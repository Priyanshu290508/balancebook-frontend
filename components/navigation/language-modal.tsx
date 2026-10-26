"use client"

import * as React from "react"
import { Globe, Search, Check, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useTranslation, SUPPORTED_LANGUAGES, LanguageCode } from "@/lib/i18n"

export function LanguageModal() {
  const { language, setLanguage, currentLanguageInfo, t, isEn } = useTranslation()
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const filteredLanguages = React.useMemo(() => {
    return SUPPORTED_LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
        l.region.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  const handleSelectLanguage = (code: LanguageCode) => {
    setLanguage(code)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="flex items-center gap-1.5 rounded-full border border-border/80 bg-card/90 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent hover:border-emerald-500/60 transition-all cursor-pointer shadow-xs"
          title={t("change_language", "Change Language")}
        >
          <Globe className="h-3.5 w-3.5 text-emerald-600" />
          <span>{currentLanguageInfo.flag}</span>
          <span className="hidden sm:inline font-bold">{currentLanguageInfo.nativeName}</span>
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[90%] sm:max-w-md overflow-y-auto">
        <SheetHeader className="text-left pb-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-base font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <span>{t("change_language", "Change Language")}</span>
              <p className="text-xs font-normal text-muted-foreground">
                {t("select_preferred_language", "Select your preferred language")}
              </p>
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* Search */}
        <div className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("search_language", "Search language...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 rounded-xl"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Languages List */}
        <div className="space-y-2 pb-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            {t("available_languages", "Available Languages")} ({filteredLanguages.length})
          </p>

          <div className="grid grid-cols-1 gap-2">
            {filteredLanguages.map((item) => {
              const isSelected = language === item.code

              return (
                <button
                  key={item.code}
                  onClick={() => handleSelectLanguage(item.code)}
                  className={`flex items-center justify-between rounded-xl p-3 text-left transition-all cursor-pointer border ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/60 shadow-xs ring-1 ring-emerald-600/30"
                      : "border-border/70 hover:bg-muted/40 hover:border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.flag}</span>
                    <div>
                      <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                        {item.nativeName}
                        <span className="text-xs font-normal text-muted-foreground">
                          ({item.name})
                        </span>
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        {item.region}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-white">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Info pill */}
        <div className="rounded-xl border border-border/80 bg-muted/30 p-3 text-xs text-muted-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>
            {isEn
              ? "Selecting a language instantly updates the entire app, dashboard, items, and forms."
              : "भाषा बदलते ही पूरा ऐप, डैशबोर्ड और फॉर्म्स तुरंत चुनी गई भाषा में बदल जाएंगे।"}
          </span>
        </div>
      </SheetContent>
    </Sheet>
  )
}
