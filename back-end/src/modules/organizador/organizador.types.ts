// src/modules/organizador/organizador.types.ts
import { t } from 'elysia';

// Schema para el registro "todo en uno" de un organizador
export const registroCompletoOrganizadorSchema = t.Object({
  // ... (sin cambios)
});
export type RegistroCompletoOrganizadorApiPayload = typeof registroCompletoOrganizadorSchema.static;

// Schema para cuando un usuario ya autenticado crea su perfil de organizador
export const createOrganizadorPerfilSchema = t.Object({
  // ... (sin cambios)
});
export type CreateOrganizadorPerfilApiPayload = typeof createOrganizadorPerfilSchema.static;

// Schema para actualizar un perfil de organizador (por el propio organizador)
export const updateOrganizadorPerfilSchema = t.Partial(t.Object({
  // ... (sin cambios)
}));
export type UpdateOrganizadorPerfilApiPayload = typeof updateOrganizadorPerfilSchema.static;

// Parámetros de ruta
export const organizadorParamsSchema = t.Object({
  id: t.Numeric({ minimum: 1, description: "ID del organizador" })
});