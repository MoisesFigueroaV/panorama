import { db } from '../../db/drizzle';
import { eventoTable } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { CustomError } from '../../utils/errors';
import type { CreateEventoPayload, UpdateEventoPayload } from './evento.types';

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
  const now = new Date();
  const [evento] = await db.insert(eventoTable).values({
    ...data,
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
    categorias: JSON.stringify(data.categorias),
    id_organizador,
    creado_en: now,
    actualizado_en: now,
  }).returning();
  if (!evento) throw new CustomError('No se pudo crear el evento.', 500);
  return { ...evento, categorias: JSON.parse(evento.categorias) };
}

export async function updateEventoService(
  id_evento: number,
  id_organizador: number,
  data: UpdateEventoPayload
) {
  let fecha_inicio, fecha_fin;
  if (data.fecha_inicio) {
    fecha_inicio = new Date(data.fecha_inicio);
    if (isNaN(fecha_inicio.getTime())) throw new CustomError('La fecha de inicio no tiene un formato válido.', 400);
  }
  if (data.fecha_fin) {
    fecha_fin = new Date(data.fecha_fin);
    if (isNaN(fecha_fin.getTime())) throw new CustomError('La fecha de fin no tiene un formato válido.', 400);
  }
  if (fecha_inicio && fecha_fin && fecha_inicio > fecha_fin) {
    throw new CustomError('La fecha de inicio no puede ser posterior a la fecha de fin.', 400);
  }
  if (data.capacidad !== undefined && data.capacidad < 1) {
    throw new CustomError('La capacidad debe ser mayor o igual a 1.', 400);
  }
  const [eventoExistente] = await db
    .select()
    .from(eventoTable)
    .where(and(eq(eventoTable.id_evento, id_evento), eq(eventoTable.id_organizador, id_organizador)));
  if (!eventoExistente) throw new CustomError('Evento no encontrado.', 404);

  const [eventoActualizado] = await db
    .update(eventoTable)
    .set({
      ...data,
      ...(fecha_inicio && { fecha_inicio }),
      ...(fecha_fin && { fecha_fin }),
      ...(data.categorias && { categorias: JSON.stringify(data.categorias) }),
      actualizado_en: new Date(),
    })
    .where(and(eq(eventoTable.id_evento, id_evento), eq(eventoTable.id_organizador, id_organizador)))
    .returning();
  if (!eventoActualizado) throw new CustomError('No se pudo actualizar el evento.', 500);
  return { ...eventoActualizado, categorias: JSON.parse(eventoActualizado.categorias) };
}

export async function getEventosByOrganizadorService(id_organizador: number) {
  const eventos = await db
    .select()
    .from(eventoTable)
    .where(eq(eventoTable.id_organizador, id_organizador));
  return eventos.map(e => ({
    ...e,
    categorias: JSON.parse(e.categorias),
  }));
}