import Elysia, { t } from 'elysia';
import { authMiddleware, requireAuth } from '../../middleware/auth.middleware';
import { createEventoService, updateEventoService, getEventosByOrganizadorService } from './evento.services';
import { createEventoSchema, updateEventoSchema, eventoResponseSchema, eventosResponseSchema } from './evento.types';
import { CustomError } from '../../utils/errors';

/**
 * Mapeador de eventos para ajustar el formato de respuesta.
 * Adaptado al modelo actual (sin fechas datetime completas ni múltiples categorías).
 */
function mapEventoToResponse(evento: any) {
  return {
    ...evento,
    descripcion: evento.descripcion ?? undefined,
    imagen: evento.imagen ?? undefined,
    fecha_inicio: evento.fecha_inicio,
    fecha_fin: evento.fecha_fin,
    ubicacion: evento.ubicacion ?? undefined,
    capacidad: evento.capacidad,
    id_categoria: evento.id_categoria,
    id_estado_evento: evento.id_estado_evento ?? undefined,
    fecha_registro: evento.fecha_registro,
    latitud: evento.latitud !== null ? parseFloat(evento.latitud) : undefined,
    longitud: evento.longitud !== null ? parseFloat(evento.longitud) : undefined,
  };
}
    /**
     * 🔧 Para futuras migraciones de fechas completas (timestamps):
     * creado_en, actualizado_en
     */

    /**
     * 🔧 Para futuras migraciones de múltiples categorías:
     * categorias: Array.isArray(evento.categorias)
     *   ? evento.categorias
     *   : (typeof evento.categorias === 'string'
     *         ? JSON.parse(evento.categorias)
     *         : [])
     */

export const eventoRoutes = new Elysia({ prefix: '/eventos', detail: { tags: ['Eventos'] } })
  .use(authMiddleware)

  /**
   * Crear evento
   */
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

  /**
   * Listar eventos del organizador autenticado
   */
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

  /**
   * Actualizar evento existente
   */
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
