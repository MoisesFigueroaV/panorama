import Elysia, { t } from 'elysia';
import { authMiddleware, requireAuth } from '../../middleware/auth.middleware';
<<<<<<< HEAD
import { createEventoService, updateEventoService, getEventosByOrganizadorService , getEventoByIdService, getOrganizerDashboardStatsService, getEventosDestacadosService, getCategoriasEventosService, getEventosByCategoriaService } from './evento.services';
=======
import { createEventoService, updateEventoService, getEventosByOrganizadorService , getEventoByIdService} from './evento.services';
>>>>>>> 9b16e0e8aaf80a7553ef750cce933980284339e5
import { createEventoSchema, updateEventoSchema, eventoResponseSchema, eventosResponseSchema } from './evento.types';
import { CustomError } from '../../utils/errors';
import { getOrganizadorByUserIdService } from '../organizador/organizador.services';
import { z } from 'zod';

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
    // Conversión explícita a number si no es null
    latitud: evento.latitud !== null && evento.latitud !== undefined ? Number(evento.latitud) : undefined,
    longitud: evento.longitud !== null && evento.longitud !== undefined ? Number(evento.longitud) : undefined,
  };
}

export const eventoRoutes = new Elysia({ prefix: '/eventos', detail: { tags: ['Eventos'] } })
  .use(authMiddleware)

  /**
   * Crear evento
   */
  .post(
    '/',
    async (context) => {
<<<<<<< HEAD
      try {
        console.log('🚀 POST /eventos - Petición recibida');
        console.log('🚀 Headers:', context.request.headers);
        console.log('🚀 Body:', context.body);
        
        const currentSession = requireAuth()(context.session);
        console.log('🚀 Sesión autenticada:', currentSession);

        // Buscar el perfil de organizador del usuario autenticado
        const organizador = await getOrganizadorByUserIdService(currentSession.subAsNumber);
        console.log('🚀 Organizador encontrado:', organizador);
        
        if (!organizador) {
          console.error('❌ No se encontró perfil de organizador para usuario:', currentSession.subAsNumber);
          throw new CustomError('No tienes un perfil de organizador asociado.', 403);
        }

        console.log('🚀 Creando evento para organizador:', organizador.id_organizador);
        const evento = await createEventoService(organizador.id_organizador, context.body);
        console.log('🚀 Evento creado exitosamente:', evento);
        
        context.set.status = 201;
        return mapEventoToResponse(evento);
      } catch (error) {
        console.error('❌ Error en POST /eventos:', error);
        
        // Si es un CustomError, dejarlo pasar para que el middleware lo maneje
        if (error instanceof CustomError) {
          throw error;
        }
        
        // Si es un error de validación de Elysia, manejarlo
        if (error instanceof Error && error.message.includes('Validation failed')) {
          throw new CustomError('Datos de entrada inválidos: ' + error.message, 400);
        }
        
        // Para otros errores, devolver un error genérico
        console.error('❌ Error no manejado:', error);
        throw new CustomError('Error interno del servidor al crear el evento', 500);
      }
=======
      const currentSession = requireAuth()(context.session);

      // Buscar el perfil de organizador del usuario autenticado
      const organizador = await getOrganizadorByUserIdService(currentSession.subAsNumber);
      if (!organizador) {
        throw new CustomError('No tienes un perfil de organizador asociado.', 403);
      }

      const evento = await createEventoService(organizador.id_organizador, context.body);
      context.set.status = 201;
      return mapEventoToResponse(evento);
>>>>>>> 9b16e0e8aaf80a7553ef750cce933980284339e5
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

      // Buscar el perfil de organizador del usuario autenticado
      const organizador = await getOrganizadorByUserIdService(currentSession.subAsNumber);
      if (!organizador) {
        throw new CustomError('No tienes un perfil de organizador asociado.', 403);
      }

      // Buscar solo los eventos de este organizador
      const eventos = await getEventosByOrganizadorService(organizador.id_organizador);
      return eventos.map(mapEventoToResponse);
    },
    {
      response: { 200: t.Array(eventoResponseSchema) },
      detail: { summary: 'Listar mis eventos', security: [{ bearerAuth: [] }] }
    }
  )

  /**
<<<<<<< HEAD
   * Obtener estadísticas del dashboard del organizador
   */
  .get(
    '/dashboard-stats',
=======
   * Actualizar evento existente
   */
  .put(
    '/:id_evento',
>>>>>>> 9b16e0e8aaf80a7553ef750cce933980284339e5
    async (context) => {
      const currentSession = requireAuth()(context.session);

      // Buscar el perfil de organizador del usuario autenticado
      const organizador = await getOrganizadorByUserIdService(currentSession.subAsNumber);
      if (!organizador) {
        throw new CustomError('No tienes un perfil de organizador asociado.', 403);
      }

<<<<<<< HEAD
      // Obtener estadísticas del dashboard
      const stats = await getOrganizerDashboardStatsService(organizador.id_organizador);
      return stats;
    },
    {
      response: { 
        200: t.Object({
          eventosActivos: t.Number(),
          eventosPendientes: t.Number(),
          eventosTotales: t.Number(),
          eventosPorCategoria: t.Array(t.Object({
            categoria: t.String(),
            cantidad: t.Number()
          }))
        })
      },
      detail: { summary: 'Obtener estadísticas del dashboard', security: [{ bearerAuth: [] }] }
    }
  )

  /**
   * Actualizar evento existente
   */
  .put(
    '/:id_evento',
    async (context) => {
      const currentSession = requireAuth()(context.session);

      // Buscar el perfil de organizador del usuario autenticado
      const organizador = await getOrganizadorByUserIdService(currentSession.subAsNumber);
      if (!organizador) {
        throw new CustomError('No tienes un perfil de organizador asociado.', 403);
      }

      // Verifica que el evento pertenezca a este organizador
      const evento = await getEventoByIdService(Number(context.params.id_evento));
      if (!evento || evento.id_organizador !== organizador.id_organizador) {
        throw new CustomError('No tienes permiso para modificar este evento.', 403);
      }

      const eventoActualizado = await updateEventoService(Number(context.params.id_evento), organizador.id_organizador, context.body);
      return mapEventoToResponse(eventoActualizado);
    },
    {
      body: updateEventoSchema,
      response: { 200: eventoResponseSchema, 400: eventoResponseSchema, 500: eventoResponseSchema },
      detail: { summary: 'Actualizar mi evento', security: [{ bearerAuth: [] }] }
    }
  );

// Rutas públicas para eventos
export const publicEventoRoutes = new Elysia({
  prefix: '/eventos',
  detail: { tags: ['Eventos Públicos'] }
})
.get(
  '/destacados',
  async ({ query }) => {
    const limit = query.limit ? parseInt(query.limit) : 6;
    return await getEventosDestacadosService(limit);
  },
  {
    query: t.Object({
      limit: t.Optional(t.String()),
    }),
    detail: { summary: 'Obtener eventos destacados para la página principal' }
  }
)
.get(
  '/organizador/:id',
  async ({ params }) => {
    const organizadorId = parseInt(params.id);
    return await getEventosByOrganizadorService(organizadorId);
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    detail: { summary: 'Obtener eventos de un organizador específico' }
  }
)
.get(
  '/categorias',
  async () => {
    return await getCategoriasEventosService();
  },
  {
    detail: { summary: 'Obtener todas las categorías de eventos' }
  }
)
.get(
  '/categoria/:id',
  async ({ params, query }) => {
    const categoriaId = parseInt(params.id);
    const limit = query.limit ? parseInt(query.limit) : 100;
    return await getEventosByCategoriaService(categoriaId, limit);
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    query: t.Object({
      limit: t.Optional(t.String()),
    }),
    detail: { summary: 'Obtener eventos por categoría específica' }
  }
)
.get(
  '/:id',
  async ({ params }) => {
    const eventoId = parseInt(params.id);
    return await getEventoByIdService(eventoId);
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    detail: { summary: 'Obtener un evento específico por ID' }
  }
);
=======
      // Verifica que el evento pertenezca a este organizador
      const evento = await getEventoByIdService(Number(context.params.id_evento));
      if (!evento || evento.id_organizador !== organizador.id_organizador) {
        throw new CustomError('No tienes permiso para modificar este evento.', 403);
      }

      const eventoActualizado = await updateEventoService(Number(context.params.id_evento), organizador.id_organizador, context.body);
      return mapEventoToResponse(eventoActualizado);
    },
    {
      body: updateEventoSchema,
      response: { 200: eventoResponseSchema, 400: eventoResponseSchema, 500: eventoResponseSchema },
      detail: { summary: 'Actualizar mi evento', security: [{ bearerAuth: [] }] }
    }
  );
>>>>>>> 9b16e0e8aaf80a7553ef750cce933980284339e5
