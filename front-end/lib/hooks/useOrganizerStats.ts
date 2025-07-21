import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { shouldUseLocalData } from '@/lib/hooks/useLocalData';

interface OrganizerStats {
  eventosActivos: number;
  eventosPendientes: number;
  eventosTotales: number;
  eventosPorCategoria: {
    categoria: string;
    cantidad: number;
  }[];
}

// Función para calcular estadísticas reales desde los mocks
async function calculateLocalStats(userId: number): Promise<OrganizerStats> {
  try {
    // Importar datos de los mocks
    const { default: eventosMock } = await import('@/mocks/eventos.json');
    const { default: organizadoresMock } = await import('@/mocks/organizadores.json');
    
    // Encontrar el organizador del usuario
    const organizador = organizadoresMock.find(org => org.id_usuario === userId);
    if (!organizador) {
      console.warn('⚠️ No se encontró organizador para el usuario:', userId);
      return {
        eventosActivos: 0,
        eventosPendientes: 0,
        eventosTotales: 0,
        eventosPorCategoria: []
      };
    }
    
    // Filtrar eventos del organizador
    const eventosDelOrganizador = eventosMock.filter(evento => evento.id_organizador === organizador.id_organizador);
    
    // Contar por estado
    const eventosActivos = eventosDelOrganizador.filter(e => e.id_estado_evento === 2).length; // 2 = Publicado
    const eventosPendientes = eventosDelOrganizador.filter(e => e.id_estado_evento === 1).length; // 1 = Borrador
    const eventosTotales = eventosDelOrganizador.length;
    
    // Agrupar por categoría
    const eventosPorCategoria = eventosDelOrganizador.reduce((acc, evento) => {
      const categoria = evento.categoria_evento?.nombre_categoria || 'Sin categoría';
      const existing = acc.find(item => item.categoria === categoria);
      if (existing) {
        existing.cantidad++;
      } else {
        acc.push({ categoria, cantidad: 1 });
      }
      return acc;
    }, [] as { categoria: string; cantidad: number }[]);
    
    console.log('📊 Estadísticas calculadas localmente:', {
      organizador: organizador.nombre_organizacion,
      eventosActivos,
      eventosPendientes,
      eventosTotales,
      eventosPorCategoria
    });
    
    return {
      eventosActivos,
      eventosPendientes,
      eventosTotales,
      eventosPorCategoria
    };
  } catch (error) {
    console.error('❌ Error calculando estadísticas locales:', error);
    return {
      eventosActivos: 0,
      eventosPendientes: 0,
      eventosTotales: 0,
      eventosPorCategoria: []
    };
  }
}

// Datos por defecto para cuando no hay autenticación
const defaultStats: OrganizerStats = {
  eventosActivos: 5,
  eventosPendientes: 2,
  eventosTotales: 7,
  eventosPorCategoria: [
    { categoria: 'Tecnología', cantidad: 3 },
    { categoria: 'Cultura', cantidad: 2 },
    { categoria: 'Deportes', cantidad: 1 },
    { categoria: 'Educación', cantidad: 1 }
  ]
};

export function useOrganizerStats() {
  const [stats, setStats] = useState<OrganizerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { accessToken, isLoadingSession, isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      console.log('🔍 useOrganizerStats - Estado actual:', {
        isLoadingSession,
        isAuthenticated,
        hasAccessToken: !!accessToken,
        accessTokenLength: accessToken?.length,
        user: user ? `${user.nombre_usuario} (ID: ${user.id_usuario})` : 'No hay usuario',
        isLocalMode: shouldUseLocalData()
      });

      // Esperar a que la sesión se cargue completamente
      if (isLoadingSession) {
        console.log('⏳ Esperando a que se cargue la sesión...');
        return;
      }

      // Si estamos en modo local, calcular estadísticas reales
      if (shouldUseLocalData()) {
        console.log('📁 Modo local detectado, calculando estadísticas reales...');
        
        if (user && user.id_usuario) {
          try {
            const localStats = await calculateLocalStats(user.id_usuario);
            setStats(localStats);
            setError(null);
          } catch (err) {
            console.error('❌ Error calculando estadísticas locales:', err);
            setStats(defaultStats);
            setError('Error calculando estadísticas locales - usando datos por defecto');
          }
        } else {
          console.warn('⚠️ No hay usuario autenticado en modo local, usando datos por defecto');
          setStats(defaultStats);
          setError('No hay usuario autenticado - usando datos por defecto');
        }
        
        setLoading(false);
        return;
      }

      // Verificar si el usuario está autenticado
      if (!isAuthenticated || !accessToken) {
        console.warn('⚠️ Usuario no autenticado o sin token, usando estadísticas por defecto:', {
          isAuthenticated,
          hasAccessToken: !!accessToken
        });
        setStats(defaultStats);
        setError('No hay token de autenticación - usando datos por defecto');
        setLoading(false);
        return;
      }

      // Verificar que el usuario tenga rol de organizador
      if (user && user.rol?.id_rol !== 2) {
        console.warn('⚠️ Usuario no es organizador, usando estadísticas por defecto:', {
          userId: user.id_usuario,
          userRole: user.rol?.nombre_rol
        });
        setStats(defaultStats);
        setError('Acceso restringido a organizadores - usando datos por defecto');
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
        
        // Manejar diferentes tipos de errores
        let errorMessage = 'Error al obtener estadísticas';
        
        if (err.response?.status === 401) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
        } else if (err.response?.status === 403) {
          errorMessage = 'No tienes permisos para acceder a estas estadísticas.';
        } else if (err.response?.status === 404) {
          errorMessage = 'Endpoint de estadísticas no encontrado.';
        } else if (err.response?.status === 500) {
          errorMessage = 'Error interno del servidor.';
        } else if (err.message && err.message.includes('JSON')) {
          errorMessage = 'Error en el formato de respuesta del servidor.';
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        console.error('❌ Detalles del error:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data
        });
        
        setError(errorMessage);
        
        // Establecer estadísticas por defecto en caso de error
        setStats(defaultStats);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [accessToken, isLoadingSession, isAuthenticated, user]);

  return { stats, loading, error };
} 