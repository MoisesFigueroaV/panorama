import Elysia, { t } from 'elysia';
import { authMiddleware, requireAuth } from '../../middleware/auth.middleware';
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

/* ==========================================================
   1️⃣ Registro inicial (cuenta + perfil organizador) - Público
   ========================================================== */

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
        summary: 'Registro completo de Organizador',
        description: 'Permite crear una cuenta de usuario y su perfil de organizador en un solo paso (registro inicial).'
      }
    }
  );

/* ==========================================================
   2️⃣ Perfil de Organizador - Gestión propia (requiere autenticación)
   ========================================================== */

export const organizadorUsuarioRoutes = new Elysia({ prefix: '/organizadores' })
  .use(authMiddleware)

  // Crear perfil de organizador (cuando el usuario ya tiene cuenta)
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
        description: 'Permite a un usuario autenticado crear su perfil de organizador (solo perfil, no cuenta).'
      }
    }
  )

  // Consultar perfil personal de organizador
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
        description: 'Obtiene el perfil de organizador asociado al usuario autenticado.'
      }
    }
  )

  // Actualizar perfil personal de organizador
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
        description: 'Permite modificar los datos del perfil de organizador (requiere login).'
      }
    }
  );

/* ==========================================================
   3️⃣ Visualización pública de perfiles de organizadores
   ========================================================== */

export const publicOrganizadorRoutes = new Elysia({ prefix: '/organizadores' })
  .get(
    '/:id',
    async ({ params }) => await getOrganizadorByIdService(params.id),
    {
      params: organizadorParamsSchema,
      detail: {
        tags: ['Organizadores'],
        summary: 'Consultar perfil público de Organizador',
        description: 'Permite visualizar información pública de un organizador por su ID.'
      }
    }
  );
