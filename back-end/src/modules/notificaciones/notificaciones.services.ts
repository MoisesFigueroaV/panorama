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

  // Insertar estado inicial (por ejemplo: ID 1 = "enviada" o "no_leída")
  await db.insert(historialEstadoNotificacionTable).values({
    id_notificacion: notificacion.id_notificacion,
    id_estado_notificacion: 1, // debes validar el ID correspondiente
    fecha_cambio: new Date(),
  });
    return notificacion;
}

export async function obtenerNotificacionesPorUsuario(id_usuario: number) {
  const notificaciones = await db.execute(sql`
    SELECT
    n.id_notificacion,
    n.id_usuario,
    n.id_evento,
    n.mensaje,
    n.fecha_envio,
    n.tipo,
    h.id_estado_notificacion,
    e.nombre_estado,
    h.id_estado_notificacion,
    e.nombre_estado
    FROM notificacion n
    LEFT JOIN LATERAL (
      SELECT h.id_estado_notificacion, h.fecha_cambio
      FROM historial_estado_notificacion h
      WHERE h.id_notificacion = n.id_notificacion
      ORDER BY h.fecha_cambio DESC
      LIMIT 1
    ) h ON true
    LEFT JOIN estado_notificacion e ON e.id_estado_notificacion = h.id_estado_notificacion
    WHERE n.id_usuario = ${id_usuario}
    ORDER BY h.fecha_cambio DESC;
  `);

  return notificaciones;
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
