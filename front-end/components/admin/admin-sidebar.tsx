"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart, Calendar, Flag, Home, LogOut, Settings, Shield, Tag, Users, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/AuthContext"
import { toast } from "@/components/ui/use-toast"

interface Route {
  href: string
  icon: React.ElementType
  label: string
  badge?: string
}

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  const handleSignOut = async () => {
    try {
      await logout()
    router.push("/")
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al cerrar sesión. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const routes: Route[] = [
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
      href: "/admin/chat",
      icon: MessageSquare,
      label: "Chat",
    },
    // Comentado temporalmente hasta implementar la funcionalidad
    // {
    //   href: "/admin/reports",
    //   icon: Flag,
    //   label: "Reportes",
    //   badge: "8",
    // },
    {
      href: "/admin/settings",
      icon: Settings,
      label: "Configuración",
    },
  ]

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden md:flex flex-col w-64 bg-card border-r border-black/5">
      <div className="flex items-center gap-2 px-4 py-4 border-b">
        <Link href="/" className="font-bold text-2xl">
          Panorama
        </Link>
        <Badge className="ml-auto bg-primary">Admin</Badge>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-muted",
                pathname === route.href ? "bg-muted font-medium text-primary" : "text-muted-foreground",
              )}
            >
              <route.icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{route.label}</span>
              {route.badge && (
                <Badge className="ml-auto bg-destructive h-5 min-w-5 px-1 flex items-center justify-center flex-shrink-0">
                  {route.badge}
                </Badge>
              )}
            </Link>
          ))}
        </div>
      </nav>
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-muted text-muted-foreground justify-start font-normal"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  )
}
