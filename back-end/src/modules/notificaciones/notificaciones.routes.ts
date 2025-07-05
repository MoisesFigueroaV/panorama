import { Elysia, t } from 'elysia';
import { obtenerNotificacionesPorUsuario } from './notificaciones.services';
import { notificacionesResponseSchema } from './notificaciones.types';
import { CustomError } from '../../utils/errors';
import { db } from '../../db/drizzle';
import { notificacionTable } from '../../db/schema/notificaciones.schema';
import { eq, desc} from 'drizzle-orm';
import { historialEstadoNotificacionTable } from '../../db/schema/historial_estado_notificacion.schema';
import { NotificacionConEstado } from './notificaciones.types'

export const notificaciones = new Elysia({ prefix: '/notificaciones', detail: { tags: ['Notificaciones'] } });

notificaciones.get(
  '/usuario/:id_usuario',
  async ({ params }) => {
    const id = Number(params.id_usuario);
    console.log('📥 ID recibido:', id);

    if (isNaN(id)) {
      console.warn('⚠️ ID inválido:', params.id_usuario);
      throw new CustomError('ID de usuario inválido', 400);
    }

    try {
      const notificacionesDb = await obtenerNotificacionesPorUsuario(id) as unknown as NotificacionConEstado[];
      console.log('🔔 Notificaciones obtenidas:', notificacionesDb.length);

    function toISOStringSafe(value: unknown): string {
      const date = new Date(value as string);
      return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
    }

    const notificaciones = notificacionesDb.map(n => ({
      id_notificacion: n.id_notificacion,
      id_usuario: n.id_usuario,
      mensaje: n.mensaje,
      tipo: n.tipo,
      fecha_envio: toISOStringSafe(n.fecha_envio),
      nombre_estado: n.nombre_estado ?? 'Desconocido',
    }));

      return { notificaciones };
    } catch (error) {
      console.error('❌ Error al obtener notificaciones:', error);
      throw new CustomError('Error interno al consultar notificaciones', 500);
    }
  },
  {
    params: t.Object({ id_usuario: t.String() }),
    response: { 200: t.Object({ notificaciones: notificacionesResponseSchema }) },
    detail: { summary: 'Obtener notificaciones por usuario', tags: ['Notificaciones'] }
  }
);

notificaciones.put('/marcar-leida/:id', async ({ params }) => {
  const id = Number(params.id);
  if (isNaN(id)) throw new CustomError('ID inválido', 400);

  // Verificar último estado
  const [ultimo] = await db.select()
    .from(historialEstadoNotificacionTable)
    .where(eq(historialEstadoNotificacionTable.id_notificacion, id))
    .orderBy(desc(historialEstadoNotificacionTable.fecha_cambio))
    .limit(1);

  if (ultimo?.id_estado_notificacion === 2) {
    return { message: 'Ya estaba marcada como leída' };
  }

  await db.insert(historialEstadoNotificacionTable).values({
    id_notificacion: id,
    id_estado_notificacion: 2,
    fecha_cambio: new Date(),
  });

  return { message: 'Notificación marcada como leída' };
});


