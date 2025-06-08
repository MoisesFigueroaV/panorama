"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { apiClient, getAccessToken } from "@/lib/api/apiClient"

interface User {
  id_usuario: number;
  nombre_usuario: string;
  correo: string;
  rol?: {
    id_rol: number;
    nombre_rol: string;
  } | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken()
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const userData = await apiClient.get<User>('/usuarios/yo')
        setUser(userData.data)
      } catch (error) {
        console.error('Error al verificar autenticación:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
