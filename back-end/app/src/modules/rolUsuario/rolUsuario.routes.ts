// src/modules/rolUsuario/rolUsuario.routes.ts
import Elysia, { t } from 'elysia';
import { authMiddleware, hasRole } from '../../middleware/auth.middleware'; // Asumimos que 'session' y 'hasRole' vienen de aquí
import { SwaggerResponses } from '../../utils/swagger'; // Nuestro helper de Swagger
import {
  createRol,
  deleteRol,
  getRolById,
  getAllRoles,
  updateRol,
} from './rolUsuario.services'; // Nuestros servicios renombrados
import {
  createRolUsuarioSchema,
  rolUsuarioResponseSchema,
  rolesUsuarioResponseSchema,
  updateRolUsuarioSchema,
  rolUsuarioParamsSchema,
  errorResponseSchema, // Para documentar errores
} from './rolUsuario.types'; // Nuestros schemas de Zod/Elysia

// Asumamos que tenemos constantes para los IDs de roles si los usamos para autorización
// const ADMIN_ROLE_ID = 1; // Ejemplo

export const rolUsuarioRoutes = new Elysia({
  prefix: '/roles-usuario', // Cambiamos el prefijo
  detail: {
    tags: ['Roles de Usuario'], // Tag para Swagger
  },
})
  // Descomenta y adapta si ciertas rutas o todo el módulo requieren autenticación/roles
  // .use(authMiddleware) // Aplica a todo el módulo
  // .onBeforeHandle(async (context) => { // Ejemplo de guard a nivel de módulo
  //   if (!context.session?.userId) throw new CustomError('Autenticación requerida', 401);
  //   if (!hasRole([ADMIN_ROLE_ID])(context)) { // Solo admins pueden gestionar roles
  //      throw new CustomError('Acceso denegado', 403);
  //   }
  // })
  .post(
    '/', // Ruta POST a /roles-usuario
    async ({ body, set }) => {
      // `session` vendría del authMiddleware si está en uso y configurado en derive
      // const rol = await createRol(body, session?.organizationId); // No necesitamos organizationId aquí
      const rol = await createRol(body);
      set.status = 201; // HTTP 201 Created
      return rol;
    },
    {
      body: createRolUsuarioSchema,
      response: { // Para Elysia: validación/tipado del caso de éxito y errores
        201: rolUsuarioResponseSchema,
        400: errorResponseSchema, // Para errores de validación de Elysia
        409: errorResponseSchema, // Para conflicto (nombre duplicado)
        500: errorResponseSchema, // Para error interno del servidor
      },
      detail: { // Para Swagger: documentación completa
        summary: 'Crear un nuevo Rol de Usuario',
        description: 'Crea un nuevo rol de usuario en el sistema. El nombre debe ser único.',
        // responses: SwaggerResponses(rolUsuarioResponseSchema, 201), // Puedes usar tu helper
        // requestBody: { // Elysia infiere esto de `body`, pero puedes ser explícito
        //   content: { 'application/json': { schema: createRolUsuarioSchema } }
        // }
        // security: [{ bearerAuth: [] }] // Si esta ruta específica requiere autenticación
      },
    },
  )
  .get(
    '/', // Ruta GET a /roles-usuario
    async () => {
      const roles = await getAllRoles();
      return roles;
    },
    {
      response: {
        200: rolesUsuarioResponseSchema,
        500: errorResponseSchema,
      },
      detail: {
        summary: 'Obtener todos los Roles de Usuario',
        description: 'Recupera una lista de todos los roles de usuario disponibles.',
        // responses: SwaggerResponses(rolesUsuarioResponseSchema),
      },
    },
  )
  .get(
    '/:id', // Ruta GET a /roles-usuario/:id
    async ({ params }) => { // `session` no es necesario aquí a menos que filtres por organización
      const rol = await getRolById(params.id);
      return rol;
    },
    {
      params: rolUsuarioParamsSchema,
      response: {
        200: rolUsuarioResponseSchema,
        404: errorResponseSchema, // No encontrado
        500: errorResponseSchema,
      },
      detail: {
        summary: 'Obtener un Rol de Usuario por ID',
        description: 'Recupera un rol de usuario específico por su ID numérico.',
        // responses: SwaggerResponses(rolUsuarioResponseSchema),
      },
    },
  )
  .put(
    '/:id', // Ruta PUT a /roles-usuario/:id
    async ({ params, body }) => {
      const rol = await updateRol(params.id, body);
      return rol;
    },
    {
      params: rolUsuarioParamsSchema,
      body: updateRolUsuarioSchema,
      response: {
        200: rolUsuarioResponseSchema,
        400: errorResponseSchema,
        404: errorResponseSchema,
        409: errorResponseSchema,
        500: errorResponseSchema,
      },
      detail: {
        summary: 'Actualizar un Rol de Usuario',
        description: 'Modifica un rol de usuario existente.',
        // responses: SwaggerResponses(rolUsuarioResponseSchema),
        // requestBody: { content: { 'application/json': { schema: updateRolUsuarioSchema }}},
        // security: [{ bearerAuth: [] }]
      },
    },
  )
  .delete(
    '/:id', // Ruta DELETE a /roles-usuario/:id
    async ({ params, set }) => {
      const result = await deleteRol(params.id);
      // Para DELETE, puedes no devolver contenido (204) o un mensaje (200)
      set.status = 200; // O 204 si no devuelves 'result'
      return result; // Devuelve { message: "..." }
    },
    {
      params: rolUsuarioParamsSchema,
      response: {
        200: t.Object({ message: t.String() }), // Si devuelves un mensaje
        // 204: t.Void(), // Si es un 204 No Content
        404: errorResponseSchema,
        500: errorResponseSchema,
      },
      detail: {
        summary: 'Eliminar un Rol de Usuario',
        description: 'Elimina un rol de usuario por su ID.',
        // responses: SwaggerResponses(t.Object({ message: t.String() })),
        // security: [{ bearerAuth: [] }]
      },
    },
  );