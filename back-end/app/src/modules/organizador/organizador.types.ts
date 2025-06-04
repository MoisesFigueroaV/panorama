// src/modules/organizador/organizador.types.ts
import { t } from 'elysia';
import { usuarioBaseResponseSchema } from '../usuario/usuario.types'; // Para anidar info del usuario

// Schema base para la respuesta de un organizador
export const organizadorBaseSchema = t.Object({
  id_organizador: t.Integer({ description: "ID único del perfil de organizador" }),
  id_usuario: t.Integer({ description: "ID del usuario asociado" }),
  nombre_organizacion: t.String({ description: "Nombre de la organización o del organizador" }),
  descripcion: t.Nullable(t.String({ description: "Descripción de la organización" })),
  documento_acreditacion: t.Nullable(t.String({ format: 'uri', description: "URL al documento de acreditación" })),
  acreditado: t.Nullable(t.Boolean({ description: "Indica si el organizador está acreditado" })),
  // Opcional: Incluir datos del usuario si se hace un JOIN
  usuario: t.Optional(usuarioBaseResponseSchema)
});

// Schema para crear un perfil de organizador
// Asumimos que el id_usuario vendrá del usuario autenticado (session.subAsNumber)
export const createOrganizadorSchema = t.Object({
  nombre_organizacion: t.String({ 
    minLength: 3, 
    maxLength: 150, 
    description: "Nombre de la organización. Debe ser único si así lo decides en la lógica." 
  }),
  descripcion: t.Optional(t.Nullable(t.String({ maxLength: 500 }))),
  // documento_acreditacion_file: t.Optional(t.File(...)) // Si permites subir archivo al crear
  documento_acreditacion_url: t.Optional(t.Nullable(t.String({ format: 'uri' }))),
});
export type CreateOrganizadorPayload = typeof createOrganizadorSchema.static;

// Schema para actualizar un perfil de organizador
export const updateOrganizadorSchema = t.Partial(t.Intersect([
    createOrganizadorSchema, // Hereda campos de creación como opcionales
    t.Object({
        // `acreditado` solo lo podría cambiar un admin, no el propio organizador usualmente.
        // Lo omitimos aquí, se manejaría en una ruta de admin.
        // acreditado: t.Optional(t.Boolean())
    })
]));
export type UpdateOrganizadorPayload = typeof updateOrganizadorSchema.static;


// Schema para actualizar el estado de acreditación (para Admins)
export const updateAcreditacionSchema = t.Object({
    acreditado: t.Boolean()
});

// Parámetros de ruta para ID de organizador
export const organizadorParamsSchema = t.Object({
  id: t.Numeric({ minimum: 1, description: "ID del organizador" })
});

// Respuesta para un solo organizador
export const organizadorResponseSchema = organizadorBaseSchema;

// Respuesta para una lista de organizadores
export const organizadoresResponseSchema = t.Array(organizadorResponseSchema);

// (errorResponseSchema ya debería estar definido en otro .types.ts o en utils)
// import { errorResponseSchema } from '../../utils/types'; // Si lo tienes global