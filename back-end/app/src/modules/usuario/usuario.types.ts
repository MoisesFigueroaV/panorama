// src/modules/usuario/usuario.types.ts
import { t } from 'elysia';
import { rolUsuarioBaseSchema } from '../rolUsuario/rolUsuario.types'; // Para incluir info del rol

// Schema base para la respuesta de un usuario (NUNCA incluir la contraseña)
export const usuarioBaseResponseSchema = t.Object({
  id_usuario: t.Integer({ description: "ID único del usuario" }),
  correo: t.String({ format: 'email', description: "Correo electrónico del usuario" }),
  nombre_usuario: t.String({ description: "Nombre completo o de usuario" }),
  fecha_registro: t.Date({ description: "Fecha de registro del usuario" }),
  sexo: t.Nullable(t.String({ minLength: 1, maxLength: 1, pattern: '^[MFO]$', description: "Sexo: M, F, O (Otro)" })),
  fecha_nacimiento: t.Nullable(t.Date({ description: "Fecha de nacimiento" })),
  // Opcional: Incluir información del rol si hacemos un JOIN en el servicio
  rol: t.Optional(t.Nullable(rolUsuarioBaseSchema)),
  // Opcional: Podríamos añadir un campo para saber si es organizador
  // es_organizador: t.Optional(t.Boolean())
});

// Schema para el registro de un nuevo usuario
export const registroUsuarioSchema = t.Object({
  nombre_usuario: t.String({
    minLength: 3,
    maxLength: 100,
    examples: ['Juan Pérez'],
    description: "Nombre del nuevo usuario."
  }),
  correo: t.String({
    format: 'email',
    examples: ['juan.perez@example.com'],
    description: "Correo electrónico único para el registro."
  }),
  contrasena: t.String({
    minLength: 8,
    // Considera añadir un pattern para complejidad si es necesario:
    // pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    description: "Contraseña (mínimo 8 caracteres)."
  }),
  // El rol se asignará internamente o se tomará de un campo separado si el usuario elige
  // id_rol: t.Optional(t.Integer({ description: "ID del rol a asignar (ej. Usuario Común)"})),
  sexo: t.Optional(t.Nullable(t.String({ enum: ['M', 'F', 'O'] }))),
  fecha_nacimiento: t.Optional(t.Nullable(t.String({ format: 'date', description: "YYYY-MM-DD" }))),
  // Para el registro de organizador, podríamos tener campos adicionales aquí o un endpoint separado
  // es_organizador: t.Optional(t.Boolean({ default: false })),
  // nombre_organizacion: t.Optional(t.String({maxLength: 150 })),
  // descripcion_organizacion: t.Optional(t.String({maxLength: 500 })),
});
export type RegistroUsuarioPayload = typeof registroUsuarioSchema.static;


// Schema para el inicio de sesión
export const loginUsuarioSchema = t.Object({
  correo: t.String({ format: 'email', description: "Correo electrónico del usuario." }),
  contrasena: t.String({ description: "Contraseña del usuario." }),
});
export type LoginUsuarioPayload = typeof loginUsuarioSchema.static;

// Schema para la respuesta del inicio de sesión (tokens + info del usuario)
export const loginResponseSchema = t.Object({
  accessToken: t.String({ description: "Token JWT de acceso" }),
  refreshToken: t.String({ description: "Token JWT de refresco" }),
  usuario: usuarioBaseResponseSchema,
});

// Schema para actualizar el perfil de un usuario (datos que el propio usuario puede cambiar)
export const updateUsuarioPerfilSchema = t.Partial(t.Object({
  nombre_usuario: t.String({ minLength: 3, maxLength: 100 }),
  // correo: t.String({ format: 'email' }), // Actualizar correo puede requerir verificación
  sexo: t.Nullable(t.String({ enum: ['M', 'F', 'O'] })),
  fecha_nacimiento: t.Nullable(t.String({ format: 'date' })),
}));
export type UpdateUsuarioPerfilPayload = typeof updateUsuarioPerfilSchema.static;

// Schema para actualizar la contraseña
export const updateContrasenaSchema = t.Object({
    contrasena_actual: t.String(),
    nueva_contrasena: t.String({ minLength: 8 })
});

// Schema para los parámetros de ruta cuando se necesita un ID de usuario
export const usuarioParamsSchema = t.Object({
  id: t.Numeric({ minimum: 1, description: "Identificador numérico del usuario" })
});

// Schema para la respuesta de un solo usuario
export const usuarioResponseSchema = usuarioBaseResponseSchema;

// Schema para la respuesta de una lista de usuarios
export const usuariosResponseSchema = t.Array(usuarioResponseSchema);

// Schema para el refresh token
export const refreshTokenSchema = t.Object({
    refreshToken: t.String({ description: "El token de refresco JWT" })
});
export const accessTokenResponseSchema = t.Object({
    accessToken: t.String({ description: "Nuevo token JWT de acceso" })
});

export const errorResponseSchema = t.Object({
  error: t.String(),
  details: t.Optional(t.String()),
});