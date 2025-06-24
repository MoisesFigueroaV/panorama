import { Elysia, t } from 'elysia';
import { obtenerNotificacionesPorUsuario } from './notificaciones.services';
import { notificacionesResponseSchema } from './notificaciones.types';
import { CustomError } from '../../utils/errors';

export const notificaciones = new Elysia({ prefix: '/notificaciones', detail: { tags: ['Notificaciones'] } });

notificaciones.get(
  '/usuario/:id_usuario',
  async ({ params }) => {
    const id = Number(params.id_usuario);
    if (isNaN(id)) {
      throw new CustomError('ID de usuario inválido', 400);
    }

    const notificacionesDb = await obtenerNotificacionesPorUsuario(id);

    // Ajuste para convertir fechas Date a string ISO antes de devolver:
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
