"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiClient, setAccessToken, setRefreshToken, getAccessToken, clearAuthTokens } from '@/lib/api/apiClient'
import { useRouter, usePathname } from 'next/navigation'
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
  const pathname = usePathname();

  // Verificar sesión al cargar y configurar interceptor
  useEffect(() => {
    checkSession()
    setupAuthInterceptor()
  }, [])

  const setupAuthInterceptor = () => {
    // Configurar interceptor para manejar renovación de tokens
    apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Si el error es 401 y no es una solicitud de refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = getCookie('refreshToken') as string;
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            // Intentar refrescar el token
            const response = await apiClient.post('/auth/refresh', {
              refreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data;

            // Actualizar tokens
            setAccessToken(accessToken);
            setRefreshToken(newRefreshToken);
            setLocalAccessToken(accessToken);

            // Reintentar la solicitud original
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
          } catch (refreshError) {
            // Si falla el refresh, limpiar sesión
            await clearSession();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  };

  const checkSession = async () => {
    try {
      const token = getAccessToken()
      if (token) {
        // Configurar el token en el cliente API
        setAccessToken(token)
        setLocalAccessToken(token)
        
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
      console.log('Limpiando tokens en el cliente API...');
      // Limpiar tokens en el cliente API
      clearAuthTokens()
      
      console.log('Limpiando cookies...');
      // Limpiar cookies
      deleteCookie('accessToken')
      deleteCookie('refreshToken')
      
      console.log('Limpiando estado local...');
      // Limpiar estado
      setUser(null)
      setLocalAccessToken(null)
      
      console.log('Limpiando headers de la API...');
      // Limpiar headers de la API
      delete apiClient.defaults.headers.common['Authorization']
      
      console.log('Sesión limpiada completamente');
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
        console.log('Redirigiendo a /organizers/dashboard');
        router.push('/organizers/dashboard');
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
      console.log('Iniciando logout...');
      
      // Limpiar toda la sesión localmente
      console.log('Limpiando sesión local...');
      await clearSession()
      console.log('Sesión limpiada exitosamente');
      
      // Redirigir a la página principal
      console.log('Redirigiendo a página principal...');
      router.push('/')
    } catch (err) {
      console.error('Error durante el logout:', err)
      // Aún así, intentar limpiar la sesión y redirigir a la principal
      await clearSession()
      router.push('/')
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