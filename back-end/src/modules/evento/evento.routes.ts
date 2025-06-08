import Elysia, { t } from 'elysia';
import { authMiddleware, requireAuth } from '../../middleware/auth.middleware';
import { createEventoService, updateEventoService, getEventosByOrganizadorService } from './evento.services';
import { createEventoSchema, updateEventoSchema, eventoResponseSchema, eventosResponseSchema } from './evento.types';
import { CustomError } from '../../utils/errors';

function mapEventoToResponse(evento: any) {
  return {
    ...evento,
    descripcion: evento.descripcion ?? undefined,
    imagen_url: evento.imagen_url ?? undefined,
    fecha_inicio: evento.fecha_inicio instanceof Date ? evento.fecha_inicio.toISOString() : evento.fecha_inicio,
    fecha_fin: evento.fecha_fin instanceof Date ? evento.fecha_fin.toISOString() : evento.fecha_fin,
    creado_en: evento.creado_en instanceof Date ? evento.creado_en.toISOString() : evento.creado_en,
    actualizado_en: evento.actualizado_en instanceof Date ? evento.actualizado_en.toISOString() : evento.actualizado_en,
    categorias: Array.isArray(evento.categorias)
      ? evento.categorias
      : (typeof evento.categorias === 'string'
          ? JSON.parse(evento.categorias)
          : []),
  };
}

export const eventoRoutes = new Elysia({ prefix: '/eventos', detail: { tags: ['Eventos'] } })
  .use(authMiddleware)
  .post(
    '/',
    async (context) => {
      const currentSession = requireAuth()(context.session);
      const evento = await createEventoService(currentSession.subAsNumber, context.body);
      context.set.status = 201;
      return mapEventoToResponse(evento);
    },
    {
      body: createEventoSchema,
      response: { 201: eventoResponseSchema, 400: eventoResponseSchema, 500: eventoResponseSchema },
      detail: { summary: 'Crear evento', security: [{ bearerAuth: [] }] }
    }
  )
  .get(
    '/mis-eventos',
    async (context) => {
      const currentSession = requireAuth()(context.session);
      const eventos = await getEventosByOrganizadorService(currentSession.subAsNumber);
      return eventos.map(mapEventoToResponse);
    },
    {
      response: { 200: eventosResponseSchema, 401: eventoResponseSchema, 500: eventoResponseSchema },
      detail: { summary: 'Listar mis eventos', security: [{ bearerAuth: [] }] }
    }
  )
  .put(
    '/:id',
    async (context) => {
      const currentSession = requireAuth()(context.session);
      const id_evento = Number(context.params.id);
      const evento = await updateEventoService(id_evento, currentSession.subAsNumber, context.body);
      return mapEventoToResponse(evento);
    },
    {
      params: t.Object({ id: t.String() }),
      body: updateEventoSchema,
      response: { 200: eventoResponseSchema, 400: eventoResponseSchema, 404: eventoResponseSchema, 500: eventoResponseSchema },
      detail: { summary: 'Actualizar evento', security: [{ bearerAuth: [] }] }
    }
  );