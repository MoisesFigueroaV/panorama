// src/modules/organizador/organizador.routes.ts
import Elysia, { t, type Static } from 'elysia';
import {
  authMiddleware,
  requireAuth,
  hasRole,
  type AppSession
} from '../../middleware/auth.middleware';
import { CustomError } from '../../utils/errors';
import {
  registrarUsuarioYCrearPerfilOrganizadorService,
  crearPerfilOrganizadorService,
  getOrganizadorByIdService,
  getOrganizadorByUserIdService,
  updateOrganizadorPerfilService,
  adminUpdateAcreditacionService,
} from './organizador.services';
import {
  registroCompletoOrganizadorSchema,
  createOrganizadorPerfilSchema,
  updateOrganizadorPerfilSchema,
  organizadorResponseSchema,
  organizadorParamsSchema,
  adminUpdateAcreditacionSchema,
  crearOrganizadorResponseSchema,
} from './organizador.types';
import { errorResponseSchema } from '../usuario/usuario.types';

const ADMIN_ROLE_ID = 1;

// Rutas para que los usuarios autenticados gestionen SU perfil de organizador
export const organizadorUsuarioRoutes = new Elysia({
  prefix: '/organizadores',
  detail: { tags: ['Organizadores - Perfil'] },
})
.use(authMiddleware) // Aplica el middleware para tener `session`, `jwtAccess`, `jwtRefresh`
.post(
  '/', // POST /api/v1/organizadores
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
      description: 'Permite a un usuario autenticado crear su perfil de organizador. Se requiere autenticación. Si se incluye `documento_acreditacion_file`, enviar como multipart/form-data.',
      security: [{ bearerAuth: [] }]
    }
  }
)
.get(
  '/yo', // GET /api/v1/organizadores/yo
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
  '/yo', // PUT /api/v1/organizadores/yo
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
      description: 'Modifica el perfil de organizador del usuario autenticado. Para cambiar el documento, envía `documento_acreditacion_file`. Para eliminarlo, envía `documento_acreditacion_file` como `null` (si el schema lo permite y el servicio lo maneja).',
      security: [{ bearerAuth: [] }]
    }
  }
);

// Rutas públicas para ver organizadores
export const publicOrganizadorRoutes = new Elysia({
  prefix: '/organizadores',
  detail: { tags: ['Organizadores - Público'] }
})
.get(
  '/:id', // GET /api/v1/organizadores/:id
  async ({ params }) => {
    return await getOrganizadorByIdService(params.id);
  },
  {
    params: organizadorParamsSchema,
    detail: { summary: 'Obtener Perfil Público de Organizador por ID' }
  }
);

// Rutas de Admin para gestionar organizadores
export const adminOrganizadorRoutes = new Elysia({
  prefix: '/admin/organizadores',
  detail: { tags: ['Admin - Organizadores'] },
})
.use(authMiddleware)
.patch(
  '/:id/acreditacion', // PATCH /api/v1/admin/organizadores/:id/acreditacion
  async ({ params, body, session }) => {
    const currentSession = requireAuth()(session);
    hasRole([ADMIN_ROLE_ID])(currentSession); // Solo Admin

    const resultadoUpdate = await adminUpdateAcreditacionService(
      params.id,
      body.id_estado_acreditacion,
      body.notas_admin || null,
      currentSession.subAsNumber
    );
    const organizadorCompleto = await getOrganizadorByIdService(resultadoUpdate.id_organizador);
    return organizadorCompleto;
  },
  {
    params: organizadorParamsSchema,
    body: adminUpdateAcreditacionSchema,
    detail: {
      summary: 'Actualizar Estado de Acreditación de Organizador (Admin)',
      security: [{ bearerAuth: [] }]
    }
  }
);

// Endpoint para el registro "todo en uno" de un organizador (público)
export const authOrganizadorRoutes = new Elysia({
  prefix: '/auth', // Se monta bajo /api/v1/auth
  detail: { tags: ['Autenticación'] }
})
.post(
  '/registro-organizador', // POST /api/v1/auth/registro-organizador
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
      description: 'Crea una cuenta de usuario (con rol Organizador) y su perfil de organización asociado. Enviar como multipart/form-data si se incluye `documento_acreditacion_file`.',
    }
  }
);