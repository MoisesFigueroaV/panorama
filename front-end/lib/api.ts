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
import { formatDateForDB } from '@/lib/utils/date-utils'

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
          console.log('📁 Modo local: creando evento en localStorage...');
          const { localDataManager } = await import('@/lib/localStorage/localDataManager');
          
          // Inicializar con mocks si es necesario
          await localDataManager.initializeWithMocks();
          
          // Crear el evento localmente
          const newEvento = await localDataManager.createEvento({
            ...data,
            id_estado_evento: 1, // Pendiente por defecto
            id_organizador: 1, // Organizador simulado
            fecha_registro: formatDateForDB(new Date())
          });
          
          console.log('✅ Evento creado localmente:', newEvento);
          return newEvento;
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
        // Si estamos en modo local, usar datos de mocks
        if (shouldUseLocalData()) {
          console.log('📁 Modo local: cargando eventos desde localStorage...');
          const { localDataManager } = await import('@/lib/localStorage/localDataManager');
          
          // Inicializar con mocks si es necesario
          await localDataManager.initializeWithMocks();
          
          // Obtener eventos del usuario autenticado (simulado)
          const eventos = await localDataManager.getEventos();
          
          // Por ahora, devolver todos los eventos (en el futuro se puede filtrar por organizador)
          return eventos.map((evento: any) => ({
            ...evento,
            // Asegurar que las fechas estén en formato correcto
            fecha_inicio: evento.fecha_inicio,
            fecha_fin: evento.fecha_fin,
            fecha_registro: evento.fecha_registro,
            // Asegurar que los números estén en formato correcto
            id_evento: Number(evento.id_evento),
            id_categoria: Number(evento.id_categoria),
            id_estado_evento: Number(evento.id_estado_evento),
            id_organizador: Number(evento.id_organizador),
            capacidad: Number(evento.capacidad),
            latitud: evento.latitud ? Number(evento.latitud) : null,
            longitud: evento.longitud ? Number(evento.longitud) : null
          }));
        }

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
        if (shouldUseLocalData()) {
          const eventosMock = await import('@/mocks/eventos.json');
          // Puedes adaptar el formato aquí si es necesario
          return eventosMock.default || eventosMock;
        }
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
        // Si estamos en modo local, usar datos de localStorage
        if (shouldUseLocalData()) {
          console.log('📁 Modo local: cargando perfil público del organizador desde localStorage...');
          const { localDataManager } = await import('@/lib/localStorage/localDataManager');
          
          // Inicializar con mocks si es necesario
          await localDataManager.initializeWithMocks();
          
          // Obtener organizadores y eventos
          const organizadores = await localDataManager.getOrganizadores();
          const eventos = await localDataManager.getEventos();
          
          // Buscar el organizador específico
          const organizador = organizadores.find(o => o.id_organizador === organizadorId);
          
          if (!organizador) {
            throw new Error('Organizador no encontrado');
          }
          
          // Contar eventos del organizador
          const totalEventos = eventos.filter(e => e.id_organizador === organizador.id_organizador).length;
          
          return {
            ...organizador,
            redes_sociales: [
              { plataforma: 'Facebook', url: 'https://facebook.com/organizacion' },
              { plataforma: 'Instagram', url: 'https://instagram.com/organizacion' }
            ],
            total_eventos: totalEventos,
            usuario: {
              id_usuario: organizador.id_usuario,
              nombre_usuario: 'Organizador Demo',
              correo: 'organizador@test.com'
            }
          };
        }

        const response = await fetch(`${API_BASE}/api/v1/organizadores/${organizadorId}`);
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error al obtener perfil del organizador');
        }
        
        return response.json();
      },

      // Obtener eventos por organizador
      getEventosByOrganizador: async (organizadorId: number) => {
        // Si estamos en modo local, usar datos de localStorage
        if (shouldUseLocalData()) {
          console.log('📁 Modo local: cargando eventos del organizador desde localStorage...');
          const { localDataManager } = await import('@/lib/localStorage/localDataManager');
          
          // Inicializar con mocks si es necesario
          await localDataManager.initializeWithMocks();
          
          // Obtener eventos del organizador
          const eventos = await localDataManager.getEventosByOrganizador(organizadorId);
          
          // Obtener categorías para enriquecer los datos
          const { default: categoriasMock } = await import('@/mocks/categorias.json');
          
          // Enriquecer eventos con información de categorías
          const eventosEnriquecidos = eventos.map(evento => {
            const categoria = categoriasMock.find(c => c.id_categoria === evento.id_categoria);
            return {
              id_evento: evento.id_evento,
              titulo: evento.titulo,
              descripcion: evento.descripcion,
              fecha_inicio: evento.fecha_inicio,
              fecha_fin: evento.fecha_fin,
              hora_inicio: evento.hora_inicio,
              hora_fin: evento.hora_fin,
              ubicacion: evento.ubicacion,
              imagen: evento.imagen,
              nombre_categoria: categoria?.nombre_categoria || 'Sin categoría',
              nombre_organizacion: 'Organización Demo',
              logo_organizacion: '/placeholder.svg'
            };
          });
          
          return eventosEnriquecidos;
        }

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
        // Si estamos en modo local, simular respuesta
        if (shouldUseLocalData()) {
          console.log('📁 Modo local: simulando verificación de perfil de organizador');
          return {
            hasProfile: true,
            organizador: {
              id_organizador: 1,
              nombre_organizacion: 'Mi Organización',
              estado_acreditacion: 2
            }
          };
        }

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
        // Si estamos en modo local, usar datos de localStorage
        if (shouldUseLocalData()) {
          console.log('📁 Modo local: cargando perfil público desde localStorage...');
          const { localDataManager } = await import('@/lib/localStorage/localDataManager');
          
          // Inicializar con mocks si es necesario
          await localDataManager.initializeWithMocks();
          
          // Obtener organizadores y eventos
          const organizadores = await localDataManager.getOrganizadores();
          const eventos = await localDataManager.getEventos();
          
          // Buscar el organizador del usuario autenticado (usuario 63)
          // En modo local, asumimos que el usuario 63 es el organizador
          const organizador = organizadores.find(o => o.id_usuario === 63) || {
            id_organizador: 6, // ID del organizador del usuario 63 según los mocks
            nombre_organizacion: 'Museo de historia de Concepcion',
            descripcion: 'Al contrario del pensamiento popular, el texto de Lorem Ipsum no es simplemente texto aleatorio. Tiene sus raices en una pieza cl´sica de la literatura del Latin, que data del año 45 antes de Cristo, ',
            ubicacion: 'Concepcion, Chile',
            anio_fundacion: 2021,
            sitio_web: '',
            imagen_portada: '',
            logo_organizacion: '',
            tipo_organizacion: 'institucion',
            telefono_organizacion: '+56972639112',
            id_usuario: 63,
            id_estado_acreditacion_actual: 2
          };
          
          // Contar eventos del organizador
          const totalEventos = eventos.filter(e => e.id_organizador === organizador.id_organizador).length;
          
          return {
            ...organizador,
            redes_sociales: [
              { id_red: 1, plataforma: 'Facebook', url: 'https://facebook.com/museoconcepcion' },
              { id_red: 2, plataforma: 'Instagram', url: 'https://instagram.com/museoconcepcion' }
            ],
            total_eventos: totalEventos,
            usuario: {
              id_usuario: organizador.id_usuario,
              nombre_usuario: 'Jose Miguel Carrera',
              correo: 'jose.miguecarrera@example.com'
            }
          };
        }

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
        // Si estamos en modo local, usar datos de localStorage
        if (shouldUseLocalData()) {
          console.log('📁 Modo local: actualizando perfil público en localStorage...');
          const { localDataManager } = await import('@/lib/localStorage/localDataManager');
          
          // Buscar el organizador del usuario 63
          const organizadores = await localDataManager.getOrganizadores();
          const organizador = organizadores.find(o => o.id_usuario === 63);
          
          if (!organizador) {
            throw new Error('No se encontró el perfil de organizador');
          }
          
          // Actualizar el organizador con los nuevos datos
          const updatedOrganizador = await localDataManager.updateOrganizador(organizador.id_organizador, {
            nombre_organizacion: data.nombre_organizacion,
            descripcion: data.descripcion,
            ubicacion: data.ubicacion,
            anio_fundacion: data.anio_fundacion ? parseInt(data.anio_fundacion) : null,
            sitio_web: data.sitio_web,
            imagen_portada: data.imagen_portada,
            logo_organizacion: data.logo_organizacion,
            tipo_organizacion: data.tipo_organizacion,
            telefono_organizacion: data.telefono_organizacion,
          });
          
          if (!updatedOrganizador) {
            throw new Error('Error al actualizar el perfil');
          }
          
          console.log('✅ Perfil público actualizado en modo local');
          return updatedOrganizador;
        }

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
      },
      create: (orgData: any) => {
        if (shouldUseLocalData()) {
          savePendingChange('organizadores', orgData);
          return Promise.resolve({ ...orgData, local: true });
        }
        return fetch(`${API_BASE}/organizadores`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orgData)
        }).then(res => res.json());
      },
      update: (id: number, orgData: any) => {
        if (shouldUseLocalData()) {
          savePendingEditOrDelete('organizadores', { id, ...orgData }, 'update');
          return Promise.resolve({ ...orgData, id, local: true });
        }
        return fetch(`${API_BASE}/organizadores/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orgData)
        }).then(res => res.json());
      },
      delete: (id: number) => {
        if (shouldUseLocalData()) {
          savePendingEditOrDelete('organizadores', { id }, 'delete');
          return Promise.resolve({ id, local: true });
        }
        return fetch(`${API_BASE}/organizadores/${id}`, {
          method: 'DELETE'
        }).then(res => res.json());
      }
    },
    notificaciones: {
      create: (notifData: any) => {
        if (shouldUseLocalData()) {
          savePendingChange('notificaciones', notifData);
          return Promise.resolve({ ...notifData, local: true });
        }
        return fetch(`${API_BASE}/notificaciones`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notifData)
        }).then(res => res.json());
      },
      update: (id: number, notifData: any) => {
        if (shouldUseLocalData()) {
          savePendingEditOrDelete('notificaciones', { id, ...notifData }, 'update');
          return Promise.resolve({ ...notifData, id, local: true });
        }
        return fetch(`${API_BASE}/notificaciones/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notifData)
        }).then(res => res.json());
      },
      delete: (id: number) => {
        if (shouldUseLocalData()) {
          savePendingEditOrDelete('notificaciones', { id }, 'delete');
          return Promise.resolve({ id, local: true });
        }
        return fetch(`${API_BASE}/notificaciones/${id}`, {
          method: 'DELETE'
        }).then(res => res.json());
      }
    },
    upload: {
      // Subir imagen
      uploadImage: async (file: File, token: string, folder: string) => {
        // Si estamos en modo local, simular subida de imagen
        if (shouldUseLocalData()) {
          console.log('📁 Modo local: simulando subida de imagen...');
          
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = () => {
              // Crear un ID único para la imagen
              const imageId = `local_image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              
              // Guardar la imagen en localStorage como base64
              const imageData = {
                id: imageId,
                url: reader.result as string,
                filename: file.name,
                folder: folder,
                timestamp: Date.now()
              };
              
              // Obtener imágenes existentes
              const existingImages = JSON.parse(localStorage.getItem('local_images') || '[]');
              existingImages.push(imageData);
              localStorage.setItem('local_images', JSON.stringify(existingImages));
              
              console.log('✅ Imagen guardada localmente:', imageId);
              
              resolve({
                success: true,
                imageUrl: reader.result as string,
                filename: file.name,
                local: true
              });
            };
            
            reader.onerror = () => {
              reject(new Error('Error al leer el archivo'));
            };
            
            reader.readAsDataURL(file);
          });
        }
        
        // Modo remoto: subir al servidor
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