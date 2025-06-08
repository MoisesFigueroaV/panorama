// /front-end/lib/api/apiClient.ts
import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

  export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("ERROR AJJAJA", error)
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
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export const getAccessToken = () => {
  const auth = apiClient.defaults.headers.common['Authorization'] as string;
  return auth ? auth.replace('Bearer ', '') : null;
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