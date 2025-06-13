"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiClient, setAccessToken, setRefreshToken, getAccessToken } from '@/lib/api/apiClient'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: any | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const token = getAccessToken()
      if (token) {
        // Configurar el token en el cliente API
        setAccessToken(token)
        
        // Verificar la sesión con el backend
        const response = await apiClient.get('/usuarios/yo')
        setUser(response.data)
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error('Error al verificar sesión:', err)
      setAccessToken(null)
      setRefreshToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      setIsLoading(true)
      const response = await apiClient.post('/auth/login', { correo: email, contrasena: password })
      
      // Guardar tokens
      setAccessToken(response.data.accessToken)
      setRefreshToken(response.data.refreshToken)
      
      // Guardar usuario
      setUser(response.data.usuario)
      
      // Configurar el token en el cliente API
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
      setAccessToken(null)
      setRefreshToken(null)
      setUser(null)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setAccessToken(null)
    setRefreshToken(null)
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
} 