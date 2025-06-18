// src/modules/organizador/organizador.types.ts
import { t } from 'elysia';

// Schema para el registro "todo en uno" de un organizador
export const registroCompletoOrganizadorSchema = t.Object({
  // Campos de usuario
  nombre_usuario: t.String({ minLength: 3, maxLength: 100 }),
  correo: t.String({ format: 'email' }),
  contrasena: t.String({ minLength: 8 }),
  sexo: t.Optional(t.Nullable(t.String({ enum: ['M', 'F', 'O'] }))),
  fecha_nacimiento: t.Optional(t.Nullable(t.String({ format: 'date' }))),
  
  // Campos de organizador
  nombre_organizacion: t.String({ minLength: 3, maxLength: 150 }),
  tipo_organizacion: t.String({ maxLength: 50 }),
  rut_organizacion: t.String({ maxLength: 20 }),
  descripcion: t.Optional(t.Nullable(t.String())),
  telefono_organizacion: t.Optional(t.Nullable(t.String({ maxLength: 20 }))),
  ubicacion: t.Optional(t.Nullable(t.String({ maxLength: 250 }))),
  anio_fundacion: t.Optional(t.Nullable(t.String())),
  sitio_web: t.Optional(t.Nullable(t.String({ format: 'url' }))),
  redes_sociales: t.Optional(t.Nullable(t.String())), // JSON string con array de redes sociales
  documento_acreditacion_file: t.Optional(t.Any()), // Cambiado a Any para manejar FormData
});

export type RegistroCompletoOrganizadorApiPayload = typeof registroCompletoOrganizadorSchema.static;

// Schema para cuando un usuario ya autenticado crea su perfil de organizador
export const createOrganizadorPerfilSchema = t.Object({
  nombre_organizacion: t.String({ minLength: 3, maxLength: 150 }),
  tipo_organizacion: t.String({ maxLength: 50 }),
  rut_organizacion: t.String({ maxLength: 20 }),
  descripcion: t.Optional(t.Nullable(t.String())),
  telefono_organizacion: t.Optional(t.Nullable(t.String({ maxLength: 20 }))),
  ubicacion: t.Optional(t.Nullable(t.String({ maxLength: 250 }))),
  anio_fundacion: t.Optional(t.Nullable(t.String())),
  sitio_web: t.Optional(t.Nullable(t.String({ format: 'url' }))),
  redes_sociales: t.Optional(t.Nullable(t.String())), // JSON string
  documento_acreditacion_file: t.Optional(t.Any()), // Cambiado a Any
});

export type CreateOrganizadorPerfilApiPayload = typeof createOrganizadorPerfilSchema.static;

// Schema para actualizar un perfil de organizador (por el propio organizador)
export const updateOrganizadorPerfilSchema = t.Partial(t.Object({
  nombre_organizacion: t.String({ minLength: 3, maxLength: 150 }),
  tipo_organizacion: t.String({ maxLength: 50 }),
  rut_organizacion: t.String({ maxLength: 20 }),
  descripcion: t.Nullable(t.String()),
  telefono_organizacion: t.Nullable(t.String({ maxLength: 20 })),
  ubicacion: t.Nullable(t.String({ maxLength: 250 })),
  anio_fundacion: t.Nullable(t.String()),
  sitio_web: t.Nullable(t.String({ format: 'url' })),
  redes_sociales: t.Nullable(t.String()), // JSON string
  documento_acreditacion_file: t.Optional(t.Any()), // Cambiado a Any
}));

export type UpdateOrganizadorPerfilApiPayload = typeof updateOrganizadorPerfilSchema.static;

// Parámetros de ruta
export const organizadorParamsSchema = t.Object({
  id: t.Numeric({ minimum: 1, description: "ID del organizador" })
});