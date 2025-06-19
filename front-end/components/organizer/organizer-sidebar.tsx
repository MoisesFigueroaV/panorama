"use client"

import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Calendar, Globe, Home, LogOut, MessageSquare, PlusCircle, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/context/AuthContext"

export function OrganizerSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  // Función de cierre de sesión que limpia el estado de autenticación
  const handleSignOut = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      // Aún redirigir a la página principal en caso de error
      router.push("/")
    }
  }

  const routes = [
    {
      href: "/organizers/dashboard",
      icon: Home,
      label: "Dashboard",
    },
    {
      href: "/organizers/dashboard/events",
      icon: Calendar,
      label: "Mis eventos",
    },
    {
      href: "/organizers/dashboard/events/create",
      icon: PlusCircle,
      label: "Crear evento",
    },
    {
      href: "/organizers/dashboard/messages",
      icon: MessageSquare,
      label: "Mensajes",
    },
    {
      href: "/organizers/dashboard/profile",
      icon: Users,
      label: "Mi Perfil",
    },
    {
      href: "/organizers/dashboard/profile/public",
      icon: Globe,
      label: "Perfil Público",
    },
  ]

  return (
    <div className="hidden md:flex flex-col h-screen w-64 bg-card border-r border-black/5 p-4">
      <div className="flex items-center gap-2 px-2 mb-8">
        <Link href="/" className="font-bold text-2xl">
          Panorama
        </Link>
        <Badge variant="outline" className="ml-auto">
          Organizador
        </Badge>
      </div>
      <ScrollArea className="flex-1 -mx-4 px-4">
        <div className="space-y-1 pr-2">
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
      </ScrollArea>
      <Button
        variant="ghost"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-muted text-muted-foreground justify-start font-normal mt-4"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </Button>
    </div>
  )
}
