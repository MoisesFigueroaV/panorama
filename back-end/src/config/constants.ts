// src/config/constants.ts
// Asegúrate de que estos IDs coincidan EXACTAMENTE con los de tu tabla `rol_usuario` en Supabase
export const ROLES_IDS = {
  ADMINISTRADOR: 1, // Ejemplo, ajusta a tu DB
  ORGANIZADOR: 2,   // Ejemplo, ajusta a tu DB
  USUARIO_COMUN: 3, // Ejemplo, ajusta a tu DB
} as const;

// Asegúrate de que estos IDs coincidan EXACTAMENTE con los de tu tabla `estado_acreditacion`
export const ESTADOS_ACREDITACION_IDS = {
  PENDIENTE: 1, // Ejemplo, ajusta a tu DB
  APROBADO: 2,  // Ejemplo, ajusta a tu DB
  // ... otros estados
} as const;