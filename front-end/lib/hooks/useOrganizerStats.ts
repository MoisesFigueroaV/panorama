import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface OrganizerStats {
  eventosActivos: number;
  eventosPendientes: number;
  eventosTotales: number;
  eventosPorCategoria: {
    categoria: string;
    cantidad: number;
  }[];
}

export function useOrganizerStats() {
  const [stats, setStats] = useState<OrganizerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { accessToken, isLoadingSession, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      console.log('🔍 useOrganizerStats - Estado actual:', {
        isLoadingSession,
        isAuthenticated,
        hasAccessToken: !!accessToken,
        accessTokenLength: accessToken?.length
      });

      // Esperar a que la sesión se cargue completamente
      if (isLoadingSession) {
        console.log('⏳ Esperando a que se cargue la sesión...');
        return;
      }

      // Verificar si el usuario está autenticado
      if (!isAuthenticated || !accessToken) {
        console.error('❌ Usuario no autenticado o sin token:', {
          isAuthenticated,
          hasAccessToken: !!accessToken
        });
        setError('No hay token de autenticación');
        setLoading(false);
        return;
      }

      try {
        console.log('🚀 Intentando obtener estadísticas del dashboard...');
        setLoading(true);
        setError(null);
        
        const response = await api.eventos.getDashboardStats(accessToken);
        console.log('✅ Estadísticas obtenidas exitosamente:', response);
        setStats(response);
      } catch (err: any) {
        console.error('❌ Error al obtener estadísticas del organizador:', err);
        console.error('❌ Detalles del error:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data
        });
        setError(err.message || 'Error al obtener estadísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [accessToken, isLoadingSession, isAuthenticated]);

  return { stats, loading, error };
} 