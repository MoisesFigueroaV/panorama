import { db } from '../../db/drizzle';
import { eventoTable } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { CustomError } from '../../utils/errors';
import type { CreateEventoPayload, UpdateEventoPayload } from './evento.types';

/**
 * Servicio para crear un nuevo evento.
 */
export async function createEventoService(id_organizador: number, data: CreateEventoPayload) {
  const fechaInicio = new Date(data.fecha_inicio);
  const fechaFin = new Date(data.fecha_fin);

  if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
    throw new CustomError('Las fechas no tienen un formato válido.', 400);
  }
  if (fechaInicio > fechaFin) {
    throw new CustomError('La fecha de inicio no puede ser posterior a la fecha de fin.', 400);
  }
  if (data.capacidad < 1) {
    throw new CustomError('La capacidad debe ser mayor o igual a 1.', 400);
  }

  const [evento] = await db.insert(eventoTable).values({
    titulo: data.titulo,
    descripcion: data.descripcion ?? null,
    fecha_inicio: fechaInicio.toISOString().split('T')[0],
    fecha_fin: fechaFin.toISOString().split('T')[0],
    imagen: data.imagen ?? null,
    ubicacion: data.ubicacion ?? null,
    capacidad: data.capacidad,
    id_categoria: data.id_categoria,
    id_organizador,
    id_estado_evento: data.id_estado_evento ?? null,
    fecha_registro: new Date().toISOString().split('T')[0],
    latitud: data.latitud != null ? data.latitud.toString() : null,
    longitud: data.longitud != null ? data.longitud.toString() : null
    // 🔧 Para escalado futuro (no implementado actualmente):
    // creado_en: new Date(),
    // actualizado_en: new Date(),
    // categorias: JSON.stringify(data.categorias ?? [])
  }).returning();

  if (!evento) throw new CustomError('No se pudo crear el evento.', 500);
  return evento;
}

/**
 * Servicio para actualizar un evento existente.
 */
export async function updateEventoService(id_evento: number, id_organizador: number, data: UpdateEventoPayload) {
  const [eventoExistente] = await db.select().from(eventoTable)
    .where(and(eq(eventoTable.id_evento, id_evento), eq(eventoTable.id_organizador, id_organizador)));

  if (!eventoExistente) throw new CustomError('Evento no encontrado.', 404);

  const updateData: Partial<typeof eventoTable.$inferInsert> = {
    ...(data.titulo !== undefined && { titulo: data.titulo }),
    ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
    ...(data.imagen !== undefined && { imagen: data.imagen }),
    ...(data.ubicacion !== undefined && { ubicacion: data.ubicacion }),
    ...(data.capacidad !== undefined && { capacidad: data.capacidad }),
    ...(data.id_categoria !== undefined && { id_categoria: data.id_categoria }),
    ...(data.id_estado_evento !== undefined && { id_estado_evento: data.id_estado_evento }),
    ...(data.fecha_inicio !== undefined && { fecha_inicio: new Date(data.fecha_inicio).toISOString().split('T')[0] }),
    ...(data.fecha_fin !== undefined && { fecha_fin: new Date(data.fecha_fin).toISOString().split('T')[0] }),
    ...(data.latitud !== undefined && { latitud: data.latitud != null ? data.latitud.toString() : null }),
    ...(data.longitud !== undefined && { longitud: data.longitud != null ? data.longitud.toString() : null }),
    // 🔧 Para escalabilidad futura:
    // actualizado_en: new Date()
  };

  const [eventoActualizado] = await db.update(eventoTable)
    .set(updateData)
    .where(and(eq(eventoTable.id_evento, id_evento), eq(eventoTable.id_organizador, id_organizador)))
    .returning();

  if (!eventoActualizado) throw new CustomError('No se pudo actualizar el evento.', 500);
  return eventoActualizado;
}

/**
 * Servicio para obtener eventos de un organizador.
 */
export async function getEventosByOrganizadorService(id_organizador: number) {
  const eventos = await db.select().from(eventoTable)
    .where(eq(eventoTable.id_organizador, id_organizador));

  return eventos.map(e => ({
    ...e,

    // 🔧 A futuro: cuando se implemente soporte de múltiples categorías:
    // categorias: JSON.parse(e.categorias ?? "[]")
  }));
}
