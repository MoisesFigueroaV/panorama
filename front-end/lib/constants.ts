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

// Rutas por rol
export const ROUTES_BY_ROLE = {
  [ROLES.ADMINISTRADOR]: '/admin',
  [ROLES.ORGANIZADOR]: '/organizers/dashboard',
  [ROLES.USUARIO]: '/users/profile'
} as const; 