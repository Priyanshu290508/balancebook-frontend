"use client"

import * as React from "react"

export interface BrandList {
  image: string
  lightimg?: string
  name: string
}

interface BrandSliderProps {
  brandList: BrandList[]
}

export default function BrandSlider({ brandList }: BrandSliderProps) {
  return (
    <div className="relative w-full overflow-hidden border-y border-border/60 bg-muted/30 py-8 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center mb-5">
        <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
          दुकानों में बिकने वाले प्रमुख ब्रांड्स और श्रेणियों का आसान हिसाब
        </p>
      </div>

      <div className="flex w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <div className="flex shrink-0 animate-marquee items-center gap-10 md:gap-16 pr-10">
          {brandList.concat(brandList).map((brand, index) => (
            <div
              key={index}
              className="flex items-center gap-2.5 grayscale opacity-70 transition-all hover:grayscale-0 hover:opacity-100"
            >
              <img
                src={brand.image}
                alt={brand.name}
                className="h-8 max-w-[120px] object-contain"
                onError={(e) => {
                  // Fallback to text pill if svg fails to load
                  const target = e.currentTarget
                  target.style.display = "none"
                }}
              />
              <span className="text-sm font-semibold text-foreground/80 tracking-tight">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
