// src/modules/organizador/organizador.types.ts
import { t } from 'elysia';
import { usuarioBaseResponseSchema } from '../usuario/usuario.types'; // Para anidar info del usuario

// Schema para el payload de la petición POST /api/v1/auth/registro-organizador
// Este es el que tu frontend enviará con FormData
export const registroCompletoOrganizadorSchema = t.Object({
  // Datos del Usuario Contacto
  nombre_usuario_contacto: t.String({ minLength: 3, maxLength: 100 }),
  correo: t.String({ format: 'email' }),
  contrasena: t.String({ minLength: 8 }),
  sexo_contacto: t.Optional(t.Nullable(t.String({ enum: ['M', 'F', 'O'] }))),
  fecha_nacimiento_contacto: t.Optional(t.Nullable(t.String({ format: 'date' }))),

  // Datos de la Organización
  nombre_organizacion: t.String({ minLength: 3, maxLength: 150 }),
  descripcion_organizacion: t.Optional(t.Nullable(t.String({ maxLength: 1000 }))), // Aumentado
  tipo_organizacion: t.String(), // Frontend envía el valor seleccionado
  rut_organizacion: t.String(), // Validar formato en servicio si es necesario
  telefono_organizacion: t.Optional(t.Nullable(t.String({ maxLength: 25 }))),
  direccion_organizacion: t.Optional(t.Nullable(t.String({ maxLength: 250 }))),
  redes_sociales_json: t.Optional(t.Nullable(t.String({ description: "Array de redes sociales como string JSON" }))),
  
  documento_acreditacion_file: t.Optional(t.File({
    type: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    maxSize: '5m' // Límite de 5MB
  }))
});
// Tipo TypeScript para el payload que el servicio registrarUsuarioYOrganizadorService recibirá
export type RegistroCompletoOrganizadorApiPayload = typeof registroCompletoOrganizadorSchema.static;


// Schema base para la respuesta de un organizador (lo que la API devuelve)
export const organizadorBaseResponseSchema = t.Object({
  id_organizador: t.Integer(),
  id_usuario: t.Integer(),
  nombre_organizacion: t.String(),
  descripcion: t.Nullable(t.String()),
  documento_acreditacion: t.Nullable(t.String({ format: 'uri' })),
  acreditado: t.Boolean(),
  id_estado_acreditacion_actual: t.Integer(), // Debería estar presente
  // Opcional: Incluir nombre del estado y datos del usuario
  nombre_estado_acreditacion: t.Optional(t.String()),
  usuario: t.Optional(usuarioBaseResponseSchema)
});

// Schema para la respuesta al crear un organizador (puede ser el mismo que el base)
export const crearOrganizadorResponseSchema = organizadorBaseResponseSchema;


// Schema para cuando un usuario YA AUTENTICADO crea/completa su perfil de organizador
export const createOrganizadorPerfilSchema = t.Object({
  nombre_organizacion: t.String({ minLength: 3, maxLength: 150 }),
  descripcion_organizacion: t.Optional(t.Nullable(t.String({ maxLength: 1000 }))),
  tipo_organizacion: t.String(),
  rut_organizacion: t.String(),
  telefono_organizacion: t.Optional(t.Nullable(t.String())),
  direccion_organizacion: t.Optional(t.Nullable(t.String())),
  redes_sociales_json: t.Optional(t.Nullable(t.String())),
  documento_acreditacion_file: t.Optional(t.File({
    type: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    maxSize: '5m'
  }))
});
export type CreateOrganizadorPerfilApiPayload = typeof createOrganizadorPerfilSchema.static;


// Schema para actualizar un perfil de organizador (por el propio organizador)
export const updateOrganizadorPerfilSchema = t.Partial(t.Object({ // Campos que el organizador puede editar
  nombre_organizacion: t.String({ minLength: 3, maxLength: 150 }),
  descripcion_organizacion: t.Nullable(t.String({ maxLength: 1000 })),
  tipo_organizacion: t.String(),
  rut_organizacion: t.String(), // ¿Puede cambiar el RUT?
  telefono_organizacion: t.Nullable(t.String()),
  direccion_organizacion: t.Nullable(t.String()),
  redes_sociales_json: t.Nullable(t.String()),
  documento_acreditacion_file: t.Optional(t.Union([ // Permite reemplazar o eliminar
    t.File({ type: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'], maxSize: '5m' }),
    t.Null() // Para indicar que se quiere borrar el documento
  ]))
}));
export type UpdateOrganizadorPerfilApiPayload = typeof updateOrganizadorPerfilSchema.static;


// Schema para que un Admin actualice el estado de acreditación
export const adminUpdateAcreditacionSchema = t.Object({
    id_estado_acreditacion: t.Integer({ description: "Nuevo ID del estado de acreditación (ej. 1=Pendiente, 2=Aprobado)" }),
    notas_admin: t.Optional(t.String({ description: "Notas del administrador sobre el cambio de estado", maxLength: 255 }))
});

// Parámetros de ruta
export const organizadorParamsSchema = t.Object({
  id: t.Numeric({ minimum: 1, description: "ID del organizador" })
});

// Respuesta
export const organizadorResponseSchema = organizadorBaseResponseSchema;
export const organizadoresResponseSchema = t.Array(organizadorBaseResponseSchema);