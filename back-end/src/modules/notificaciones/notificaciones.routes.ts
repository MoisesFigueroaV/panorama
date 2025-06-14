import { Elysia } from 'elysia';
import { obtenerNotificacionesPorUsuario } from './notificaciones.services';

export const notificaciones = new Elysia({ prefix: '/notificaciones' });

notificaciones.get('/usuario/:id_usuario', async ({ params, set }) => {
  const id = Number(params.id_usuario);
  if (isNaN(id)) {
    set.status = 400;
    return { error: 'ID de usuario inválido' };
  }

  try {
    const notificaciones = await obtenerNotificacionesPorUsuario(id);
    return { notificaciones };
  } catch {
    set.status = 500;
    return { error: 'Error al obtener notificaciones' };
  }
});
