// src/modules/usuario/usuario.types.ts
import { t } from 'elysia';
import { rolUsuarioBaseSchema } from '../rolUsuario/rolUsuario.types'; // Asume que este exporta rolUsuarioBaseSchema

export const usuarioBaseResponseSchema = t.Object({
  id_usuario: t.Number(),
  correo: t.String({ format: 'email', description: "Correo electrónico del usuario" }),
  nombre_usuario: t.String({ description: "Nombre completo o de usuario" }),
  fecha_registro: t.String({ format: 'date-time', description: "Fecha de registro del usuario" }),
  sexo: t.Nullable(t.String({ minLength: 1, maxLength: 1, pattern: '^[MFO]$', description: "Sexo: M, F, O (Otro)" })),
  fecha_nacimiento: t.Nullable(t.String({ format: 'date-time', description: "Fecha de nacimiento" })),
  id_rol: t.Nullable(t.Number()),
  biografia: t.Nullable(t.String({ description: "Biografía o descripción personal del usuario" })),
  intereses: t.Nullable(t.Array(t.String(), { description: "Array de intereses o temas de interés" })),
  foto_perfil: t.Nullable(t.String({ description: "URL de la foto de perfil" })),
  telefono: t.Nullable(t.String({ pattern: '^\\+56 9 \\d{4} \\d{4}$', description: "Número de teléfono en formato +56 9 XXXX XXXX" })),
  ubicacion: t.Nullable(t.String({ maxLength: 100, description: "Ubicación o ciudad del usuario" })),
  rol: t.Nullable(t.Object({
    id_rol: t.Number(),
    nombre_rol: t.String()
  }))
});

export const registroUsuarioSchema = t.Object({
  nombre_usuario: t.String({ minLength: 3, maxLength: 100, examples: ['Juan Pérez'] }),
  correo: t.String({ format: 'email', examples: ['juan.perez@example.com'] }),
  contrasena: t.String({ minLength: 8 }),
  sexo: t.Optional(t.Nullable(t.String({ enum: ['M', 'F', 'O'] }))),
  fecha_nacimiento: t.Optional(t.Nullable(t.String({ format: 'date', description: "Formato YYYY-MM-DD" }))),
  biografia: t.Optional(t.Nullable(t.String())),
  intereses: t.Optional(t.Nullable(t.Array(t.String()))),
  foto_perfil: t.Optional(t.Nullable(t.String())),
});
export type RegistroUsuarioPayload = typeof registroUsuarioSchema.static;

export const loginUsuarioSchema = t.Object({
  correo: t.String({ format: 'email' }),
  contrasena: t.String(),
});
export type LoginUsuarioPayload = typeof loginUsuarioSchema.static;

export const loginResponseSchema = t.Object({
  accessToken: t.String(),
  refreshToken: t.String(),
  usuario: usuarioBaseResponseSchema
});

export const updateUsuarioPerfilSchema = t.Partial(t.Object({
  nombre_usuario: t.String({ minLength: 3, maxLength: 100 }),
  sexo: t.Nullable(t.String({ enum: ['M', 'F', 'O'] })),
  fecha_nacimiento: t.Nullable(t.String({ format: 'date' })),
  biografia: t.Nullable(t.String()),
  intereses: t.Nullable(t.Array(t.String())),
  foto_perfil: t.Nullable(t.String()),
  telefono: t.Nullable(t.String({ pattern: '^\\+56 9 \\d{4} \\d{4}$' })),
  ubicacion: t.Nullable(t.String({ maxLength: 100 })),
}));
export type UpdateUsuarioPerfilPayload = typeof updateUsuarioPerfilSchema.static;

export const updateContrasenaSchema = t.Object({
    contrasena_actual: t.String(),
    nueva_contrasena: t.String({ minLength: 8 })
});

export const usuarioParamsSchema = t.Object({
  id: t.Numeric({ minimum: 1, description: "ID numérico del usuario" })
});
export const usuariosResponseSchema = t.Array(usuarioBaseResponseSchema);

export const refreshTokenSchema = t.Object({
    refreshToken: t.String()
});
export const accessTokenResponseSchema = t.Object({
    accessToken: t.String()
});

export const errorResponseSchema = t.Object({
  error: t.String(),
  details: t.Optional(t.String({ description: "Detalles adicionales del error" }))
});