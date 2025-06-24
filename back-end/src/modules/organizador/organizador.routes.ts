// src/modules/organizador/organizador.routes.ts
import Elysia, { t } from 'elysia';
import { authMiddleware, requireAuth } from '../../middleware/auth.middleware';
import {
  registrarUsuarioYCrearPerfilOrganizadorService,
  crearPerfilOrganizadorService,
  getOrganizadorByIdService,
  getOrganizadorByUserIdService,
<<<<<<< HEAD
  updateOrganizadorPerfilService,
  getOrganizadorPublicProfileService,
  updateOrganizadorPublicProfileService,
  getOrganizadoresVerificadosService,
=======
  updateOrganizadorPerfilService
>>>>>>> 9b16e0e8aaf80a7553ef750cce933980284339e5
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
<<<<<<< HEAD
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
)
/**
 * Verificar si el usuario tiene perfil de organizador
 */
.get(
  '/yo/check-profile',
  async (context) => {
    const currentSession = requireAuth()(context.session);
    
    try {
      const organizador = await getOrganizadorByUserIdService(currentSession.subAsNumber);
      return { 
        hasProfile: true, 
        organizador: {
          id_organizador: organizador.id_organizador,
          nombre_organizacion: organizador.nombre_organizacion,
          estado_acreditacion: organizador.id_estado_acreditacion_actual || 0
        }
      };
    } catch (error) {
      if (error instanceof CustomError && error.status === 404) {
        return { hasProfile: false, organizador: null };
      }
      throw error;
    }
  },
  {
    response: { 
      200: t.Object({
        hasProfile: t.Boolean(),
        organizador: t.Union([
          t.Object({
            id_organizador: t.Number(),
            nombre_organizacion: t.String(),
            estado_acreditacion: t.Number()
          }),
          t.Null()
        ])
      })
    },
    detail: { summary: 'Verificar si el usuario tiene perfil de organizador', security: [{ bearerAuth: [] }] }
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
=======
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
>>>>>>> 9b16e0e8aaf80a7553ef750cce933980284339e5
