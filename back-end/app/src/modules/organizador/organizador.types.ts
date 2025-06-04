// src/modules/organizador/organizador.types.ts
import { t } from 'elysia';
import { usuarioBaseResponseSchema } from '../usuario/usuario.types';

export const organizadorBaseSchema = t.Object({
  id_organizador: t.Integer({ description: "ID único del perfil de organizador" }),
  id_usuario: t.Integer({ description: "ID del usuario asociado" }),
  nombre_organizacion: t.String({ description: "Nombre de la organización" }),
  descripcion: t.Nullable(t.String({ description: "Descripción de la organización" })),
  documento_acreditacion: t.Nullable(t.String({ format: 'uri', description: "URL al documento de acreditación almacenado" })), // La URL del documento ya subido
  acreditado: t.Boolean({ description: "Indica si el organizador está acreditado" }), // Cambiado a no nullable, default es false
  usuario: t.Optional(usuarioBaseResponseSchema)
});

// Schema para crear un perfil de organizador
export const createOrganizadorSchema = t.Object({
  nombre_organizacion: t.String({ 
    minLength: 3, 
    maxLength: 150, 
    description: "Nombre de la organización." 
  }),
  descripcion: t.Optional(t.Nullable(t.String({ maxLength: 500 }))),
  // Otros campos que el frontend envía como strings o JSON
  orgType: t.Optional(t.String()), // Ejemplo si envías tipo, rut, etc.
  orgRut: t.Optional(t.String()),
  orgPhone: t.Optional(t.String()),
  orgAddress: t.Optional(t.String()),
  orgSocialsJson: t.Optional(t.String({ description: "Redes sociales como JSON string" })), // Si las envías como stringified JSON
  
  // Campo para el archivo del documento de acreditación
  documento_acreditacion_file: t.Optional(t.File({
    type: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'], // Tipos de archivo permitidos
    maxSize: '5m' // Límite de tamaño, ej. 5MB
  }))
});
// El tipo CreateOrganizadorPayload se usará en el servicio.
// NO incluirá documento_acreditacion_url directamente si el archivo se sube.
export type CreateOrganizadorPayload = Omit<typeof createOrganizadorSchema.static, 'documento_acreditacion_file'> & {
    orgSocials?: Record<string, string> | null;
    documento_acreditacion_url?: string | null;
};


// Schema para actualizar un perfil de organizador
// La actualización de archivos es más compleja: podrías querer reemplazar, eliminar o no cambiar.
export const updateOrganizadorSchema = t.Partial(t.Object({
  nombre_organizacion: t.String({ minLength: 3, maxLength: 150 }),
  descripcion: t.Nullable(t.String({ maxLength: 500 })),
  orgType: t.Optional(t.String()),
  orgRut: t.Optional(t.String()),
  orgPhone: t.Optional(t.String()),
  orgAddress: t.Optional(t.String()),
  orgSocialsJson: t.Optional(t.String()),
  // Para la actualización del documento:
  // Opción 1: Enviar un nuevo archivo para reemplazar.
  // Opción 2: Enviar `null` para eliminar el documento existente.
  // Opción 3: No enviar nada para no cambiar el documento.
  documento_acreditacion_file: t.Optional(t.Union([
    t.File({
        type: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
        maxSize: '5m'
    }),
    t.Null() // Para indicar que se quiere borrar el documento existente
  ]))
}));
export type UpdateOrganizadorPayload = typeof updateOrganizadorSchema.static;


export const updateAcreditacionSchema = t.Object({
    acreditado: t.Boolean()
});

export const organizadorParamsSchema = t.Object({
  id: t.Numeric({ minimum: 1, description: "ID del organizador" })
});

export const organizadorResponseSchema = organizadorBaseSchema;
export const organizadoresResponseSchema = t.Array(organizadorResponseSchema);