import { db } from '../../db/drizzle';
import { eventoTable } from '../../db/schema/evento.schema';
import { eq, and } from 'drizzle-orm';
import { CustomError } from '../../utils/errors';
import type { CreateEventoPayload, UpdateEventoPayload } from './evento.types';


/**
 * Servicio para crear un nuevo evento.
 */
export async function createEventoService(id_organizador: number, data: CreateEventoPayload) {
  console.log('🔍 createEventoService llamado con:', { id_organizador, data });
  
  const fechaInicio = new Date(data.fecha_inicio);
  const fechaFin = new Date(data.fecha_fin);

  console.log('🔍 Fechas procesadas:', { 
    fechaInicio: fechaInicio.toISOString(), 
    fechaFin: fechaFin.toISOString() 
  });

  if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
    console.error('❌ Fechas inválidas:', { fechaInicio, fechaFin });
    throw new CustomError('Las fechas no tienen un formato válido.', 400);
  }
  if (fechaInicio > fechaFin) {
    console.error('❌ Fecha de inicio posterior a fecha de fin');
    throw new CustomError('La fecha de inicio no puede ser posterior a la fecha de fin.', 400);
  }
  if (data.capacidad < 1) {
    console.error('❌ Capacidad inválida:', data.capacidad);
    throw new CustomError('La capacidad debe ser mayor o igual a 1.', 400);
  }

  const eventoData = {
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
    latitud: data.latitud !== undefined ? Number(data.latitud) : null,
    longitud: data.longitud !== undefined ? Number(data.longitud) : null,
  };

  console.log('📤 Datos a insertar en BD:', eventoData);

  try {
    const [evento] = await db.insert(eventoTable).values(eventoData).returning();
    console.log('✅ Evento creado exitosamente:', evento);

    if (!evento) throw new CustomError('No se pudo crear el evento.', 500);
    return evento;
  } catch (error) {
    console.error('❌ Error al insertar en BD:', error);
    throw error;
  }
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
    ...(data.latitud !== undefined && { latitud: data.latitud != null ? Number(data.latitud) : null }),
    ...(data.longitud !== undefined && { longitud: data.longitud != null ? Number(data.longitud) : null }),
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

/**
 * Servicio para obtener un evento por su ID
 */
export async function getEventoByIdService(id_evento: number) {
  const [evento] = await db.select().from(eventoTable)
    .where(eq(eventoTable.id_evento, id_evento));

  if (!evento) {
    throw new CustomError('Evento no encontrado', 404);
  }

  return {
    ...evento,
    // Conversión explícita de tipos para coordenadas
    latitud: evento.latitud !== null ? Number(evento.latitud) : null,
    longitud: evento.longitud !== null ? Number(evento.longitud) : null
  };
}

/**
 * Servicio para obtener un evento por su ID con verificación de organizador
 */
export async function getEventoByIdWithOrganizadorService(id_evento: number, id_organizador?: number) {
  const whereClause = id_organizador 
    ? and(eq(eventoTable.id_evento, id_evento), eq(eventoTable.id_organizador, id_organizador))
    : eq(eventoTable.id_evento, id_evento);

  const [evento] = await db.select().from(eventoTable)
    .where(whereClause);

  if (!evento) {
    throw new CustomError('Evento no encontrado', 404);
  }

  return {
    ...evento,
    latitud: evento.latitud !== null ? Number(evento.latitud) : null,
    longitud: evento.longitud !== null ? Number(evento.longitud) : null
  };
}