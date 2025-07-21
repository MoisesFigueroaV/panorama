"use client"

import type React from "react"
import { DynamicHeader } from "@/components/dynamic-header"
import SiteFooter from "@/components/site-footer"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <DynamicHeader />
      <main className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
