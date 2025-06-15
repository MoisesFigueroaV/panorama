"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, Menu, User, Bell, LayoutDashboard, Settings, LogOut } from "lucide-react"
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
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

interface PublicHeaderProps {
  userRole?: number
}

export function PublicHeader({ userRole }: PublicHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { logout } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await logout()
    router.push('/')
  }

  const renderUserMenu = () => {
    if (!userRole) {
      return (
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Iniciar sesión</Button>
          </Link>
          <Link href="/register">
            <Button>Registrarse</Button>
          </Link>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-secondary-foreground hover:text-primary hover:bg-secondary-foreground/10">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notificaciones</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-secondary-foreground hover:text-primary hover:bg-secondary-foreground/10">
              <User className="h-5 w-5" />
              <span className="sr-only">Menú de usuario</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {userRole === 1 ? (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/admin">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Panel de Administrador
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userRole === 3 && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/organizer/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard Organizador
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Configuración
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
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

          {renderUserMenu()}

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
                {userRole && (
                  <>
                    <DropdownMenuSeparator />
                    {userRole === 1 ? (
                      <>
                        <Link
                          href="/admin"
                          className="text-lg font-medium transition-colors hover:text-primary"
                          onClick={() => setIsOpen(false)}
                        >
                          Panel de Administrador
                        </Link>
                        <button
                          onClick={() => {
                            handleSignOut()
                            setIsOpen(false)
                          }}
                          className="text-lg font-medium text-red-500 hover:text-red-600 text-left"
                        >
                          Cerrar sesión
                        </button>
                      </>
                    ) : (
                      <>
                        {userRole === 3 && (
                          <Link
                            href="/organizer/dashboard"
                            className="text-lg font-medium transition-colors hover:text-primary"
                            onClick={() => setIsOpen(false)}
                          >
                            Dashboard Organizador
                          </Link>
                        )}
                        <Link
                          href="/profile"
                          className="text-lg font-medium transition-colors hover:text-primary"
                          onClick={() => setIsOpen(false)}
                        >
                          Perfil
                        </Link>
                        <Link
                          href="/settings"
                          className="text-lg font-medium transition-colors hover:text-primary"
                          onClick={() => setIsOpen(false)}
                        >
                          Configuración
                        </Link>
                        <button
                          onClick={() => {
                            handleSignOut()
                            setIsOpen(false)
                          }}
                          className="text-lg font-medium text-red-500 hover:text-red-600 text-left"
                        >
                          Cerrar sesión
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
