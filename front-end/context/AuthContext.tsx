"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiClient, setAccessToken, setRefreshToken, getAccessToken } from '@/lib/api/apiClient'

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

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    const token = getAccessToken()
    if (token) {
      try {
        const response = await apiClient.get('/usuarios/yo')
        setUser(response.data)
      } catch (err) {
        setAccessToken(null)
        setRefreshToken(null)
      }
    }
    setIsLoading(false)
  }

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      const response = await apiClient.post('/auth/login', { correo: email, contrasena: password })
      setAccessToken(response.data.accessToken)
      setRefreshToken(response.data.refreshToken)
      setUser(response.data.usuario)
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
      throw err
    }
  }

  const logout = () => {
    setAccessToken(null)
    setRefreshToken(null)
    setUser(null)
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