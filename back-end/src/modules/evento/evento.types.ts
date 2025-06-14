import { t } from 'elysia';

// Esquema para crear un evento
export const createEventoSchema = t.Object({
  titulo: t.String({ minLength: 3, maxLength: 150, description: "Título del evento" }),
  descripcion: t.Optional(t.String({ maxLength: 1000, description: "Descripción del evento" })),
  fecha_inicio: t.String({ format: 'date-time', description: "Fecha y hora de inicio del evento" }),
  fecha_fin: t.String({ format: 'date-time', description: "Fecha y hora de fin del evento" }),
  imagen_url: t.Optional(t.String({ format: 'uri', description: "URL de la imagen del evento" })),
  ubicacion: t.String({ minLength: 3, maxLength: 255, description: "Ubicación del evento" }),
  capacidad: t.Integer({ minimum: 1, description: "Capacidad máxima de asistentes al evento" }),
  categorias: t.Array(
    t.String({ minLength: 2, maxLength: 50, description: "Categoría del evento" }),
    { minItems: 1 }
  ),
});
export const updateEventoSchema = t.Partial(createEventoSchema);

// Esquema de respuesta para un evento
export const eventoResponseSchema = t.Object({
  id_evento: t.Integer(),
  id_organizador: t.Integer(),
  titulo: t.String(),
  descripcion: t.Optional(t.String()),
  fecha_inicio: t.String(),
  fecha_fin: t.String(),
  imagen_url: t.Optional(t.String()),
  ubicacion: t.String(),
  capacidad: t.Integer(),
  categorias: t.Array(t.String()),
  creado_en: t.String(),
  actualizado_en: t.String(),
});
export const eventosResponseSchema = t.Array(eventoResponseSchema);

export type CreateEventoPayload = typeof createEventoSchema.static;
export type UpdateEventoPayload = typeof updateEventoSchema.static;