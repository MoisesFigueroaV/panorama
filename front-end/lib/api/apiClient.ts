// /front-end/lib/api/apiClient.ts
import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a todas las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si es un error 401 y no es una petición de refresh
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // En lugar de redirigir inmediatamente, solo limpiamos los tokens
          setAccessToken(null);
          setRefreshToken(null);
          throw new Error('No hay refresh token');
        }

        // Intentar renovar el token
        const response = await apiClient.post('/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // Actualizar tokens
        setAccessToken(accessToken);
        setRefreshToken(newRefreshToken);
        
        // Reintentar la petición original
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Si falla el refresh, solo limpiamos los tokens
        setAccessToken(null);
        setRefreshToken(null);
        // No redirigimos automáticamente, dejamos que el componente maneje la redirección
        return Promise.reject(refreshError);
      }
    }
    
    // Para otros errores, mantener el comportamiento actual
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.response) {
      const message = error.response.data?.error || error.response.data?.message || 'Error del servidor';
      throw new Error(message);
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error('Error al realizar la petición');
    }
  }
);

export const setAccessToken = (token: string | null) => {
  if (token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

export const setRefreshToken = (token: string | null) => {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('refreshToken', token);
    } else {
      localStorage.removeItem('refreshToken');
    }
  }
};

export const handleLogoutClient = () => {
  setAccessToken(null);
  setRefreshToken(null);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userDataPanorama');
    window.location.href = '/login';
  }
};

export default apiClient;