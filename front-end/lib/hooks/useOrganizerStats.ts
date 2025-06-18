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
  const { accessToken } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      if (!accessToken) {
        setError('No hay token de autenticación');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await api.eventos.getDashboardStats(accessToken);
        setStats(response);
      } catch (err: any) {
        console.error('Error al obtener estadísticas del organizador:', err);
        setError(err.message || 'Error al obtener estadísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [accessToken]);

  return { stats, loading, error };
} 