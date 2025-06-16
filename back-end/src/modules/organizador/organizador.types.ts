import { t } from 'elysia';

export const registroCompletoOrganizadorSchema = t.Object({
  nombre_usuario: t.String({ minLength: 3, maxLength: 100 }),
  correo: t.String({ format: 'email' }),
  contrasena: t.String({ minLength: 8 }),
  sexo: t.Optional(t.String({ enum: ['M', 'F', 'O'] })),
  fecha_nacimiento: t.Optional(t.String({ format: 'date' })),
  nombre_organizacion: t.String({ minLength: 3, maxLength: 150 }),
  descripcion: t.Optional(t.String()),
  documento_acreditacion: t.Optional(t.String()),
  ubicacion: t.Optional(t.String()),
  anio_fundacion: t.Optional(t.Integer()),
  sitio_web: t.Optional(t.String()),
  imagen_portada: t.Optional(t.String()),
  logo_organizacion: t.Optional(t.String())
});
export type RegistroCompletoOrganizadorApiPayload = typeof registroCompletoOrganizadorSchema.static;

export const createOrganizadorPerfilSchema = t.Object({
  nombre_organizacion: t.String({ minLength: 3, maxLength: 150 }),
  descripcion: t.Optional(t.String()),
  documento_acreditacion: t.Optional(t.String()),
  ubicacion: t.Optional(t.String()),
  anio_fundacion: t.Optional(t.Integer()),
  sitio_web: t.Optional(t.String()),
  imagen_portada: t.Optional(t.String()),
  logo_organizacion: t.Optional(t.String())
});
export type CreateOrganizadorPerfilApiPayload = typeof createOrganizadorPerfilSchema.static;

export const updateOrganizadorPerfilSchema = t.Partial(createOrganizadorPerfilSchema);
export type UpdateOrganizadorPerfilApiPayload = typeof updateOrganizadorPerfilSchema.static;

export const organizadorParamsSchema = t.Object({
  id: t.Numeric({ minimum: 1 })
});
