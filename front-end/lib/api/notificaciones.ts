import { apiClient } from './apiClient'
import { shouldUseLocalData } from '@/lib/hooks/useLocalData'

// Obtener las notificaciones de un usuario por ID
export async function getNotificacionesPorUsuario(id_usuario: number) {
  try {
    // Si estamos en modo local, usar datos de localStorage
    if (shouldUseLocalData()) {
      console.log('📁 Modo local: cargando notificaciones desde localStorage...');
      const { localDataManager } = await import('@/lib/localStorage/localDataManager');
      
      // Inicializar con mocks si es necesario
      await localDataManager.initializeWithMocks();
      
      // Obtener notificaciones del usuario específico
      const notificaciones = await localDataManager.getNotificacionesByUsuario(id_usuario);
      
      // Mapear al formato esperado
      return notificaciones.map((n: any) => ({
        id_notificacion: n.id_notificacion,
        id_usuario: n.id_usuario,
        mensaje: n.mensaje,
        fecha_envio: n.fecha_envio,
        tipo: n.tipo,
        nombre_estado: n.nombre_estado || 'No leída',
        leido: n.leido || false
      }));
    }

    // Modo remoto: hacer petición HTTP
    const response = await apiClient.get(`/notificaciones/usuario/${id_usuario}`)
    console.log('📦 Respuesta API:', response.data)
    
    // Si la respuesta es un array, devolverlo directamente
    if (Array.isArray(response.data)) {
      return response.data
    }
    
    // Si tiene la propiedad notificaciones, devolverla
    if (response.data?.notificaciones) {
      return response.data.notificaciones
    }
    
    // Fallback: devolver array vacío
    return []
  } catch (error: any) {
    console.error('❌ Error al obtener notificaciones:', error)
    
    // Si es un error 404, devolver array vacío (usuario sin notificaciones)
    if (error.response?.status === 404) {
      console.log('ℹ️ Usuario sin notificaciones o ruta no encontrada')
      return []
    }
    
    // Para otros errores, devolver array vacío pero loguear el error
    return []
  }
}

// Marcar una notificación como leída
export async function marcarNotificacionComoLeida(id_notificacion: number) {
  try {
    // Si estamos en modo local, actualizar en localStorage
    if (shouldUseLocalData()) {
      console.log('📁 Modo local: marcando notificación como leída en localStorage...');
      const { localDataManager } = await import('@/lib/localStorage/localDataManager');
      
      // Inicializar con mocks si es necesario
      await localDataManager.initializeWithMocks();
      
      // Actualizar la notificación
      await localDataManager.updateNotificacion(id_notificacion, {
        nombre_estado: 'Leída',
        leido: true
      });
      
      console.log('✅ Notificación marcada como leída localmente');
      return Promise.resolve();
    }

    await apiClient.put(`/notificaciones/marcar-leida/${id_notificacion}`)
    console.log('✅ Notificación marcada como leída')
  } catch (error: any) {
    console.error('❌ Error al marcar notificación como leída:', error)
    // No lanzar el error, solo loguearlo
  }
}
