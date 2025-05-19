"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart, Calendar, Flag, Home, LogOut, Settings, Shield, Tag, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  // Función simulada de cierre de sesión
  const handleSignOut = () => {
    router.push("/")
  }

  const routes = [
    {
      href: "/admin",
      icon: Home,
      label: "Dashboard",
    },
    {
      href: "/admin/users",
      icon: Users,
      label: "Usuarios",
    },
    {
      href: "/admin/events",
      icon: Calendar,
      label: "Eventos",
    },
    {
      href: "/admin/organizers",
      icon: Shield,
      label: "Organizadores",
    },
    {
      href: "/admin/categories",
      icon: Tag,
      label: "Categorías",
    },
    {
      href: "/admin/reports",
      icon: Flag,
      label: "Reportes",
      badge: "8",
    },
    {
      href: "/admin/settings",
      icon: Settings,
      label: "Configuración",
    },
  ]

  return (
    <div className="hidden md:flex flex-col h-screen w-64 bg-card border-r border-black/5 p-4">
      <div className="flex items-center gap-2 px-2 mb-8">
        <Link href="/" className="font-bold text-2xl">
          Panorama
        </Link>
        <Badge className="ml-auto bg-primary">Admin</Badge>
      </div>
      <div className="space-y-1 flex-1">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-muted",
              pathname === route.href ? "bg-muted font-medium text-primary" : "text-muted-foreground",
            )}
          >
            <route.icon className="h-4 w-4" />
            {route.label}
            {route.badge && (
              <Badge className="ml-auto bg-destructive h-5 min-w-5 px-1 flex items-center justify-center">
                {route.badge}
              </Badge>
            )}
          </Link>
        ))}
      </div>
      <Button
        variant="ghost"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-muted text-muted-foreground justify-start font-normal mt-auto"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </Button>
    </div>
  )
}
