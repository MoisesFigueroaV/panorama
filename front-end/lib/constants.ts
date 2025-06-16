// Roles del sistema
export const ROLES = {
  ADMINISTRADOR: 1,
  ORGANIZADOR: 2,
  USUARIO: 3
} as const;

// Estados de acreditación
export const ESTADOS_ACREDITACION = {
  PENDIENTE: 1,
  APROBADO: 2
} as const;

// Rutas por rol (usar esta constante para redirecciones)
export const ROUTES_BY_ROLE = {
  [ROLES.ADMINISTRADOR]: '/admin',
  [ROLES.ORGANIZADOR]: '/organizer/dashboard',
  [ROLES.USUARIO]: '/users/profile'
} as const;

// IDs de roles de usuario (mantener por compatibilidad)
export const ROLES_IDS = {
  ADMINISTRADOR: 1,
  ORGANIZADOR: 2,
  USUARIO_COMUN: 3,
} as const;

// IDs de estados de acreditación
export const ESTADOS_ACREDITACION_IDS = {
  PENDIENTE: 1,
  APROBADO: 2,
  RECHAZADO: 3,
} as const; 