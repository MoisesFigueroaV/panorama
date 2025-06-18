const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = {
    users: {
      getAll: () => fetch(`${API_BASE}/users`).then(res => res.json()),
      getById: (id: number) => fetch(`${API_BASE}/users/${id}`).then(res => res.json()),
      create: (userData: any) => 
        fetch(`${API_BASE}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        }).then(res => res.json())
    },
    eventos: {
      // Crear evento
      create: async (eventoData: any, token: string) => {
        console.log('🚀 API: Iniciando creación de evento')
        console.log('🚀 API: URL base:', API_BASE)
        console.log('🚀 API: Datos a enviar:', eventoData)
        console.log('🚀 API: Token presente:', !!token)
        
        const url = `${API_BASE}/api/v1/eventos`
        console.log('🚀 API: URL completa:', url)
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(eventoData)
        });
        
        console.log('🚀 API: Respuesta recibida, status:', response.status)
        
        if (!response.ok) {
          const error = await response.json();
          console.error('🚀 API: Error en respuesta:', error)
          throw new Error(error.error || 'Error al crear el evento');
        }
        
        const result = await response.json();
        console.log('🚀 API: Evento creado exitosamente:', result)
        return result;
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
      }
    },
    organizadores: {
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
    }
  };