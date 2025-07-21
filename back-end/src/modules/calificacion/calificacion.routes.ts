import Elysia, { t } from 'elysia';
import { requireAuth } from '../../middleware/auth.middleware';
import { crearCalificacionEvento, obtenerCalificacionesPorEvento, obtenerPromedioCalificacionesOrganizador } from './calificacion.services';

export const calificacionRoutes = new Elysia({ prefix: '/calificaciones' })
  // Crear calificación
  .post('/', async (context) => {
    const { body } = context;
    const session = (context as any).session;
    const currentSession = requireAuth()(session);
    const { id_evento, puntuacion, comentario } = body;
    if (!id_evento || !puntuacion) throw new Error('Faltan datos obligatorios');
    return await crearCalificacionEvento({
      id_usuario: currentSession.subAsNumber,
      id_evento,
      puntuacion,
      comentario: comentario ?? ''
    });
  }, {
    body: t.Object({
      id_evento: t.Number(),
      puntuacion: t.Number({ minimum: 1, maximum: 5 }),
      comentario: t.Optional(t.String())
    }),
    detail: { summary: 'Crear calificación de evento', security: [{ bearerAuth: [] }] }
  })

  // Obtener calificaciones de un evento
  .get('/evento/:id_evento', async (context) => {
    const { params } = context;
    return await obtenerCalificacionesPorEvento(Number(String(params.id_evento)));
  }, {
    params: t.Object({ id_evento: t.String() }),
    detail: { summary: 'Obtener calificaciones de un evento' }
  })

  // Obtener promedio de calificaciones de un organizador
  .get('/organizador/:id_organizador', async (context) => {
    const { params } = context;
    return await obtenerPromedioCalificacionesOrganizador(Number(String(params.id_organizador)));
  }, {
    params: t.Object({ id_organizador: t.String() }),
    detail: { summary: 'Obtener promedio de calificaciones de un organizador' }
  }); 