"use client"

import * as React from "react"
import HeroSection from "@/components/ui/hero-01-utils/hero"
import type { NavigationSection } from "@/components/ui/hero-01-utils/header"
import Header from "@/components/ui/hero-01-utils/header"
import BrandSlider, {
  BrandList,
} from "@/components/ui/hero-01-utils/brand-slider"
import type { AvatarList } from "@/components/ui/hero-01-utils/hero"

export default function AgencyHeroSection() {
  const avatarList: AvatarList[] = [
    {
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80",
    },
    {
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80",
    },
    {
      image:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80",
    },
    {
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80",
    },
  ]

  const navigationData: NavigationSection[] = [
    {
      title: "होम (Home)",
      href: "/",
      isActive: true,
    },
    {
      title: "डैशबोर्ड (Dashboard)",
      href: "/dashboard",
    },
    {
      title: "सामान सूची (Items)",
      href: "/products",
    },
    {
      title: "माल खरीदा (Purchases)",
      href: "/purchases",
    },
    {
      title: "बिक्री (Sales)",
      href: "/sales",
    },
    {
      title: "लेन-देन इतिहास (History)",
      href: "/history",
    },
  ]

  const brandList: BrandList[] = [
    {
      image: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instacart.svg",
      name: "किराना ग्रोसरी (Kirana)",
    },
    {
      image: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/target.svg",
      name: "अनाज व दालें (Grains & Pulses)",
    },
    {
      image: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/nestle.svg",
      name: "डेयरी व दूध (Dairy & Milk)",
    },
    {
      image: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/deliveroo.svg",
      name: "तेल व मसाले (Oil & Spices)",
    },
    {
      image: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/walmart.svg",
      name: "पैकेज्ड फूड (Packaged Foods)",
    },
  ]

  return (
    <div className="relative">
      <Header navigationData={navigationData} />
      <main>
        <HeroSection avatarList={avatarList} />
        <BrandSlider brandList={brandList} />
      </main>
    </div>
  )
}
