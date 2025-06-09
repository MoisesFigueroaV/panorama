"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react" // Importamos un ícono de carga más visual
import Link from "next/link"

// =================================================================================
// MODIFICACIÓN 1: Depender del AuthContext en lugar de la lógica local
// Asumimos que has creado un AuthContext como se discutió.
// Este hook centraliza toda la lógica de login, logout, y gestión de tokens/usuario.
// =================================================================================
import { useAuth } from "@/context/AuthContext" // Asegúrate de que esta ruta sea la correcta
import { ROLES_IDS } from "@/../back-end/src/config/constants" // Buena práctica: usar constantes para los roles

export default function LoginPage() {
  const router = useRouter();

  // =================================================================================
  // MODIFICACIÓN 2: Usar el estado y las funciones del AuthContext
  // Esto simplifica el componente, ya que no necesita manejar su propio estado
  // de carga, error de autenticación o la sesión del usuario.
  // =================================================================================
  const { login, user, isLoading: isAuthLoading, error: authError } = useAuth();
  
  // Mantenemos estados locales solo para los campos del formulario
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password");

  // =================================================================================
  // MODIFICACIÓN 3: El efecto de redirección ahora es más simple y robusto
  // Reacciona a si el `user` en el contexto cambia, cubriendo tanto el login
  // exitoso como el caso en que un usuario ya logueado visita esta página.
  // =================================================================================
  useEffect(() => {
    if (user && !isAuthLoading) {
      console.log(`Usuario ${user.nombre_usuario} (Rol: ${user.rol?.nombre_rol}) ya autenticado. Redirigiendo...`);
      const userRolId = user.rol?.id_rol;

      if (userRolId === ROLES_IDS.ADMINISTRADOR) {
        router.replace("/admin");
      } else if (userRolId === ROLES_IDS.ORGANIZADOR) {
        router.replace("/organizers/dashboard"); // Ajusta esta ruta si es necesario
      } else {
        router.replace("/users/profile"); // Ruta por defecto para otros roles
      }
    }
  }, [user, isAuthLoading, router]);

  // =================================================================================
  // MODIFICACIÓN 4: El `handleSubmit` ahora es más limpio.
  // Delega toda la lógica de la llamada a la API, manejo de tokens y errores
  // a la función `login` del contexto.
  // =================================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  // =================================================================================
  // MODIFICACIÓN 5: Mejorar la experiencia de usuario durante la carga inicial.
  // El AuthProvider se encarga de verificar si hay un token válido. Mientras lo hace,
  // `isAuthLoading` será true. Mostramos un loader para evitar parpadeos.
  // =================================================================================
  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-muted/30">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verificando sesión...</p>
      </div>
    );
  }

  // Si el efecto de redirección ya encontró un usuario, este componente no debería renderizar nada
  // mientras el router hace su trabajo. Esto evita que se vea el formulario por un instante.
  if (user) {
    return null; 
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Iniciar sesión</CardTitle>
          <CardDescription className="text-center">Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
          {/* Caja de credenciales de demostración, mejorada para claridad */}
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
          {/* El `Alert` ahora se alimenta del estado de error del contexto */}
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
              <Input id="email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isAuthLoading}/>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isAuthLoading}/>
            </div>
            <Button type="submit" className="w-full" disabled={isAuthLoading}>
              {/* Feedback visual mejorado en el botón durante la carga */}
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
  );
}