// src/modules/organizador/organizador.routes.ts
import Elysia, { t, type Static } from 'elysia';
import {
  authMiddleware,
  requireAuth,
} from '../../middleware/auth.middleware';
import { CustomError } from '../../utils/errors';
import {
  registrarUsuarioYCrearPerfilOrganizadorService,
  crearPerfilOrganizadorService,
  getOrganizadorByIdService,
  getOrganizadorByUserIdService,
  updateOrganizadorPerfilService,
} from './organizador.services';
import {
  registroCompletoOrganizadorSchema,
  createOrganizadorPerfilSchema,
  updateOrganizadorPerfilSchema,
  organizadorParamsSchema,
} from './organizador.types';

// Rutas para que los usuarios autenticados gestionen SU perfil de organizador
export const organizadorUsuarioRoutes = new Elysia({
  prefix: '/organizadores',
  detail: { tags: ['Organizadores'] },
})
.use(authMiddleware)
.post(
  '/', 
  async ({ body, session, set }) => {
    const currentSession = requireAuth()(session);
    const resultadoCreacion = await crearPerfilOrganizadorService(currentSession.subAsNumber, body);
    const organizadorCompleto = await getOrganizadorByIdService(resultadoCreacion.id_organizador);
    set.status = 201;
    return organizadorCompleto;
  },
  {
    body: createOrganizadorPerfilSchema,
    detail: {
      summary: 'Crear o Completar mi Perfil de Organizador',
      description: 'Permite a un usuario autenticado crear su perfil de organizador.',
      security: [{ bearerAuth: [] }]
    }
  }
)
.get(
  '/yo',
  async ({ session }) => {
    const currentSession = requireAuth()(session);
    const organizador = await getOrganizadorByUserIdService(currentSession.subAsNumber);
    if (!organizador) {
      throw new CustomError('No tienes un perfil de organizador asociado.', 404);
    }
    return organizador;
  },
  {
    detail: { summary: 'Obtener mi Perfil de Organizador', security: [{ bearerAuth: [] }] }
  }
)
.put(
  '/yo',
  async ({ session, body }) => {
    const currentSession = requireAuth()(session);
    const perfilOrganizadorActual = await getOrganizadorByUserIdService(currentSession.subAsNumber);
    if (!perfilOrganizadorActual) {
      throw new CustomError('No se encontró tu perfil de organizador para actualizar.', 404);
    }
    const organizador = await updateOrganizadorPerfilService(perfilOrganizadorActual.id_organizador, body, currentSession);
    return organizador;
  },
  {
    body: updateOrganizadorPerfilSchema,
    detail: {
      summary: 'Actualizar mi Perfil de Organizador',
      security: [{ bearerAuth: [] }]
    }
  }
);

// Rutas públicas para ver organizadores
export const publicOrganizadorRoutes = new Elysia({
  prefix: '/organizadores',
  detail: { tags: ['Organizadores'] }
})
.get(
  '/:id',
  async ({ params }) => {
    return await getOrganizadorByIdService(params.id);
  },
  {
    params: organizadorParamsSchema,
    detail: { summary: 'Obtener Perfil Público de Organizador por ID' }
  }
);

// Endpoint público para el registro "todo en uno" de un organizador
export const authOrganizadorRoutes = new Elysia({
  prefix: '/auth',
  detail: { tags: ['Autenticación'] }
})
.post(
  '/registro-organizador',
  async ({ body, set }) => {
    const resultadoRegistro = await registrarUsuarioYCrearPerfilOrganizadorService(body);
    const organizadorCompleto = await getOrganizadorByIdService(resultadoRegistro.id_organizador);
    set.status = 201;
    return organizadorCompleto;
  },
  {
    body: registroCompletoOrganizadorSchema,
    detail: {
      summary: 'Registrar Nuevo Organizador (Cuenta + Perfil)',
      description: 'Crea una cuenta de usuario y su perfil de organización asociado.',
    }
  }
);