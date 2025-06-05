// src/modules/organizador/organizador.routes.ts
import { Elysia, type Handler, type Context, type Static } from 'elysia';
import {
  authMiddleware,
  requireAuth,
  type AppSession 
} from '../../middleware/auth.middleware';
import { CustomError, handleErrorLog } from '../../utils/errors';
import {
  createOrganizadorService,
  getOrganizadorByIdService,
  getOrganizadorByUserIdService,
  updateOrganizadorService,
  updateAcreditacionOrganizadorService,
} from './organizador.services';
import {
  createOrganizadorSchema,
  updateOrganizadorSchema,
  organizadorResponseSchema,
  organizadorParamsSchema,
  updateAcreditacionSchema,
} from './organizador.types';
import { errorResponseSchema } from '../usuario/usuario.types';

type AuthContext<BodyT = unknown, ParamsT = Record<string, string>> = Context & { 
    session: AppSession;
    body: BodyT;
    params: ParamsT;
};

export const organizadorRoutes = new Elysia({
  prefix: '/organizadores',
  detail: { tags: ['Organizadores'] },
})
.use(authMiddleware)
.post(
    '/',
    async (context: any) => {
        const { session, body } = context;
        const currentSession = requireAuth()(session);
        const organizador = await createOrganizadorService(currentSession.subAsNumber, body);
        return organizador;
    },
    {
        body: createOrganizadorSchema,
        response: {
            200: organizadorResponseSchema,
            401: errorResponseSchema,
            400: errorResponseSchema,
        },
    }
)
.get(
    '/yo',
    async (context: any) => {
        const { session } = context;
        const currentSession = requireAuth()(session);
        const organizador = await getOrganizadorByUserIdService(currentSession.subAsNumber);
        if (!organizador) {
            throw new CustomError("Organizador no encontrado", 404);
        }
        return organizador;
    },
    {
        response: {
            200: organizadorResponseSchema,
            401: errorResponseSchema,
            404: errorResponseSchema,
        },
    }
)
.get(
    '/:id',
    async ({ params }) => { 
        return await getOrganizadorByIdService(params.id);
    },
    {
        params: organizadorParamsSchema,
        response: { 200: organizadorResponseSchema, 404: errorResponseSchema, 500: errorResponseSchema },
        detail: { summary: 'Obtener Perfil de Organizador por ID' }
    }
)
.put(
    '/yo',
    async (context: any) => {
        const { session, body } = context;
        const currentSession = requireAuth()(session);
        const perfilOrganizadorActual = await getOrganizadorByUserIdService(currentSession.subAsNumber);
        if (!perfilOrganizadorActual) {
            throw new CustomError("Organizador no encontrado", 404);
        }
        const organizador = await updateOrganizadorService(perfilOrganizadorActual.id_organizador, body, currentSession);
        return organizador;
    },
    {
        body: updateOrganizadorSchema,
        response: {
            200: organizadorResponseSchema,
            401: errorResponseSchema,
            403: errorResponseSchema,
            404: errorResponseSchema,
            400: errorResponseSchema,
        },
    }
);

export const adminOrganizadorRoutes = new Elysia({
    prefix: '/admin/organizadores',
    detail: { tags: ['Admin - Organizadores'] },
})
.use(authMiddleware)
.patch(
    '/:id/acreditacion',
    async (context: any) => {
        const { params, body, session } = context;
        const currentSession = requireAuth()(session);
        if(currentSession.rol !== 1) {
            throw new CustomError("Acceso denegado. Se requiere rol de administrador.", 403);
        }
        return await updateAcreditacionOrganizadorService(Number(params.id), body.acreditado);
    },
    {
        params: organizadorParamsSchema,
        body: updateAcreditacionSchema,
        response: {
            200: organizadorResponseSchema,
            401: errorResponseSchema,
            403: errorResponseSchema,
            404: errorResponseSchema,
        },
    }
);