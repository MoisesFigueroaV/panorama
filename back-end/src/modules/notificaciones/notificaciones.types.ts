import { t } from 'elysia'

export const createNotificacionSchema = t.Object({
  id_usuario: t.Integer(),
  id_evento: t.Nullable(t.Integer()),
  mensaje: t.String({ maxLength: 500 }),
})

// NUEVO: refleja los campos de la vista enriquecida
export const notificacionSchema = t.Object({
  id_notificacion: t.Integer(),
  id_usuario: t.Integer(),
  id_evento: t.Nullable(t.Integer()),
  mensaje: t.String(),
  fecha_envio: t.String(),
  tipo: t.String(),
  id_estado_notificacion: t.Nullable(t.Integer()),
  nombre_estado: t.Nullable(t.String()),
})

export const notificacionesResponseSchema = t.Array(notificacionSchema)

export interface NotificacionConEstado {
  id_notificacion: number;
  id_usuario: number;
  id_evento: number | null;
  mensaje: string;
  fecha_envio: Date;
  tipo: string;
  id_estado_notificacion: number | null;
  nombre_estado: string | null;
}
