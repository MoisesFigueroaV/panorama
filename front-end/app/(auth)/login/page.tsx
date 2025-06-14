"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { ROLES, ROUTES_BY_ROLE } from "@/lib/constants"

export default function LoginPage() {
  const router = useRouter()
  const { login, user, isLoading: isAuthLoading, error: authError } = useAuth()
  
  const [email, setEmail] = useState("admin@example.com")
  const [password, setPassword] = useState("password")

  // Mover la redirección a un useEffect
  useEffect(() => {
    if (user && !isAuthLoading) {
      const userRolId = user.rol?.id_rol
      if (userRolId && ROUTES_BY_ROLE[userRolId as keyof typeof ROUTES_BY_ROLE]) {
        const targetRoute = ROUTES_BY_ROLE[userRolId as keyof typeof ROUTES_BY_ROLE]
        router.replace(targetRoute)
      }
    }
  }, [user, isAuthLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
    } catch (err) {
      console.error('Error en login:', err)
    }
  }

  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-muted/30">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verificando sesión...</p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Iniciar sesión</CardTitle>
          <CardDescription className="text-center">Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
          <div className="!mt-4 p-3 bg-muted rounded-md text-xs border">
            <div className="font-bold text-center mb-2">Credenciales de Demostración</div>
            <div className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1.5 items-center">
              <div className="font-medium text-right">Admin:</div> <div>admin@example.com</div>
              <div className="font-medium text-right">Organizador:</div> <div>organizer@example.com</div>
              <div className="font-medium text-right">Usuario:</div> <div>user@example.com</div>
              <div className="col-span-2 text-center mt-2 pt-2 border-t">Contraseña para todos: <strong>password</strong></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {authError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error de autenticación</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="tu@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                disabled={isAuthLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                disabled={isAuthLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isAuthLoading}>
              {isAuthLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-4">
          <div className="text-center text-sm">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Regístrate
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}