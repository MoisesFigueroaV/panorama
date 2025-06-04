// src/modules/organizador/organizador.routes.ts
import Elysia, { t, type Context, type Handler } from 'elysia';
import {
  authMiddleware,
  requireAuth,
  hasRole, // Para rutas de admin
  type AppSession
} from '../../middleware/auth.middleware';
// import { SwaggerResponses } from '../../utils/swagger'; // Si lo usas
import { CustomError, handleErrorLog } from '../../utils/errors';
import {
  createOrganizadorService,
  getOrganizadorByIdService,
  getOrganizadorByUserIdService,
  updateOrganizadorService,
  updateAcreditacionOrganizadorService,
  // getAllOrganizadoresService,
} from './organizador.services';
import {
  createOrganizadorSchema,
  updateOrganizadorSchema,
  organizadorResponseSchema,
  organizadoresResponseSchema,
  organizadorParamsSchema,
  updateAcreditacionSchema,
  // errorResponseSchema, // Importar si es global
} from './organizador.types';
import { errorResponseSchema } from '../usuario/usuario.types'; // Reutilizando el de usuario por ahora
import type { CreateOrganizadorPayload, UpdateOrganizadorPayload } from './organizador.types';

// const ADMIN_ROLE_ID = 1; // Definir IDs de roles

// Extender el contexto de Elysia para incluir session
type ElysiaContext = Context & {
    session: AppSession;
};

export const organizadorRoutes = new Elysia({
  prefix: '/organizadores',
  detail: { tags: ['Organizadores'] },
})
.use(authMiddleware) // Aplicar a todas las rutas del módulo para tener `session`
.post(
    '/',
    async (context) => {
        if (!('session' in context) || !('body' in context) || !('set' in context)) {
            throw new CustomError('Datos de contexto incompletos', 500);
        }
        const currentSession = requireAuth()(context.session as AppSession);
        const organizador = await createOrganizadorService(currentSession.subAsNumber, context.body as CreateOrganizadorPayload);
        (context.set as { status: number }).status = 201;
        return organizador;
    },
    {
        body: createOrganizadorSchema,
        response: { 201: organizadorResponseSchema, 400: errorResponseSchema, 403: errorResponseSchema, 404:errorResponseSchema, 409: errorResponseSchema, 500: errorResponseSchema },
        detail: {
            summary: 'Crear mi Perfil de Organizador',
            description: 'Permite a un usuario autenticado crear su perfil de organizador.',
            security: [{ bearerAuth: [] }]
        }
    }
)
.get(
    '/yo',
    async (context) => {
        if (!('session' in context)) throw new CustomError('No hay sesión', 401);
        const currentSession = requireAuth()(context.session as AppSession);
        const organizador = await getOrganizadorByUserIdService(currentSession.subAsNumber);
        if (!organizador) {
            throw new CustomError('No tienes un perfil de organizador asociado.', 404);
        }
        return organizador;
    },
    {
        response: { 200: organizadorResponseSchema, 401: errorResponseSchema, 404: errorResponseSchema, 500: errorResponseSchema },
        detail: {
            summary: 'Obtener mi Perfil de Organizador',
            security: [{ bearerAuth: [] }]
        }
    }
)
.get( // Obtener un perfil de organizador público por su ID
    '/:id',
    async ({ params }) => {
        return await getOrganizadorByIdService(params.id);
    },
    {
        params: organizadorParamsSchema,
        response: { 200: organizadorResponseSchema, 404: errorResponseSchema, 500: errorResponseSchema },
        detail: {
            summary: 'Obtener Perfil de Organizador por ID',
            description: 'Recupera la información pública de un organizador específico.'
        }
    }
)
.put(
    '/yo',
    async (context) => {
        if (!('session' in context) || !('body' in context)) {
            throw new CustomError('Datos de contexto incompletos', 500);
        }
        const currentSession = requireAuth()(context.session as AppSession);
        const perfilOrganizadorActual = await getOrganizadorByUserIdService(currentSession.subAsNumber);
        if (!perfilOrganizadorActual) {
            throw new CustomError('No tienes un perfil de organizador para actualizar.', 404);
        }
        return await updateOrganizadorService(perfilOrganizadorActual.id_organizador, context.body as UpdateOrganizadorPayload, currentSession);
    },
    {
        body: updateOrganizadorSchema,
        response: { 200: organizadorResponseSchema, 400: errorResponseSchema, 401: errorResponseSchema, 403: errorResponseSchema, 404: errorResponseSchema, 500: errorResponseSchema },
        detail: {
            summary: 'Actualizar mi Perfil de Organizador',
            security: [{ bearerAuth: [] }]
        }
    }
);

// Rutas de Admin para Organizadores (ejemplo)
export const adminOrganizadorRoutes = new Elysia({
    prefix: '/admin/organizadores', // Prefijo diferente para rutas de admin
    detail: { tags: ['Admin - Organizadores'] },
})
.use(authMiddleware)
.patch(
    '/:id/acreditacion',
    async (context) => {
        if (!('session' in context) || !('body' in context) || !('params' in context)) {
            throw new CustomError('Datos de contexto incompletos', 500);
        }
        const currentSession = requireAuth()(context.session as AppSession);
        if(currentSession.rol !== 1) throw new CustomError("Acceso denegado", 403);
        const params = context.params as unknown as { id: string };
        const id = parseInt(params.id, 10);
        if (isNaN(id)) throw new CustomError("ID inválido", 400);
        const body = context.body as unknown as { acreditado: boolean };
        return await updateAcreditacionOrganizadorService(id, body.acreditado);
    },
    {
        params: organizadorParamsSchema,
        body: updateAcreditacionSchema,
        response: { 200: organizadorResponseSchema, 401: errorResponseSchema, 403: errorResponseSchema, 404: errorResponseSchema, 500: errorResponseSchema },
        detail: {
            summary: 'Actualizar Estado de Acreditación (Admin)',
            security: [{ bearerAuth: [] }]
        }
    }
);
// TODO: GET /admin/organizadores (listar todos para admin, con filtros)
// TODO: DELETE /admin/organizadores/:id (eliminar organizador por admin)