import { db } from '../../db/drizzle';
import { calificacionEventoTable, eventoTable, usuarioTable } from '../../db/schema';
import { and, eq, sql, desc, count, avg } from 'drizzle-orm';
import { CustomError } from '../../utils/errors';

export async function crearCalificacionEvento({ id_usuario, id_evento, puntuacion, comentario }: {
  id_usuario: number,
  id_evento: number,
  puntuacion: number,
  comentario: string
}) {
  // Verificar que el evento esté finalizado
  const [evento] = await db.select().from(eventoTable).where(eq(eventoTable.id_evento, id_evento));
  if (!evento) throw new CustomError('Evento no encontrado', 404);
  const hoy = new Date().toISOString().split('T')[0];
  if (evento.fecha_fin >= hoy) throw new CustomError('Solo puedes calificar eventos finalizados', 400);

  // Verificar que el usuario no haya calificado antes
  const [yaCalifico] = await db.select().from(calificacionEventoTable)
    .where(and(eq(calificacionEventoTable.id_usuario, id_usuario), eq(calificacionEventoTable.id_evento, id_evento)));
  if (yaCalifico) throw new CustomError('Ya has calificado este evento', 400);

  // Insertar calificación
  const [nueva] = await db.insert(calificacionEventoTable).values({
    id_usuario,
    id_evento,
    puntuacion,
    comentario,
    fecha: hoy
  }).returning();
  return nueva;
}

export async function obtenerCalificacionesPorEvento(id_evento: number) {
  // Join con usuario para obtener nombre
  const rows = await db.select({
    id_calificacion: calificacionEventoTable.id_calificacion,
    puntuacion: calificacionEventoTable.puntuacion,
    comentario: calificacionEventoTable.comentario,
    fecha: calificacionEventoTable.fecha,
    id_usuario: usuarioTable.id_usuario,
    nombre_usuario: usuarioTable.nombre_usuario
  })
    .from(calificacionEventoTable)
    .leftJoin(usuarioTable, eq(calificacionEventoTable.id_usuario, usuarioTable.id_usuario))
    .where(eq(calificacionEventoTable.id_evento, id_evento))
    .orderBy(desc(calificacionEventoTable.fecha));
  return rows;
}

export async function obtenerPromedioCalificacionesOrganizador(id_organizador: number) {
  // Obtener todos los eventos del organizador
  const eventos = await db.select({ id_evento: eventoTable.id_evento })
    .from(eventoTable)
    .where(eq(eventoTable.id_organizador, id_organizador));
  const ids = eventos.map(e => e.id_evento);
  if (ids.length === 0) return { promedio: null, total: 0, comentarios: [] };

  // Calcular promedio y total
  const [res] = await db.select({ promedio: avg(calificacionEventoTable.puntuacion), total: count() })
    .from(calificacionEventoTable)
    .where(sql`${calificacionEventoTable.id_evento} = ANY(${ids})`);

  // Obtener últimos comentarios (opcional, por ejemplo los 5 más recientes)
  const comentarios = await db.select({
    id_calificacion: calificacionEventoTable.id_calificacion,
    puntuacion: calificacionEventoTable.puntuacion,
    comentario: calificacionEventoTable.comentario,
    fecha: calificacionEventoTable.fecha,
    id_usuario: usuarioTable.id_usuario,
    nombre_usuario: usuarioTable.nombre_usuario,
    id_evento: calificacionEventoTable.id_evento
  })
    .from(calificacionEventoTable)
    .leftJoin(usuarioTable, eq(calificacionEventoTable.id_usuario, usuarioTable.id_usuario))
    .where(sql`${calificacionEventoTable.id_evento} = ANY(${ids})`)
    .orderBy(desc(calificacionEventoTable.fecha))
    .limit(5);

  return {
    promedio: res.promedio ? Number(res.promedio).toFixed(2) : null,
    total: res.total,
    comentarios
  };
} 