// src/modules/organizador/organizador.routes.ts
import Elysia, { t } from 'elysia';
import { authMiddleware, requireAuth } from '../../middleware/auth.middleware';
import {
  registrarUsuarioYCrearPerfilOrganizadorService,
  crearPerfilOrganizadorService,
  getOrganizadorByIdService,
  getOrganizadorByUserIdService,
  updateOrganizadorPerfilService
} from './organizador.services';
import {
  registroCompletoOrganizadorSchema,
  createOrganizadorPerfilSchema,
  updateOrganizadorPerfilSchema,
  organizadorParamsSchema
} from './organizador.types';

/** 
 * 1️⃣ REGISTRO COMPLETO - Público (usuario nuevo + organizador)
 */
export const authOrganizadorRoutes = new Elysia({ prefix: '/auth' })
  .post(
    '/registro-organizador',
    async ({ body, set }) => {
      const result = await registrarUsuarioYCrearPerfilOrganizadorService(body);
      const organizador = await getOrganizadorByIdService(result.id_organizador);
      set.status = 201;
      return organizador;
    },
    {
      body: registroCompletoOrganizadorSchema,
      detail: {
        tags: ['Autenticación'],
        summary: 'Registrar nuevo Organizador',
        description: 'Registro inicial para nuevos organizadores. Crea usuario + perfil de organización en un único paso.'
      }
    }
  );

/** 
 * 2️⃣ CRUD PERSONAL - Organizador autenticado
 */
export const organizadorUsuarioRoutes = new Elysia({ prefix: '/organizadores' })
  .use(authMiddleware)
  .post(
    '/',
    async ({ session, body, set }) => {
      const currentSession = requireAuth()(session);
      const result = await crearPerfilOrganizadorService(currentSession.subAsNumber, body);
      const organizador = await getOrganizadorByIdService(result.id_organizador);
      set.status = 201;
      return organizador;
    },
    {
      body: createOrganizadorPerfilSchema,
      detail: {
        tags: ['Organizadores'],
        summary: 'Crear mi perfil de Organizador',
        description: 'Permite crear el perfil de organizador para usuarios previamente registrados.'
      }
    }
  )
  .get(
    '/yo',
    async ({ session }) => {
      const currentSession = requireAuth()(session);
      return await getOrganizadorByUserIdService(currentSession.subAsNumber);
    },
    {
      detail: {
        tags: ['Organizadores'],
        summary: 'Ver mi perfil de Organizador',
        description: 'Consulta el perfil de organizador vinculado a tu cuenta actual.'
      }
    }
  )
  .put(
    '/yo',
    async ({ session, body }) => {
      const currentSession = requireAuth()(session);
      const organizador = await getOrganizadorByUserIdService(currentSession.subAsNumber);
      return await updateOrganizadorPerfilService(organizador.id_organizador, body, currentSession);
    },
    {
      body: updateOrganizadorPerfilSchema,
      detail: {
        tags: ['Organizadores'],
        summary: 'Actualizar mi perfil de Organizador',
        description: 'Permite actualizar los datos de tu perfil de organización.'
      }
    }
  );

/** 
 * 3️⃣ CONSULTA PÚBLICA - Ver organizadores por ID
 */
export const publicOrganizadorRoutes = new Elysia({ prefix: '/organizadores' })
  .get(
    '/:id',
    async ({ params }) => await getOrganizadorByIdService(params.id),
    {
      params: organizadorParamsSchema,
      detail: {
        tags: ['Organizadores'],
        summary: 'Consultar organizador público',
        description: 'Consulta pública de perfiles de organizadores mediante su ID.'
      }
    }
  );
