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
  foto_perfil?: string | null;
  biografia?: string | null;
  intereses?: string[];
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
  const [localAccessToken, setLocalAccessToken] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const router = useRouter();

  const syncUserSession = useCallback(async (token: string | null) => {
    if (token) {
      try {
        const { data: userData } = await apiClient.get<UsuarioAuth>('/usuarios/yo');
        setUser(userData);
        setLocalAccessToken(token);
        setAccessToken(token);
      } catch (error) {
        console.warn("Fallo al obtener perfil con token, deslogueando:", error);
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        setLocalAccessToken(null);
      }
    } else {
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      setLocalAccessToken(null);
    }
    setIsLoadingSession(false);
  }, []);

  // Inicializar el token al montar el componente
  useEffect(() => {
    const token = getAccessToken() || null;
    setLocalAccessToken(token);
    if (token) {
      syncUserSession(token);
    } else {
      setIsLoadingSession(false);
    }
  }, [syncUserSession]);

  const login = async (credentials: LoginUsuarioPayload) => {
    try {
      const { data: response } = await apiClient.post<{ accessToken: string; refreshToken: string; usuario: UsuarioAuth }>('/auth/login', credentials);
      setAccessToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      setUser(response.usuario);
      setLocalAccessToken(response.accessToken);

      if (response.usuario.rol?.id_rol === 1) {
        router.push('/admin/dashboard');
      } else if (response.usuario.rol?.id_rol === 3) {
        router.push('/organizadores/dashboard');
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error("Error en login (AuthContext):", error);
      throw error;
    }
  };

  const register = async (data: RegistroUsuarioPayload): Promise<UsuarioAuth> => {
    try {
      const { data: registeredUser } = await apiClient.post<UsuarioAuth>('/auth/registro', data);
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
    // No redirigimos automáticamente, dejamos que el componente decida qué hacer
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