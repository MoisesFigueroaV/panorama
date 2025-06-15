"use client"

import { useAuth } from "@/context/AuthContext"
import { apiClient, handleLogoutClient } from "@/lib/api/apiClient"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, Menu, User, LogOut, Bell } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"

export default function SiteHeader() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const isAuthenticated = !!user

  const handleSignOut = async () => {
    try {
      await logout();
      // Recargar la página principal después de cerrar sesión
      window.location.href = '/';
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al cerrar sesión. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/30 bg-white text-secondary-foreground">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-xl">
            <span className="text-gradient text-2xl font-extrabold">Panorama</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Inicio
            </Link>
            <Link href="/events" className="text-sm font-medium transition-colors hover:text-primary">
              Eventos
            </Link>
            <Link href="/map" className="text-sm font-medium transition-colors hover:text-primary">
              Mapa
            </Link>
            <Link href="/categories" className="text-sm font-medium transition-colors hover:text-primary">
              Categorías
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex text-secondary-foreground hover:text-primary hover:bg-secondary-foreground/10"
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Buscar</span>
          </Button>

          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-secondary-foreground hover:text-primary hover:bg-secondary-foreground/10"
              >
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notificaciones</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitials(user?.nombre_usuario || "")}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.nombre_usuario}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.correo}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/users/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-secondary-foreground hover:text-primary hover:bg-secondary-foreground/10"
                >
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-primary text-white hover:bg-primary/90">Registrarse</Button>
              </Link>
            </div>
          )}

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-secondary-foreground hover:text-primary hover:bg-secondary-foreground/10"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] sm:w-[400px] bg-white text-secondary-foreground border-l border-primary/30"
            >
              <div className="flex flex-col gap-6 py-6">
                {isAuthenticated && (
                  <div className="flex items-center gap-4 mb-2 pb-4 border-b border-primary/10">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{getInitials(user?.nombre_usuario || "")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user?.nombre_usuario}</p>
                      <p className="text-xs text-muted-foreground">{user?.correo}</p>
                    </div>
                  </div>
                )}

                <Link
                  href="/"
                  className="text-lg font-medium transition-colors hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Inicio
                </Link>
                <Link
                  href="/events"
                  className="text-lg font-medium transition-colors hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Eventos
                </Link>
                <Link
                  href="/map"
                  className="text-lg font-medium transition-colors hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Mapa
                </Link>
                <Link
                  href="/categories"
                  className="text-lg font-medium transition-colors hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Categorías
                </Link>

                {isAuthenticated ? (
                  <div className="flex flex-col gap-2 mt-4">
                    <Link href="/users/profile" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full border-primary/30 text-secondary-foreground hover:bg-secondary-foreground/10"
                      >
                        Mi Perfil
                      </Button>
                    </Link>
                    <Button
                      className="w-full bg-primary text-white hover:bg-primary/90"
                      onClick={() => {
                        setIsOpen(false)
                        handleSignOut()
                      }}
                    >
                      Cerrar sesión
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 mt-4">
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full border-primary/30 text-secondary-foreground hover:bg-secondary-foreground/10"
                      >
                        Iniciar sesión
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-primary text-white hover:bg-primary/90">Registrarse</Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
