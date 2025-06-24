import { t } from 'elysia';

export const createNotificacionSchema = t.Object({
  id_usuario: t.Integer(),
  id_evento: t.Nullable(t.Integer()),
  mensaje: t.String({ maxLength: 500 }),
});

export const notificacionSchema = t.Object({
  id_notificacion: t.Integer(),
  id_usuario: t.Integer(),
  id_evento: t.Nullable(t.Integer()),
  mensaje: t.String(),
  fecha_envio: t.String(),
    // ⚠️ Si agregamos el campo "leido" en el futuro
  // leido: t.Optional(t.Boolean()),
});

export const notificacionesResponseSchema = t.Array(notificacionSchema);

