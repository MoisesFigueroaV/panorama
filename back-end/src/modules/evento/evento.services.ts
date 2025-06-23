import { db } from '../../db/drizzle';
import { eventoTable } from '../../db/schema/evento.schema';
import { eq, and, like, gte, lte, desc, asc, sql, count } from 'drizzle-orm';
import { CustomError } from '../../utils/errors';
import type { CreateEventoPayload, UpdateEventoPayload } from './evento.types';
import { organizadorTable } from '../../db/schema/organizador.schema';
import { categoriaEventoTable } from '../../db/schema/categoriaEvento.schema';
import { estadoEventoTable } from '../../db/schema/estadoEvento.schema'
import { getImageUrl } from '../../utils/upload';



/**
 * Servicio para crear un nuevo evento.
 */
export async function createEventoService(id_organizador: number, data: CreateEventoPayload) {
  console.log('🟢 Entrando a createEventoService');
  try {
    const fechaInicio = new Date(data.fecha_inicio);
    const fechaFin = new Date(data.fecha_fin);

    console.log('🔍 Fechas procesadas:', { 
      fechaInicio: fechaInicio.toISOString(), 
      fechaFin: fechaFin.toISOString() 
    });

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      console.error('❌ Fechas inválidas:', { fechaInicio, fechaFin });
      console.log('🔴 Retornando por fechas inválidas');
      throw new CustomError('Las fechas no tienen un formato válido.', 400);
    }
    if (fechaInicio > fechaFin) {
      console.error('❌ Fecha de inicio posterior a fecha de fin');
      console.log('🔴 Retornando por fecha de inicio > fecha de fin');
      throw new CustomError('La fecha de inicio no puede ser posterior a la fecha de fin.', 400);
    }
    if (data.capacidad < 1) {
      console.error('❌ Capacidad inválida:', data.capacidad);
      console.log('🔴 Retornando por capacidad inválida');
      throw new CustomError('La capacidad debe ser mayor o igual a 1.', 400);
    }

    const eventoData: any = {
      titulo: data.titulo,
      descripcion: data.descripcion ?? null,
      fecha_inicio: fechaInicio.toISOString().split('T')[0],
      fecha_fin: fechaFin.toISOString().split('T')[0],
      hora_inicio: data.hora_inicio,
      hora_fin: data.hora_fin,
      imagen: data.imagen,
      ubicacion: data.ubicacion ?? null,
      capacidad: data.capacidad,
      id_categoria: data.id_categoria,
      id_organizador,
      fecha_registro: new Date().toISOString().split('T')[0],
    };

    // Solo agregar latitud y longitud si tienen valor numérico válido
    if (data.latitud !== undefined && data.latitud !== null && data.latitud !== '' && !isNaN(Number(data.latitud))) {
      eventoData.latitud = Number(data.latitud);
    }
    if (data.longitud !== undefined && data.longitud !== null && data.longitud !== '' && !isNaN(Number(data.longitud))) {
      eventoData.longitud = Number(data.longitud);
    }

    // Solo agregar id_estado_evento si se proporciona
    if (data.id_estado_evento !== undefined && data.id_estado_evento !== null) {
      eventoData.id_estado_evento = data.id_estado_evento;
    } else {
      // Si no viene, asignar por defecto 1 (Borrador)
      eventoData.id_estado_evento = 1;
    }

    // Log detallado de los datos y tipos antes del insert
    console.log('📤 Datos a insertar en BD:', eventoData)
    Object.entries(eventoData).forEach(([k, v]) => {
      console.log(`  - ${k}:`, v, '| tipo:', typeof v)
    })

    const [evento] = await db.insert(eventoTable).values(eventoData).returning();
    console.log('✅ Evento creado exitosamente:', evento);

    if (!evento) throw new CustomError('No se pudo crear el evento.', 500);
    return evento;
  } catch (error) {
    console.error('❌ Error en createEventoService:', error);
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
    ...(data.hora_inicio !== undefined && { hora_inicio: data.hora_inicio }),
    ...(data.hora_fin !== undefined && { hora_fin: data.hora_fin }),
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
 * Servicio para obtener un evento específico por ID
 */
export async function getEventoByIdService(eventoId: number) {
  try {
    const evento = await db
      .select({
        id_evento: eventoTable.id_evento,
        titulo: eventoTable.titulo,
        descripcion: eventoTable.descripcion,
        fecha_inicio: eventoTable.fecha_inicio,
        fecha_fin: eventoTable.fecha_fin,
        ubicacion: eventoTable.ubicacion,
        imagen: eventoTable.imagen,
        capacidad: eventoTable.capacidad,
        id_categoria: eventoTable.id_categoria,
        id_organizador: eventoTable.id_organizador,
        latitud: eventoTable.latitud,
        longitud: eventoTable.longitud,
        // Información del organizador
        nombre_organizacion: organizadorTable.nombre_organizacion,
        logo_organizacion: organizadorTable.logo_organizacion,
        descripcion_organizacion: organizadorTable.descripcion,
        sitio_web_organizacion: organizadorTable.sitio_web,
        // Información de la categoría
        nombre_categoria: categoriaEventoTable.nombre_categoria,
      })
      .from(eventoTable)
      .leftJoin(organizadorTable, eq(eventoTable.id_organizador, organizadorTable.id_organizador))
      .leftJoin(categoriaEventoTable, eq(eventoTable.id_categoria, categoriaEventoTable.id_categoria))
      .where(eq(eventoTable.id_evento, eventoId))
      .limit(1);

    if (!evento || evento.length === 0) {
      throw new CustomError(`Evento con ID ${eventoId} no encontrado.`, 404);
    }

    const eventoData = evento[0];
    
    return {
      ...eventoData,
      // Transformar el campo imagen a URL completa usando getImageUrl
      imagen: eventoData.imagen ? getImageUrl(eventoData.imagen) : null,
      latitud: eventoData.latitud !== null ? Number(eventoData.latitud) : null,
      longitud: eventoData.longitud !== null ? Number(eventoData.longitud) : null,
    };
  } catch (error) {
    console.error('Error al obtener evento por ID:', error);
    throw new CustomError('Error al obtener evento.', 500);
  }
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

/**
 * Servicio para obtener todos los eventos con información completa para el admin
 */
export async function getAllEventosForAdminService() {
  const eventos = await db.select({
    id_evento: eventoTable.id_evento,
    titulo: eventoTable.titulo,
    descripcion: eventoTable.descripcion,
    fecha_inicio: eventoTable.fecha_inicio,
    fecha_fin: eventoTable.fecha_fin,
    fecha_registro: eventoTable.fecha_registro,
    ubicacion: eventoTable.ubicacion,
    imagen: eventoTable.imagen,
    capacidad: eventoTable.capacidad,
    id_estado_evento: eventoTable.id_estado_evento,
    id_categoria: eventoTable.id_categoria,
    id_organizador: eventoTable.id_organizador,
    latitud: eventoTable.latitud,
    longitud: eventoTable.longitud,
    // Información del organizador
    nombre_organizacion: organizadorTable.nombre_organizacion,
    // Información de la categoría
    nombre_categoria: categoriaEventoTable.nombre_categoria,
    // Información del estado
    nombre_estado: estadoEventoTable.nombre_estado,
  })
  .from(eventoTable)
  .leftJoin(organizadorTable, eq(eventoTable.id_organizador, organizadorTable.id_organizador))
  .leftJoin(categoriaEventoTable, eq(eventoTable.id_categoria, categoriaEventoTable.id_categoria))
  .leftJoin(estadoEventoTable, eq(eventoTable.id_estado_evento, estadoEventoTable.id_estado_evento));

  return eventos.map(evento => ({
    ...evento,
    // Transformar el campo imagen a URL completa usando getImageUrl
    imagen: evento.imagen ? getImageUrl(evento.imagen) : null,
    latitud: evento.latitud !== null ? Number(evento.latitud) : null,
    longitud: evento.longitud !== null ? Number(evento.longitud) : null
  }));
}

/**
 * Servicio para que el admin cambie el estado de un evento
 */
export async function updateEventoEstadoByAdminService(id_evento: number, id_estado_evento: number) {
  // Verificar que el evento existe
  const [eventoExistente] = await db.select().from(eventoTable)
    .where(eq(eventoTable.id_evento, id_evento));

  if (!eventoExistente) {
    throw new CustomError('Evento no encontrado.', 404);
  }

  // Verificar que el estado es válido
  const [estadoValido] = await db.select().from(estadoEventoTable)
    .where(eq(estadoEventoTable.id_estado_evento, id_estado_evento));

  if (!estadoValido) {
    throw new CustomError('Estado de evento no válido.', 400);
  }

  // Actualizar el estado del evento
  const [eventoActualizado] = await db.update(eventoTable)
    .set({ id_estado_evento })
    .where(eq(eventoTable.id_evento, id_evento))
    .returning();

  if (!eventoActualizado) {
    throw new CustomError('No se pudo actualizar el estado del evento.', 500);
  }

  return eventoActualizado;
}

/**
 * Servicio para obtener eventos con paginación y filtros para el admin
 */
export async function getEventosWithFiltersService(params: {
  page?: number;
  limit?: number;
  search?: string;
  estado?: number;
  categoria?: number;
  organizador?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const {
    page = 1,
    limit = 10,
    search,
    estado,
    categoria,
    organizador,
    fechaDesde,
    fechaHasta,
    sortBy = 'fecha_registro',
    sortOrder = 'desc'
  } = params;

  // Construir condiciones de filtro
  const conditions = [];

  if (search) {
    conditions.push(
      like(eventoTable.titulo, `%${search}%`)
    );
  }

  if (estado) {
    conditions.push(eq(eventoTable.id_estado_evento, estado));
  }

  if (categoria) {
    conditions.push(eq(eventoTable.id_categoria, categoria));
  }

  if (organizador) {
    conditions.push(eq(eventoTable.id_organizador, organizador));
  }

  if (fechaDesde) {
    conditions.push(gte(eventoTable.fecha_inicio, fechaDesde));
  }

  if (fechaHasta) {
    conditions.push(lte(eventoTable.fecha_fin, fechaHasta));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Construir ordenamiento
  let orderByClause;
  switch (sortBy) {
    case 'titulo':
      orderByClause = sortOrder === 'asc' ? asc(eventoTable.titulo) : desc(eventoTable.titulo);
      break;
    case 'fecha_inicio':
      orderByClause = sortOrder === 'asc' ? asc(eventoTable.fecha_inicio) : desc(eventoTable.fecha_inicio);
      break;
    case 'capacidad':
      orderByClause = sortOrder === 'asc' ? asc(eventoTable.capacidad) : desc(eventoTable.capacidad);
      break;
    case 'organizador':
      orderByClause = sortOrder === 'asc' ? asc(organizadorTable.nombre_organizacion) : desc(organizadorTable.nombre_organizacion);
      break;
    default:
      orderByClause = sortOrder === 'asc' ? asc(eventoTable.fecha_registro) : desc(eventoTable.fecha_registro);
  }

  // Obtener total de registros
  const totalResult = await db.select({ count: sql<number>`count(*)` })
    .from(eventoTable)
    .leftJoin(organizadorTable, eq(eventoTable.id_organizador, organizadorTable.id_organizador))
    .leftJoin(categoriaEventoTable, eq(eventoTable.id_categoria, categoriaEventoTable.id_categoria))
    .leftJoin(estadoEventoTable, eq(eventoTable.id_estado_evento, estadoEventoTable.id_estado_evento))
    .where(whereClause);

  const total = totalResult[0]?.count || 0;

  // Calcular offset
  const offset = (page - 1) * limit;

  // Obtener eventos con paginación
  const eventos = await db.select({
    id_evento: eventoTable.id_evento,
    titulo: eventoTable.titulo,
    descripcion: eventoTable.descripcion,
    fecha_inicio: eventoTable.fecha_inicio,
    fecha_fin: eventoTable.fecha_fin,
    hora_inicio: eventoTable.hora_inicio,
    hora_fin: eventoTable.hora_fin,
    fecha_registro: eventoTable.fecha_registro,
    ubicacion: eventoTable.ubicacion,
    imagen: eventoTable.imagen,
    capacidad: eventoTable.capacidad,
    id_estado_evento: eventoTable.id_estado_evento,
    id_categoria: eventoTable.id_categoria,
    id_organizador: eventoTable.id_organizador,
    latitud: eventoTable.latitud,
    longitud: eventoTable.longitud,
    // Información del organizador
    nombre_organizacion: organizadorTable.nombre_organizacion,
    // Información de la categoría
    nombre_categoria: categoriaEventoTable.nombre_categoria,
    // Información del estado
    nombre_estado: estadoEventoTable.nombre_estado,
  })
  .from(eventoTable)
  .leftJoin(organizadorTable, eq(eventoTable.id_organizador, organizadorTable.id_organizador))
  .leftJoin(categoriaEventoTable, eq(eventoTable.id_categoria, categoriaEventoTable.id_categoria))
  .leftJoin(estadoEventoTable, eq(eventoTable.id_estado_evento, estadoEventoTable.id_estado_evento))
  .where(whereClause)
  .orderBy(orderByClause)
  .limit(limit)
  .offset(offset);

  const eventosProcessed = eventos.map(evento => ({
    ...evento,
    // Transformar el campo imagen a URL completa usando getImageUrl
    imagen: evento.imagen ? getImageUrl(evento.imagen) : null,
    latitud: evento.latitud !== null ? Number(evento.latitud) : null,
    longitud: evento.longitud !== null ? Number(evento.longitud) : null
  }));

  return {
    eventos: eventosProcessed,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  };
}

/**
 * Servicio para obtener opciones de filtros para eventos
 */
export async function getEventosFilterOptionsService() {
  // Obtener categorías
  const categorias = await db.select({
    id_categoria: categoriaEventoTable.id_categoria,
    nombre_categoria: categoriaEventoTable.nombre_categoria,
  })
  .from(categoriaEventoTable)
  .orderBy(asc(categoriaEventoTable.nombre_categoria));

  // Obtener estados
  const estados = await db.select({
    id_estado_evento: estadoEventoTable.id_estado_evento,
    nombre_estado: estadoEventoTable.nombre_estado,
  })
  .from(estadoEventoTable)
  .orderBy(asc(estadoEventoTable.nombre_estado));

  // Obtener organizadores únicos que tienen eventos
  const organizadores = await db.select({
    id_organizador: organizadorTable.id_organizador,
    nombre_organizacion: organizadorTable.nombre_organizacion,
  })
  .from(organizadorTable)
  .innerJoin(eventoTable, eq(organizadorTable.id_organizador, eventoTable.id_organizador))
  .orderBy(asc(organizadorTable.nombre_organizacion));

  return {
    categorias,
    estados,
    organizadores
  };
}

/**
 * Servicio para obtener estadísticas del dashboard del organizador
 */
export async function getOrganizerDashboardStatsService(id_organizador: number) {
  try {
    // Contar eventos activos (publicados) del organizador
    const [activeEventsCount] = await db
      .select({ value: count() })
      .from(eventoTable)
      .where(and(
        eq(eventoTable.id_organizador, id_organizador),
        eq(eventoTable.id_estado_evento, 2) // 2 = Publicado
      ));

    // Contar eventos pendientes (borrador) del organizador
    const [pendingEventsCount] = await db
      .select({ value: count() })
      .from(eventoTable)
      .where(and(
        eq(eventoTable.id_organizador, id_organizador),
        eq(eventoTable.id_estado_evento, 1) // 1 = Borrador
      ));

    // Contar total de eventos del organizador
    const [totalEventsCount] = await db
      .select({ value: count() })
      .from(eventoTable)
      .where(eq(eventoTable.id_organizador, id_organizador));

    // Obtener eventos por categoría del organizador
    const eventosPorCategoria = await db
      .select({
        id_categoria: categoriaEventoTable.id_categoria,
        nombre_categoria: categoriaEventoTable.nombre_categoria,
        count: sql<number>`count(*)`
      })
      .from(eventoTable)
      .leftJoin(categoriaEventoTable, eq(eventoTable.id_categoria, categoriaEventoTable.id_categoria))
      .where(eq(eventoTable.id_organizador, id_organizador))
      .groupBy(categoriaEventoTable.id_categoria, categoriaEventoTable.nombre_categoria)
      .orderBy(desc(sql`count(*)`));

    return {
      eventosActivos: activeEventsCount.value,
      eventosPendientes: pendingEventsCount.value,
      eventosTotales: totalEventsCount.value,
      eventosPorCategoria: eventosPorCategoria.map(item => ({
        categoria: item.nombre_categoria || 'Sin categoría',
        cantidad: Number(item.count)
      }))
    };
  } catch (error) {
    console.error('Error al obtener estadísticas del organizador:', error);
    throw new CustomError('Error al obtener estadísticas del dashboard.', 500);
  }
}

/**
 * Servicio para obtener eventos destacados para la página principal
 */
export async function getEventosDestacadosService(limit: number = 6) {
  try {
    const ID_ESTADO_PUBLICADO = 2; // Asumo que 2 es 'Publicado'.

    const eventos = await db
      .select({
        id_evento: eventoTable.id_evento,
        titulo: eventoTable.titulo,
        descripcion: eventoTable.descripcion,
        fecha_inicio: eventoTable.fecha_inicio,
        fecha_fin: eventoTable.fecha_fin,
        hora_inicio: eventoTable.hora_inicio,
        hora_fin: eventoTable.hora_fin,
        ubicacion: eventoTable.ubicacion,
        imagen: eventoTable.imagen,
        capacidad: eventoTable.capacidad,
        id_categoria: eventoTable.id_categoria,
        id_organizador: eventoTable.id_organizador,
        latitud: eventoTable.latitud,
        longitud: eventoTable.longitud,
        // Información del organizador
        nombre_organizacion: organizadorTable.nombre_organizacion,
        logo_organizacion: organizadorTable.logo_organizacion,
        // Información de la categoría
        nombre_categoria: categoriaEventoTable.nombre_categoria,
      })
      .from(eventoTable)
      .leftJoin(organizadorTable, eq(eventoTable.id_organizador, organizadorTable.id_organizador))
      .leftJoin(categoriaEventoTable, eq(eventoTable.id_categoria, categoriaEventoTable.id_categoria))
      .where(eq(eventoTable.id_estado_evento, ID_ESTADO_PUBLICADO)) // Filtrar por estado publicado
      .orderBy(desc(eventoTable.fecha_registro)) // Más recientes primero
      .limit(limit);

    const fechaActual = new Date().toISOString().split('T')[0];

    return eventos.map(evento => ({
      ...evento,
      // Transformar el campo imagen a URL completa usando getImageUrl
      imagen: evento.imagen ? getImageUrl(evento.imagen) : null,
      latitud: evento.latitud !== null ? Number(evento.latitud) : null,
      longitud: evento.longitud !== null ? Number(evento.longitud) : null,
      // Agregar campo para indicar si el evento ya pasó
      ya_realizado: evento.fecha_fin < fechaActual,
      proximo: evento.fecha_inicio >= fechaActual && evento.fecha_fin >= fechaActual,
      en_curso: evento.fecha_inicio <= fechaActual && evento.fecha_fin >= fechaActual
    }));
  } catch (error) {
    console.error('Error al obtener eventos destacados:', error);
    throw new CustomError('Error al obtener eventos destacados.', 500);
  }
}

/**
 * Servicio para obtener categorías de eventos
 */
export async function getCategoriasEventosService() {
  try {
    const categorias = await db
      .select({
        id_categoria: categoriaEventoTable.id_categoria,
        nombre_categoria: categoriaEventoTable.nombre_categoria,
      })
      .from(categoriaEventoTable)
      .orderBy(asc(categoriaEventoTable.nombre_categoria));

    return categorias;
  } catch (error) {
    console.error('Error al obtener categorías de eventos:', error);
    throw new CustomError('Error al obtener categorías de eventos.', 500);
  }
}

/**
 * Servicio para obtener eventos por categoría específica
 */
export async function getEventosByCategoriaService(categoriaId: number, limit: number = 100) {
  try {
    const ID_ESTADO_PUBLICADO = 2; // Asumo que 2 es 'Publicado'.

    const eventos = await db
      .select({
        id_evento: eventoTable.id_evento,
        titulo: eventoTable.titulo,
        descripcion: eventoTable.descripcion,
        fecha_inicio: eventoTable.fecha_inicio,
        fecha_fin: eventoTable.fecha_fin,
        hora_inicio: eventoTable.hora_inicio,
        hora_fin: eventoTable.hora_fin,
        ubicacion: eventoTable.ubicacion,
        imagen: eventoTable.imagen,
        capacidad: eventoTable.capacidad,
        id_categoria: eventoTable.id_categoria,
        id_organizador: eventoTable.id_organizador,
        latitud: eventoTable.latitud,
        longitud: eventoTable.longitud,
        // Información del organizador
        nombre_organizacion: organizadorTable.nombre_organizacion,
        logo_organizacion: organizadorTable.logo_organizacion,
        // Información de la categoría
        nombre_categoria: categoriaEventoTable.nombre_categoria,
      })
      .from(eventoTable)
      .leftJoin(organizadorTable, eq(eventoTable.id_organizador, organizadorTable.id_organizador))
      .leftJoin(categoriaEventoTable, eq(eventoTable.id_categoria, categoriaEventoTable.id_categoria))
      .where(and(
        eq(eventoTable.id_categoria, categoriaId),
        eq(eventoTable.id_estado_evento, ID_ESTADO_PUBLICADO)
      ))
      .orderBy(desc(eventoTable.fecha_registro)) // Más recientes primero
      .limit(limit);

    const fechaActual = new Date().toISOString().split('T')[0];

    return eventos.map(evento => ({
      ...evento,
      // Transformar el campo imagen a URL completa usando getImageUrl
      imagen: evento.imagen ? getImageUrl(evento.imagen) : null,
      latitud: evento.latitud !== null ? Number(evento.latitud) : null,
      longitud: evento.longitud !== null ? Number(evento.longitud) : null,
      // Agregar campo para indicar si el evento ya pasó
      ya_realizado: evento.fecha_fin < fechaActual,
      proximo: evento.fecha_inicio >= fechaActual && evento.fecha_fin >= fechaActual,
      en_curso: evento.fecha_inicio <= fechaActual && evento.fecha_fin >= fechaActual
    }));
  } catch (error) {
    console.error('Error al obtener eventos por categoría:', error);
    throw new CustomError('Error al obtener eventos por categoría.', 500);
  }
}