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
  return getCookie('accessToken') as string | undefined;
};

// Función para obtener el token de refresco
export const getRefreshToken = () => {
  return getCookie('refreshToken') as string | undefined;
};

// Función para establecer el token de acceso
export const setAccessToken = (token: string | null) => {
  if (token) {
    setCookie('accessToken', token, {
      maxAge: 60 * 60, // 1 hora
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    deleteCookie('accessToken');
    delete apiClient.defaults.headers.common['Authorization'];
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
    
    const originalRequest = error.config;

    // Si el error es 401 y no es una solicitud de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Intentar refrescar el token
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Actualizar tokens
        setAccessToken(accessToken);
        setRefreshToken(newRefreshToken);

        // Reintentar la solicitud original
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Si falla el refresh, limpiar tokens y redirigir al login
        clearAuthTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const handleLogoutClient = () => {
  setAccessToken(null);
  setRefreshToken(null);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userDataPanorama');
    window.location.href = '/login';
  }
};

export default apiClient;