import { t } from 'elysia';

/**
 * Esquema de validación para la creación de eventos.
 * Compatible con el modelo actual.
 */
export const createEventoSchema = t.Object({
  titulo: t.String({ minLength: 3, maxLength: 150 }),
  descripcion: t.Optional(t.String({ maxLength: 1000 })),
  fecha_inicio: t.String({ format: 'date-time' }),  // Ingresado como ISO8601, luego parseado a YYYY-MM-DD internamente
  fecha_fin: t.String({ format: 'date-time' }),
  imagen: t.Optional(t.String({ format: 'uri' })),
  ubicacion: t.Optional(t.String({ maxLength: 250 })),
  capacidad: t.Integer({ minimum: 1 }),
  id_categoria: t.Integer(),
  id_estado_evento: t.Optional(t.Integer()),

  /**
   * 🔧 Escalable a futuro: múltiples categorías
   * categorias: t.Optional(t.Array(t.String(), { minItems: 1 }))
   */
});

/**
 * Esquema de actualización parcial.
 */
export const updateEventoSchema = t.Partial(createEventoSchema);

/**
 * Esquema de respuesta de un solo evento.
 */
export const eventoResponseSchema = t.Object({
  id_evento: t.Integer(),
  id_organizador: t.Integer(),
  titulo: t.String(),
  descripcion: t.Optional(t.String()),
  fecha_inicio: t.String(),  // Siempre string YYYY-MM-DD
  fecha_fin: t.String(),
  imagen: t.Optional(t.String()),
  ubicacion: t.Optional(t.String()),
  capacidad: t.Integer(),
  id_categoria: t.Integer(),
  id_estado_evento: t.Optional(t.Integer()),
  fecha_registro: t.Optional(t.String()),

  /**
   * 🔧 Para futuras migraciones a control de timestamps:
   * creado_en: t.Optional(t.String()),
   * actualizado_en: t.Optional(t.String())
   */
});

/**
 * Esquema de respuesta para listados.
 */
export const eventosResponseSchema = t.Array(eventoResponseSchema);

/**
 * Tipos inferidos para uso interno de los servicios.
 */
export type CreateEventoPayload = typeof createEventoSchema.static;
export type UpdateEventoPayload = typeof updateEventoSchema.static;
