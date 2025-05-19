"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Calendar, CreditCard, Heart, Home, LogOut, Settings, Ticket, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  // Función simulada de cierre de sesión
  const handleSignOut = () => {
    router.push("/")
  }

  const routes = [
    {
      href: "/dashboard",
      icon: Home,
      label: "Dashboard",
    },
    {
      href: "/dashboard/profile",
      icon: User,
      label: "Mi perfil",
    },
    {
      href: "/dashboard/favorites",
      icon: Heart,
      label: "Favoritos",
    },
    {
      href: "/dashboard/tickets",
      icon: Ticket,
      label: "Mis tickets",
    },
    {
      href: "/dashboard/calendar",
      icon: Calendar,
      label: "Calendario",
    },
    {
      href: "/dashboard/payments",
      icon: CreditCard,
      label: "Pagos",
    },
    {
      href: "/dashboard/settings",
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
