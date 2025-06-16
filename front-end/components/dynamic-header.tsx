"use client"

import { useAuth } from "@/context/AuthContext"
import { PublicHeader } from "@/components/public/public-header"
import { usePathname } from "next/navigation"

export function DynamicHeader() {
  const { user, isLoadingSession } = useAuth()
  const pathname = usePathname()

  // No mostrar ningún header en rutas de admin o si está cargando
  if (isLoadingSession || pathname.startsWith('/admin')) {
    return null
  }

  // Siempre mostrar el header público, pero con diferentes opciones según el rol
  return <PublicHeader userRole={user?.rol?.id_rol} />
} 