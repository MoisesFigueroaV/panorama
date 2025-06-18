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
  getOrganizadorPublicProfileService,
  updateOrganizadorPublicProfileService,
  getOrganizadoresVerificadosService,
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
)
.get(
  '/yo/public-profile',
  async ({ session }) => {
    const currentSession = requireAuth()(session);
    const perfilOrganizadorActual = await getOrganizadorByUserIdService(currentSession.subAsNumber);
    if (!perfilOrganizadorActual) {
      throw new CustomError('No tienes un perfil de organizador asociado.', 404);
    }
    return await getOrganizadorPublicProfileService(perfilOrganizadorActual.id_organizador);
  },
  {
    detail: { 
      summary: 'Obtener mi Perfil Público de Organizador', 
      security: [{ bearerAuth: [] }] 
    }
  }
)
.put(
  '/yo/public-profile',
  async ({ session, body }) => {
    const currentSession = requireAuth()(session);
    const perfilOrganizadorActual = await getOrganizadorByUserIdService(currentSession.subAsNumber);
    if (!perfilOrganizadorActual) {
      throw new CustomError('No tienes un perfil de organizador asociado.', 404);
    }
    return await updateOrganizadorPublicProfileService(perfilOrganizadorActual.id_organizador, body);
  },
  {
    body: t.Object({
      nombre_organizacion: t.Optional(t.String()),
      descripcion: t.Optional(t.String()),
      ubicacion: t.Optional(t.String()),
      anio_fundacion: t.Optional(t.Number()),
      sitio_web: t.Optional(t.String()),
      imagen_portada: t.Optional(t.String()),
      logo_organizacion: t.Optional(t.String()),
      tipo_organizacion: t.Optional(t.String()),
      telefono_organizacion: t.Optional(t.String()),
      redes_sociales: t.Optional(t.Array(t.Object({
        plataforma: t.String(),
        url: t.String(),
      }))),
    }),
    detail: { 
      summary: 'Actualizar mi Perfil Público de Organizador', 
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
    return await getOrganizadorPublicProfileService(Number(params.id));
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

// Rutas públicas para organizadores verificados
export const publicOrganizadoresVerificadosRoutes = new Elysia({
  prefix: '/organizadores',
  detail: { tags: ['Organizadores Públicos'] }
})
.get(
  '/verificados',
  async ({ query }) => {
    const limit = query.limit ? parseInt(query.limit) : 3;
    return await getOrganizadoresVerificadosService(limit);
  },
  {
    query: t.Object({
      limit: t.Optional(t.String()),
    }),
    detail: { summary: 'Obtener organizadores verificados para la página principal' }
  }
);