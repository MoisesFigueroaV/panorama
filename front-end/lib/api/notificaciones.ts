import { apiClient } from './apiClient'

// Obtener las notificaciones de un usuario por ID
export async function getNotificacionesPorUsuario(id_usuario: number) {
  const response = await apiClient.get(`/notificaciones/usuario/${id_usuario}`)
  return response.data.notificaciones
}

// Marcar una notificación como leída
export async function marcarNotificacionComoLeida(id_notificacion: number) {
  await apiClient.put(`/notificaciones/marcar-leida/${id_notificacion}`)
}
