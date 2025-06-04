"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { apiClient, setAccessToken, setRefreshToken, getAccessToken } from "@/lib/api/apiClient"

// Definir los IDs de roles (idealmente vendrían de un archivo de constantes)
const ROLES = {
  ADMIN: 1,
  USUARIO_COMUN: 2, // Asumiendo que el ID 2 es para usuario común
  ORGANIZADOR: 3,
};

// Tipos que esperas de la respuesta de login del backend
// Esto debe coincidir con tu `loginResponseSchema` y `usuarioBaseResponseSchema` del backend.
interface UsuarioLoginData {
  id_usuario: number;
  nombre_usuario: string;
  correo: string;
  // `rol` es un objeto anidado y puede ser null o undefined si el usuario no tiene rol (raro después de login)
  rol?: { 
    id_rol: number; 
    nombre_rol: string;
  } | null; 
  // Añade otros campos que devuelve tu endpoint /auth/login para el objeto `usuario`
  // Por ejemplo: fecha_registro, sexo, fecha_nacimiento si los incluyes
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  usuario: UsuarioLoginData;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("user@example.com"); // Pre-rellenar para demo
  const [password, setPassword] = useState("password");   // Pre-rellenar para demo
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true); // Para el chequeo inicial de token

  useEffect(() => {
    const checkSession = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          // Validar el token obteniendo el perfil del usuario
          // apiClient.get ya debería manejar el refresh si es necesario
          const userResponse = await apiClient.get<UsuarioLoginData>('/usuarios/yo'); // Llama al endpoint de perfil
          const userData = userResponse.data;
          
          // Si la llamada es exitosa, el token es válido y tenemos datos del usuario
          console.log("Sesión activa, redirigiendo...");
          const userRolId = userData.rol?.id_rol;
          if (userRolId === ROLES.ADMIN) {
            router.replace("/admin/dashboard"); // Usar replace para no añadir al historial
          } else if (userRolId === ROLES.ORGANIZADOR) {
            router.replace("/organizador/dashboard");
          } else {
            router.replace("/dashboard");
          }
        } catch (error) {
          // Token inválido o expirado y refresh falló
          console.warn("Token existente inválido, limpiando sesión local:", error);
          setAccessToken(null); // Limpiar token inválido
          setRefreshToken(null);
          setIsCheckingSession(false); // Terminar chequeo
        }
      } else {
        setIsCheckingSession(false); // No hay token, terminar chequeo
      }
    };

    checkSession();
  }, [router]); // Ejecutar solo una vez al montar

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const responseData = await apiClient.post<LoginResponse>('/auth/login', { correo: email, contrasena: password });
      
      setAccessToken(responseData.data.accessToken);
      setRefreshToken(responseData.data.refreshToken);

      // Opcional: Guardar datos del usuario si los necesitas globalmente sin AuthContext
      if (typeof window !== 'undefined') {
          localStorage.setItem('userDataPanorama', JSON.stringify(responseData.data.usuario));
      }

      // Lógica de redirección basada en el rol del usuario
      const userRolId = responseData.data.usuario?.rol?.id_rol; // Acceso CORREGIDO

      if (userRolId === ROLES.ADMIN) {
        router.push("/admin/dashboard");
      } else if (userRolId === ROLES.ORGANIZADOR) {
        router.push("/organizador/dashboard");
      } else {
        // Si no tiene rol asignado o es un rol de usuario común
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Credenciales inválidas o error en el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar un loader mientras se verifica la sesión inicial
  if (isCheckingSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Verificando sesión...</p> {/* O un spinner más elegante */}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Iniciar sesión</CardTitle>
          <CardDescription className="text-center">Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
          {/* Caja de credenciales de demostración (opcional) */}
          <div className="mt-2 p-2 bg-muted rounded-md text-xs">
            <div className="font-medium">Credenciales de demostración:</div>
            <div className="grid grid-cols-2 gap-1 mt-1">
              <div className="font-medium">Usuario:</div> <div>user@example.com / password</div>
              <div className="font-medium">Organizador:</div> <div>organizer@example.com / password</div>
              <div className="font-medium">Admin:</div> <div>admin@example.com / password</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading}/>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading}/>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Regístrate
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}