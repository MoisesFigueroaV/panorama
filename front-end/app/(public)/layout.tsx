"use client"

import type React from "react"
import { DynamicHeader } from "@/components/dynamic-header"
import { PublicFooter } from "@/components/public/public-footer"
import { usePathname } from "next/navigation"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith('/admin')

  // No mostrar el header ni el footer en rutas de admin
  if (isAdminRoute) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DynamicHeader />
      <div className="flex-1">{children}</div>
      <PublicFooter />
    </div>
  )
}
