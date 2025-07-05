import { desc, eq, sql } from 'drizzle-orm';
import { db } from '../../db/drizzle';
import { notificacionTable, type NewNotificacion } from '../../db/schema/notificaciones.schema';
import { historialEstadoNotificacionTable } from '../../db/schema/historial_estado_notificacion.schema';
import { estadoNotificacionTable } from '../../db/schema/estado_notificacion.schema';

export async function crearNotificacion(data: Omit<NewNotificacion, 'fecha_envio'>) {
  const [notificacion] = await db.insert(notificacionTable).values({
    ...data,
    fecha_envio: new Date(),
  }).returning();

  await db.insert(historialEstadoNotificacionTable).values({
    id_notificacion: notificacion.id_notificacion,
    id_estado_notificacion: 1,
    fecha_cambio: new Date(),
  });
    return notificacion;
}

export async function obtenerNotificacionesPorUsuario(id_usuario: number) {
  // Subconsulta con DISTINCT ON para obtener solo el último estado
  const subqueryUltimoEstado = db
    .select({
      id_notificacion: historialEstadoNotificacionTable.id_notificacion,
      id_estado_notificacion: historialEstadoNotificacionTable.id_estado_notificacion,
    })
    .from(historialEstadoNotificacionTable)
    .where(
      sql`(id_notificacion, fecha_cambio) IN (
        SELECT DISTINCT ON (id_notificacion)
          id_notificacion, fecha_cambio
        FROM historial_estado_notificacion
        ORDER BY id_notificacion, fecha_cambio DESC
      )`
    )
    .as('ultimo_estado');

  const notificaciones = await db
    .select({
      id_notificacion: notificacionTable.id_notificacion,
      id_usuario: notificacionTable.id_usuario,
      mensaje: notificacionTable.mensaje,
      fecha_envio: notificacionTable.fecha_envio,
      tipo: notificacionTable.tipo,
      nombre_estado: estadoNotificacionTable.nombre_estado,
    })
    .from(notificacionTable)
    .leftJoin(subqueryUltimoEstado, eq(notificacionTable.id_notificacion, subqueryUltimoEstado.id_notificacion))
    .leftJoin(estadoNotificacionTable, eq(subqueryUltimoEstado.id_estado_notificacion, estadoNotificacionTable.id_estado_notificacion))
    .where(eq(notificacionTable.id_usuario, id_usuario))
    .orderBy(desc(notificacionTable.fecha_envio));

  return notificaciones.map(n => ({
    ...n,
    nombre_estado: n.nombre_estado ?? 'No leída',
    leido: n.nombre_estado?.toLowerCase() === 'leída',
  }));
}

export async function eliminarNotificacion(id_notificacion: number) {
  const result = await db.delete(notificacionTable)
    .where(eq(notificacionTable.id_notificacion, id_notificacion));
  return result;
}

export async function obtenerNotificacionPorId(id_notificacion: number) {
  const notificacion = await db.query.notificacionTable.findFirst({
    where: eq(notificacionTable.id_notificacion, id_notificacion)
  });
  return notificacion;
}

export async function obtenerTodasNotificaciones() {
  const notificaciones = await db.query.notificacionTable.findMany({
    orderBy: (row) => row.fecha_envio
  });
  return notificaciones;
}
