// /front-end/lib/api/apiClient.ts
import axios from 'axios';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';

// Cliente API para hacer peticiones al backend
// URL base incluye el prefijo /api/v1 para el servidor Bun
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  // Removemos el Content-Type por defecto para que axios lo maneje automáticamente
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});

// Función para obtener el token de acceso
export const getAccessToken = () => {
  const token = getCookie('accessToken') as string | undefined;
  console.log('🔍 getAccessToken:', token ? 'Token encontrado' : 'No hay token');
  return token;
};

// Función para obtener el token de refresco
export const getRefreshToken = () => {
  const token = getCookie('refreshToken') as string | undefined;
  console.log('🔍 getRefreshToken:', token ? 'Token encontrado' : 'No hay token');
  return token;
};

// Función para establecer el token de acceso
export const setAccessToken = (token: string | null) => {
  console.log('🔍 setAccessToken:', token ? 'Configurando token' : 'Limpiando token');
  if (token) {
    setCookie('accessToken', token, {
      maxAge: 60 * 60, // 1 hora
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('🔍 Token configurado en headers:', !!apiClient.defaults.headers.common['Authorization']);
  } else {
    deleteCookie('accessToken');
    delete apiClient.defaults.headers.common['Authorization'];
    console.log('🔍 Token eliminado de headers');
  }
};

// Función para establecer el token de refresco
export const setRefreshToken = (token: string | null) => {
  if (token) {
    setCookie('refreshToken', token, {
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  } else {
    deleteCookie('refreshToken');
  }
};

// Función para limpiar todos los tokens de autenticación
export const clearAuthTokens = () => {
  deleteCookie('accessToken');
  deleteCookie('refreshToken');
  delete apiClient.defaults.headers.common['Authorization'];
};

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('Error en interceptor:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
      headers: error.config?.headers
    });
    
    // Si la respuesta no es JSON, crear una respuesta JSON válida
    if (error.response && typeof error.response.data === 'string') {
      const errorMessage = error.response.data;
      error.response.data = {
        error: true,
        message: errorMessage,
        status: error.response.status,
        timestamp: new Date().toISOString()
      };
    }
    
    // Si no hay respuesta, crear un error estándar
    if (!error.response) {
      error.response = {
        data: {
          error: true,
          message: 'Error de conexión. Verifica tu conexión a internet.',
          status: 0,
          timestamp: new Date().toISOString()
        },
        status: 0
      };
    }
    
    // Solo registrar el error, no manejar refresh automáticamente
    // El contexto de autenticación se encargará de manejar la sesión
    return Promise.reject(error);
  }
);

export const handleLogoutClient = () => {
  clearAuthTokens();
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userDataPanorama');
    // No usar window.location.href, dejar que el contexto maneje la redirección
  }
};

/**
 * Obtener eventos públicos con filtros (categoría, estado, búsqueda, fechas, orden, etc.)
 */
export const getEventosFiltrados = async (params: Record<string, any>) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await apiClient.get(`/eventos/filtrados?${queryString}`);
  return response.data;
};

export default apiClient;