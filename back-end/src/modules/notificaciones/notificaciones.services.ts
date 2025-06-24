import { db } from '../../db/drizzle';
import { notificacionTable, type NewNotificacion } from '../../db/schema/notificaciones.schema';
import { eq } from 'drizzle-orm';

export async function crearNotificacion(data: Omit<NewNotificacion, 'fecha_envio'>) {
  const [notificacion] = await db.insert(notificacionTable).values({
    ...data,
    fecha_envio: new Date()
  }).returning();
  return notificacion;
}

export async function obtenerNotificacionesPorUsuario(id_usuario: number) {
  const notificaciones = await db.query.notificacionTable.findMany({
    where: eq(notificacionTable.id_usuario, id_usuario),
    orderBy: (row) => row.fecha_envio
  });
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
