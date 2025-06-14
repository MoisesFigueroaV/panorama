"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiClient, setAccessToken, setRefreshToken, getAccessToken, clearAuthTokens } from '@/lib/api/apiClient'
import { useRouter } from 'next/navigation'
import { deleteCookie, getCookie } from 'cookies-next'

interface AuthContextType {
  user: any | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
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
        // La respuesta viene en un array, tomamos el primer elemento
        setUser(response.data[0])
      } else {
        // Si no hay token, limpiar todo
        await clearSession()
      }
    } catch (err) {
      console.error('Error al verificar sesión:', err)
      await clearSession()
    } finally {
      setIsLoading(false)
    }
  }

  const clearSession = async () => {
    try {
      // Limpiar tokens en el cliente API
      clearAuthTokens()
      
      // Limpiar cookies
      deleteCookie('accessToken')
      deleteCookie('refreshToken')
      
      // Limpiar estado
      setUser(null)
      setError(null)
      
      // Limpiar headers de la API
      delete apiClient.defaults.headers.common['Authorization']
    } catch (err) {
      console.error('Error al limpiar sesión:', err)
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
      await clearSession()
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Intentar hacer logout en el backend si hay token
      const token = getAccessToken()
      if (token) {
        try {
          await apiClient.post('/auth/logout')
        } catch (err) {
          console.error('Error al hacer logout en el backend:', err)
        }
      }

      // Limpiar toda la sesión
      await clearSession()
      
      // Redirigir al login
      router.push('/login')
      
      // Forzar recarga de la página para limpiar cualquier estado residual
      window.location.href = '/login'
    } catch (err) {
      console.error('Error durante el logout:', err)
      // Aún así, intentar limpiar la sesión y redirigir
      await clearSession()
      router.push('/login')
    }
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