"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiClient, setAccessToken, setRefreshToken, getAccessToken, clearAuthTokens } from '@/lib/api/apiClient'
import { useRouter } from 'next/navigation'
import { deleteCookie, getCookie } from 'cookies-next'

// Definir tipos para el payload y la respuesta del usuario
interface UsuarioAuth {
  id_usuario: number;
  nombre_usuario: string;
  correo: string;
  fecha_registro: string;
  rol?: { id_rol: number; nombre_rol: string } | null;
  foto_perfil?: string | null;
  biografia?: string | null;
  intereses?: string[];
  telefono?: string | null;
  ubicacion?: string | null;
}

interface LoginUsuarioPayload {
  correo: string;
  contrasena: string;
}

interface RegistroUsuarioPayload {
  nombre_usuario: string;
  correo: string;
  contrasena: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UsuarioAuth | null;
  accessToken: string | null;
  isLoadingSession: boolean;
  login: (credentials: LoginUsuarioPayload) => Promise<void>;
  register: (data: RegistroUsuarioPayload) => Promise<UsuarioAuth>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UsuarioAuth | null>(null);
  const [localAccessToken, setLocalAccessToken] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const router = useRouter();

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
      setIsLoadingSession(false)
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
      setLocalAccessToken(null)
      
      // Limpiar headers de la API
      delete apiClient.defaults.headers.common['Authorization']
    } catch (err) {
      console.error('Error al limpiar sesión:', err)
    }
  }

  const login = async (credentials: LoginUsuarioPayload) => {
    try {
      console.log('Iniciando login con:', credentials.correo);
      const { data: response } = await apiClient.post<{ accessToken: string; refreshToken: string; usuario: UsuarioAuth }>('/auth/login', credentials);
      console.log('Respuesta del login:', response);
      
      setAccessToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      setUser(response.usuario);
      setLocalAccessToken(response.accessToken);

      console.log('Usuario después del login:', response.usuario);
      console.log('Rol del usuario:', response.usuario.rol);

      // Redirección específica por rol
      if (response.usuario.rol?.id_rol === 1) {
        console.log('Redirigiendo a /admin');
        router.push('/admin');
      } else if (response.usuario.rol?.id_rol === 2) {
        console.log('Redirigiendo a /organizer/dashboard');
        router.push('/organizer/dashboard');
      } else if (response.usuario.rol?.id_rol === 3) {
        console.log('Redirigiendo a /users/profile');
        router.push('/users/profile');
      } else {
        console.log('No se encontró rol válido, redirigiendo a /');
        router.push('/');
      }
    } catch (error) {
      console.error("Error en login (AuthContext):", error);
      throw error;
    }
  };

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

  const register = async (data: RegistroUsuarioPayload): Promise<UsuarioAuth> => {
    try {
      const { data: registeredUser } = await apiClient.post<UsuarioAuth>('/auth/registro', data);
      return registeredUser;
    } catch (error) {
      console.error("Error en register (AuthContext):", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: !!localAccessToken && !!user, 
      user, 
      accessToken: localAccessToken, 
      isLoadingSession, 
      login, 
      register,
      logout 
    }}>
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