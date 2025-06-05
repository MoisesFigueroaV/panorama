// /front-end/app/(auth)/register/page.tsx
"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { apiClient } from "@/lib/api/apiClient" // <--- IMPORTA apiClient
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Tipos para el payload y la respuesta (deberían coincidir con tu backend)
interface RegistroPayload {
  nombre_usuario: string;
  correo: string;
  contrasena: string;
  sexo?: 'M' | 'F' | 'O' | null;
  fecha_nacimiento?: string | null; // YYYY-MM-DD
}


export default function RegisterPage() {
  const router = useRouter()
  const [nombre_usuario, setNombreUsuario] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [sexo, setSexo] = useState<'M' | 'F' | 'O' | null>(null)
  const [sexoUI, setSexoUI] = useState<'M' | 'F' | 'O' | 'N'>('N')
  const [fecha_nacimiento, setFechaNacimiento] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false) // Cambiado de isSubmitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) {
        setError("Debes aceptar los términos y condiciones.");
        return;
    }
    setIsLoading(true);
    setError(null);

    const payload: RegistroPayload = {
      nombre_usuario,
      correo: email,
      contrasena: password,
      sexo,
      fecha_nacimiento,
    };

    try {
      console.log("RESULTADO DE ESTO XDDD", payload)
      const result = await apiClient.post('/auth/registro', payload);
      console.log("RESULTADO DE ESTO XDDD", result)
      alert("¡Registro exitoso! Por favor, inicia sesión."); // Mejor usar un toast/modal
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Error en el registro. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Crear una cuenta</CardTitle>
          <CardDescription className="text-center">Ingresa tus datos para registrarte en la plataforma</CardDescription>
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
              <Label htmlFor="nombre_usuario">Nombre completo</Label>
              <Input id="nombre_usuario" type="text" placeholder="Tu nombre" value={nombre_usuario} onChange={(e) => setNombreUsuario(e.target.value)} required disabled={isLoading}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading}/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sexo">Sexo</Label>
                <Select 
                  value={sexoUI} 
                  onValueChange={(value) => {
                    setSexoUI(value as 'M' | 'F' | 'O' | 'N');
                    setSexo(value === 'N' ? null : value as 'M' | 'F' | 'O');
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger id="sexo">
                    <SelectValue placeholder="Selecciona tu sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="N">No especificar</SelectItem>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Femenino</SelectItem>
                    <SelectItem value="O">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha_nacimiento">Fecha de nacimiento</Label>
                <Input
                  id="fecha_nacimiento"
                  type="date" // El navegador mostrará un date picker
                  value={fecha_nacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                  disabled={isLoading}
                  // Opcional: puedes añadir validaciones de min/max fecha si es necesario
                  // max={new Date().toISOString().split("T")[0]} // Ejemplo: no permitir fechas futuras
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" required checked={acceptTerms} onCheckedChange={(checked) => setAcceptTerms(!!checked)} disabled={isLoading}/>
              <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Acepto los <Link href="/terms" className="text-primary hover:underline">términos y condiciones</Link>
              </label>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registrando..." : "Registrarse"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">¿Quieres crear y gestionar eventos?</p>
            <Link href="/register/organizer">
              <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
                Convertirme en organizador
              </Button>
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Iniciar sesión
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}