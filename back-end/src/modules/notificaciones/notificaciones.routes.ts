import { Elysia, t } from 'elysia';
import { obtenerNotificacionesPorUsuario } from './notificaciones.services';
import { notificacionesResponseSchema } from './notificaciones.types';
import { CustomError } from '../../utils/errors';
import { db } from '../../db/drizzle';
import { notificacionTable } from '../../db/schema/notificaciones.schema';
import { eq } from 'drizzle-orm';
import { historialEstadoNotificacionTable } from '../../db/schema/historial_estado_notificacion.schema';
import { NotificacionConEstado } from './notificaciones.types'

export const notificaciones = new Elysia({ prefix: '/notificaciones', detail: { tags: ['Notificaciones'] } });

notificaciones.get(
  '/usuario/:id_usuario',
  async ({ params }) => {
    const id = Number(params.id_usuario);
    if (isNaN(id)) {
      throw new CustomError('ID de usuario inválido', 400);
    }

  const notificacionesDb = await obtenerNotificacionesPorUsuario(id) as unknown as NotificacionConEstado[];


    const notificaciones = notificacionesDb.map(n => ({
      ...n,
      fecha_envio: n.fecha_envio instanceof Date ? n.fecha_envio.toISOString() : n.fecha_envio
    }));

    return { notificaciones };
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

  await db.insert(historialEstadoNotificacionTable).values({
    id_notificacion: id,
    id_estado_notificacion: 2, // ID del estado "leída"
    fecha_cambio: new Date(),
  });

  return { message: 'Notificación marcada como leída' };
});

