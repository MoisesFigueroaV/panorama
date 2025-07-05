import { t } from 'elysia'

export const createNotificacionSchema = t.Object({
  id_usuario: t.Integer(),
  id_evento: t.Nullable(t.Integer()),
  mensaje: t.String({ maxLength: 500 }),
})

export const notificacionSchemaSimple = t.Object({
  id_notificacion: t.Integer(),
  id_usuario: t.Integer(),
  mensaje: t.String(),
  fecha_envio: t.String(),
  tipo: t.String(),
});

export const notificacionesResponseSchema = t.Array(notificacionSchemaSimple);

export interface NotificacionConEstado {
  id_notificacion: number;
  id_usuario: number;
  mensaje: string;
  fecha_envio: Date;
  tipo: string;
  nombre_estado?: string;
}
