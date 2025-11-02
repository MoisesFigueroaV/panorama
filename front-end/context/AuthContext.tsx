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
      console.log('🔍 Verificando sesión (simulado)...');
      const token = getAccessToken()
      if (token) {
        // In a real scenario, you would verify the token with the backend.
        // Here, we'll just assume the token is valid if it exists.
        // You might want to decode the token to get user info if it's a JWT.
      } else {
        await clearSession();
      }
    } catch (err) {
      console.error('❌ Error al verificar sesión (simulado):', err)
      await clearSession()
    } finally {
      console.log('🔍 Finalizando verificación de sesión (simulado)...');
      setIsLoadingSession(false)
    }
  }

  const clearSession = async () => {
    try {
      console.log('Limpiando tokens en el cliente API (simulado)...');
      clearAuthTokens()
      
      console.log('Limpiando cookies (simulado)...');
      deleteCookie('accessToken')
      deleteCookie('refreshToken')
      
      console.log('Limpiando estado local (simulado)...');
      setUser(null)
      setLocalAccessToken(null)
      
      console.log('Limpiando headers de la API (simulado)...');
      delete apiClient.defaults.headers.common['Authorization']
      
      console.log('Sesión limpiada completamente (simulado)');
    } catch (err) {
      console.error('Error al limpiar sesión (simulado):', err)
    }
  }

  const login = async (credentials: LoginUsuarioPayload) => {
    console.log('Iniciando login simulado con:', credentials.correo);

    const mockUsers: { [key: string]: UsuarioAuth } = {
      'admin@panorama.cl': {
        id_usuario: 1,
        nombre_usuario: 'Admin Panorama',
        correo: 'admin@panorama.cl',
        fecha_registro: '2025-01-01',
        rol: { id_rol: 1, nombre_rol: 'administrador' },
      },
      'organizer@panorama.cl': {
        id_usuario: 2,
        nombre_usuario: 'Organizador de Eventos',
        correo: 'organizer@panorama.cl',
        fecha_registro: '2025-01-01',
        rol: { id_rol: 2, nombre_rol: 'organizador' },
      },
      'user@panorama.cl': {
        id_usuario: 3,
        nombre_usuario: 'Usuario Final',
        correo: 'user@panorama.cl',
        fecha_registro: '2025-01-01',
        rol: { id_rol: 3, nombre_rol: 'usuario' },
      },
    };

    const user = mockUsers[credentials.correo];

    if (user && credentials.contrasena === 'admin123') { // Using a generic password for all mock users for simplicity
      const mockResponse = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        usuario: user,
      };

      console.log('Respuesta del login simulado:', mockResponse);
      
      setAccessToken(mockResponse.accessToken);
      setRefreshToken(mockResponse.refreshToken);
      setUser(mockResponse.usuario);
      setLocalAccessToken(mockResponse.accessToken);

      console.log('Usuario después del login simulado:', mockResponse.usuario);
      console.log('Rol del usuario:', mockResponse.usuario.rol);

      // Redirección específica por rol
      if (mockResponse.usuario.rol?.id_rol === 1) {
        console.log('Redirigiendo a /admin');
        router.push('/admin');
      } else if (mockResponse.usuario.rol?.id_rol === 2) {
        console.log('Redirigiendo a /organizers/dashboard');
        router.push('/organizers/dashboard');
      } else if (mockResponse.usuario.rol?.id_rol === 3) {
        console.log('Redirigiendo a /users/profile');
        router.push('/users/profile');
      } else {
        console.log('No se encontró rol válido, redirigiendo a /');
        router.push('/');
      }
    } else {
      console.error('Error en login simulado: credenciales incorrectas');
      throw new Error('Correo o contraseña incorrectos');
    }
  };

  const logout = async () => {
    try {
      console.log('Iniciando logout (simulado)...');
      
      await clearSession()
      console.log('Sesión limpiada exitosamente (simulado)');
      
      console.log('Redirigiendo a página principal...');
      router.push('/')
    } catch (err) {
      console.error('Error durante el logout (simulado):', err)
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