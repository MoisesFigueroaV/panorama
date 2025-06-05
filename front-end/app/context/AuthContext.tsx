// /front-end/src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { apiClient, setAccessToken, setRefreshToken, getAccessToken, handleLogoutClient } from '../../lib/api/apiClient'; // Ajusta la ruta
import { useRouter } from 'next/navigation'; // Para redirecciones

// Definir tipos para el payload y la respuesta del usuario
// Estos deberían coincidir con tus schemas Zod/Elysia del backend
interface UsuarioAuth {
  id_usuario: number;
  nombre_usuario: string;
  correo: string;
  rol?: { id_rol: number; nombre_rol: string } | null;
  // ...otros campos que devuelve tu endpoint /usuarios/yo
}

interface LoginUsuarioPayload { // Del backend usuario.types.ts
  correo: string;
  contrasena: string;
}

interface RegistroUsuarioPayload { // Del backend usuario.types.ts
  nombre_usuario: string;
  correo: string;
  contrasena: string;
  sexo?: 'M' | 'F' | 'O' | null;
  fecha_nacimiento?: string | null;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UsuarioAuth | null>(null);
  const [localAccessToken, setLocalAccessToken] = useState<string | null>(() => getAccessToken()); // Leer del storage al inicio
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const router = useRouter();

  const syncUserSession = useCallback(async (token: string | null) => {
    if (token) {
      try {
        const userData = await apiClient.get<UsuarioAuth>('/usuarios/yo'); // Llama a tu endpoint de perfil
        setUser(userData);
        setLocalAccessToken(token); // Asegurar que el estado local esté sincronizado
        setAccessToken(token); // Guardar en localStorage
      } catch (error) {
        console.warn("Fallo al obtener perfil con token, deslogueando:", error);
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        setLocalAccessToken(null);
        // No redirigir aquí para evitar bucles si la página es pública
      }
    } else {
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      setLocalAccessToken(null);
    }
    setIsLoadingSession(false);
  }, []);


  useEffect(() => {
    // Al montar, intenta sincronizar la sesión si hay un token.
    // La lógica de refresh token ya está en apiClient.
    const token = getAccessToken();
    if (token) {
      syncUserSession(token);
    } else {
      setIsLoadingSession(false); // No hay token, no hay sesión que cargar
    }
  }, [syncUserSession]);

  const login = async (credentials: LoginUsuarioPayload) => {
    try {
      const response = await apiClient.post<{ accessToken: string; refreshToken: string; usuario: UsuarioAuth }>('/auth/login', credentials);
      setAccessToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      setUser(response.usuario);
      setLocalAccessToken(response.accessToken);

      // Redirección después del login
      if (response.usuario.rol?.id_rol === 1 /* ADMIN */) {
        router.push('/admin/dashboard');
      } else if (response.usuario.rol?.id_rol === 3 /* ORGANIZER */) {
        router.push('/organizador/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error("Error en login (AuthContext):", error);
      throw error;
    }
  };

  const register = async (data: RegistroUsuarioPayload): Promise<UsuarioAuth> => {
    try {
      const registeredUser = await apiClient.post<UsuarioAuth>('/auth/registro', data);
      // No se loguea automáticamente, el usuario debe ir a la página de login
      return registeredUser;
    } catch (error) {
      console.error("Error en register (AuthContext):", error);
      throw error;
    }
  };

  const logout = () => {
    handleLogoutClient(); // Llama a la función de apiClient que limpia localStorage
    setUser(null);
    setLocalAccessToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!localAccessToken && !!user, user, accessToken: localAccessToken, isLoadingSession, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};