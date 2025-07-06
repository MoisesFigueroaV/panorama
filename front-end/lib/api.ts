const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Helper para guardar cambios pendientes en localStorage
function savePendingChange(entity: string, data: any) {
  if (typeof window === 'undefined') return;
  const key = `pending_${entity}`;
  const current = JSON.parse(localStorage.getItem(key) || '[]');
  current.push(data);
  localStorage.setItem(key, JSON.stringify(current));
}

// Helper para guardar edición o borrado pendiente en localStorage
function savePendingEditOrDelete(entity: string, data: any, action: string) {
  if (typeof window === 'undefined') return;
  const key = `pending_${entity}`;
  const current = JSON.parse(localStorage.getItem(key) || '[]');
  current.push({ ...data, action });
  localStorage.setItem(key, JSON.stringify(current));
}

// Helper para saber si estamos en modo local
import { shouldUseLocalData } from '@/lib/hooks/useLocalData';

export const api = {
    users: {
      getAll: () => fetch(`${API_BASE}/users`).then(res => res.json()),
      getById: (id: number) => fetch(`${API_BASE}/users/${id}`).then(res => res.json()),
      create: (userData: any) => {
        if (shouldUseLocalData()) {
          savePendingChange('users', userData);
          return Promise.resolve({ ...userData, local: true });
        }
        return fetch(`${API_BASE}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        }).then(res => res.json());
      },
      update: (id: number, userData: any) => {
        if (shouldUseLocalData()) {
          savePendingEditOrDelete('users', { id, ...userData }, 'update');
          return Promise.resolve({ ...userData, id, local: true });
        }
        return fetch(`${API_BASE}/users/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        }).then(res => res.json());
      },
      delete: (id: number) => {
        if (shouldUseLocalData()) {
          savePendingEditOrDelete('users', { id }, 'delete');
          return Promise.resolve({ id, local: true });
        }
        return fetch(`${API_BASE}/users/${id}`, {
          method: 'DELETE'
        }).then(res => res.json());
      }
    },
    eventos: {
      // Crear evento
      create: async (data: any, token: string) => {
        if (shouldUseLocalData()) {
          savePendingChange('events', data);
          return Promise.resolve({ ...data, local: true });
        }
        console.log('🚀 API: Enviando petición POST /eventos');
        console.log('🚀 API: Datos:', data);
        
        const response = await fetch(`${API_BASE}/api/v1/eventos`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(data)
        });
        
        console.log('🚀 API: Respuesta recibida, status:', response.status);
        
        // Intentar obtener el texto de la respuesta primero
        const responseText = await response.text();
        console.log('🚀 API: Respuesta texto:', responseText);
        
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('🚀 API: Error al parsear JSON:', parseError);
          console.error('🚀 API: Respuesta no válida:', responseText);
          throw new Error(`Error del servidor: ${responseText}`);
        }
        
        if (!response.ok) {
          console.error('🚀 API: Error en respuesta:', responseData);
          throw new Error(responseData.error || 'Error al crear evento');
        }
        
        return responseData;
      },
      
      // Obtener eventos del organizador
      getMisEventos: async (token: string) => {
        const response = await fetch(`${API_BASE}/api/v1/eventos/mis-eventos`, {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error al obtener eventos');
        }
        
        return response.json();
      },
      
      // Actualizar evento
      update: async (idEvento: number, eventoData: any, token: string) => {
        const response = await fetch(`${API_BASE}/api/v1/eventos/${idEvento}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(eventoData)
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error al actualizar el evento');
        }
        
        return response.json();
      },

      // Obtener todos los eventos para admin
      getAllForAdmin: async (token: string) => {
        const response = await fetch(`${API_BASE}/api/v1/admin/events/all`, {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error al obtener eventos');
        }
        
        return response.json();
      },

      // Obtener eventos con filtros y paginación para admin
      getWithFilters: async (params: {
        page?: number;
        limit?: number;
        search?: string;
        estado?: number;
        categoria?: number;
        organizador?: number;
        fechaDesde?: string;
        fechaHasta?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
      }, token: string) => {
        const searchParams = new URLSearchParams();
        
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.search) searchParams.append('search', params.search);
        if (params.estado) searchParams.append('estado', params.estado.toString());
        if (params.categoria) searchParams.append('categoria', params.categoria.toString());
        if (params.organizador) searchParams.append('organizador', params.organizador.toString());
        if (params.fechaDesde) searchParams.append('fechaDesde', params.fechaDesde);
        if (params.fechaHasta) searchParams.append('fechaHasta', params.fechaHasta);
        if (params.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

        const url = `${API_BASE}/api/v1/admin/events?${searchParams.toString()}`;
        
        const response = await fetch(url, {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error al obtener eventos');
        }
        
        return response.json();
      },

      // Obtener opciones de filtros
      getFilterOptions: async (token: string) => {
        const response = await fetch(`${API_BASE}/api/v1/admin/events/filter-options`, {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error al obtener opciones de filtros');
        }
        
        return response.json();
      },

      // Cambiar estado de evento (admin)
      updateStatus: async (idEvento: number, idEstadoEvento: number, token: string) => {
        const response = await fetch(`${API_BASE}/api/v1/admin/events/${idEvento}/status`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ id_estado_evento: idEstadoEvento })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error al cambiar el estado del evento');
        }
        
        return response.json();
      },

      // Obtener estadísticas del dashboard del organizador
      getDashboardStats: async (token: string) => {
        const response = await fetch(`${API_BASE}/api/v1/eventos/dashboard-stats`, {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error al obtener estadísticas del dashboard');
        }
        
        return response.json();
      },

      // Eliminar evento
      delete: async (idEvento: number, token: string) => {
        const response = await fetch(`${API_BASE}/api/v1/eventos/${idEvento}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error al eliminar el evento');
        }
        return response.json();
      }
    },
    public: {
      // Obtener eventos destacados para la página principal
      getEventosDestacados: async (limit?: number) => {
        const params = limit ? `?limit=${limit}` : '';
        const response = await fetch(`${API_BASE}/api/v1/eventos/destacados${params}`);
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error al obtener eventos destacados');
        }
        
        return response.json();
      },

      // Obtener organizadores verificados para la página principal
      getOrganizadoresVerificados: async (limit?: number) => {
        const params = limit ? `?limit=${limit}` : '';
        const response = await fetch(`${API_BASE}/api/v1/organizadores/verificados${params}`);
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error al obtener organizadores verificados');
        }
        
        return response.json();
      },

      // Obtener perfil público del organizador
      getOrganizadorPublicProfile: async (organizadorId: number) => {
        const response = await fetch(`${API_BASE}/api/v1/organizadores/${organizadorId}`);
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error al obtener perfil del organizador');
        }
        
        return response.json();
      },

      // Obtener eventos por organizador
      getEventosByOrganizador: async (organizadorId: number) => {
        const response = await fetch(`${API_BASE}/api/v1/eventos/organizador/${organizadorId}`);
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error al obtener eventos del organizador');
        }
        
        return response.json();
      },

      // Obtener categorías de eventos
      getCategorias: async () => {
        const response = await fetch(`${API_BASE}/api/v1/eventos/categorias`);
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error al obtener categorías');
        }
        
        return response.json();
      },

      // Obtener eventos por categoría
      getEventosByCategoria: async (categoriaId: number, limit?: number) => {
        const params = limit ? `?limit=${limit}` : '';
        const response = await fetch(`${API_BASE}/api/v1/eventos/categoria/${categoriaId}${params}`);
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error al obtener eventos por categoría');
        }
        
        return response.json();
      },

      // Obtener evento específico por ID
      getEventoById: async (eventoId: number) => {
        const response = await fetch(`${API_BASE}/api/v1/eventos/${eventoId}`);
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error al obtener evento');
        }
        
        return response.json();
      }
    },
    organizadores: {
      // Verificar si el usuario tiene perfil de organizador
      checkProfile: async (token: string) => {
        const response = await fetch(`${API_BASE}/api/v1/organizadores/yo/check-profile`, {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error al verificar perfil de organizador');
        }
        
        return response.json();
      },

      // Obtener perfil público del organizador
      getPublicProfile: async (token: string) => {
        const response = await fetch(`${API_BASE}/api/v1/organizadores/yo/public-profile`, {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error al obtener perfil público');
        }
        
        return response.json();
      },

      // Actualizar perfil público del organizador
      updatePublicProfile: async (token: string, data: any) => {
        const response = await fetch(`${API_BASE}/api/v1/organizadores/yo/public-profile`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error al actualizar perfil público');
        }
        
        return response.json();
      }
    },
    upload: {
      // Subir imagen
      uploadImage: async (file: File, token: string, folder: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        
        const response = await fetch(`${API_BASE}/api/v1/upload/image`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Error al subir imagen');
        }
        
        return response.json();
      }
    }
  };