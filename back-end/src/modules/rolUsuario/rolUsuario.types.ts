// src/modules/rolUsuario/rolUsuario.types.ts
import { t } from 'elysia';
// No necesitamos importar de '@bazza/database/src/schema'
// porque nuestros tipos de Drizzle (RolUsuario, NewRolUsuario) ya están definidos
// en nuestros propios archivos de schema y se usarán directamente en el servicio.

// Schema base para la respuesta de un rol de usuario
// Refleja las columnas de la tabla rol_usuario
export const rolUsuarioBaseSchema = t.Object({
  id_rol: t.Integer({ description: "ID único del rol" }),
  nombre_rol: t.String({ description: "Nombre descriptivo del rol" }),
});

// Schema para crear un nuevo rol de usuario
// Solo necesitamos 'nombre_rol', ya que 'id_rol' es serial.
export const createRolUsuarioSchema = t.Object({
  nombre_rol: t.String({
    minLength: 3,
    maxLength: 50,
    examples: ['Administrador', 'Organizador', 'Usuario Común'],
    description: "Nombre único para el nuevo rol de usuario."
  }),
});

// Tipo TypeScript inferido del schema de Zod/Elysia para el payload de creación.
// Lo usamos en el servicio para el tipado del parámetro 'data'.
export type CreateRolUsuarioPayload = typeof createRolUsuarioSchema.static;

// Schema para actualizar un rol de usuario existente
// Todos los campos son opcionales.
export const updateRolUsuarioSchema = t.Partial(createRolUsuarioSchema);

// Tipo TypeScript inferido para el payload de actualización.
export type UpdateRolUsuarioPayload = typeof updateRolUsuarioSchema.static;

// Schema de respuesta para un solo rol de usuario (es igual al base)
export const rolUsuarioResponseSchema = rolUsuarioBaseSchema;

// Schema de respuesta para una lista de roles de usuario
export const rolesUsuarioResponseSchema = t.Array(rolUsuarioResponseSchema);

// Schema para los parámetros de ruta cuando se necesita un ID de rol
export const rolUsuarioParamsSchema = t.Object({
  id: t.Numeric({ minimum: 1, description: "Identificador numérico del rol de usuario" })
});

// Podríamos definir schemas de error comunes aquí o importarlos de utils
export const errorResponseSchema = t.Object({
    error: t.String(),
    details: t.Optional(t.Unknown())
});