"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"
import { useDataMode } from "@/lib/hooks/useLocalData"

export function DebugInfo() {
  const { isLoadingSession, isAuthenticated, accessToken, user } = useAuth()
  const { isLocalMode } = useDataMode()

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <Card className="mb-4 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-sm">Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-1">
        <p>Modo Local: {isLocalMode ? 'Activado' : 'Desactivado'}</p>
        <p>isLoadingSession: {isLoadingSession.toString()}</p>
        <p>isAuthenticated: {isAuthenticated.toString()}</p>
        <p>accessToken: {accessToken ? 'Presente' : 'Ausente'}</p>
        <p>user: {user ? `${user.nombre_usuario} (ID: ${user.id_usuario})` : 'No hay usuario'}</p>
      </CardContent>
    </Card>
  )
} 