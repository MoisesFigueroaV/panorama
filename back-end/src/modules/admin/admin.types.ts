// src/modules/admin/admin.types.ts
import { t } from 'elysia';

// Schema para la respuesta de los KPIs del Dashboard
export const kpisResponseSchema = t.Object({
  totalUsuarios: t.Integer(),
  totalOrganizadores: t.Integer(),
  solicitudesPendientes: t.Integer(),
  eventosActivos: t.Integer(),
});

// Schema para la respuesta de un organizador en las listas de admin
export const adminOrganizerSchema = t.Object({
    id_organizador: t.Integer(),
    nombre_organizacion: t.String(),
    acreditado: t.Boolean(),
    documento_acreditacion: t.Nullable(t.String()),
    usuario: t.Object({
        nombre_usuario: t.String(),
        correo: t.String(),
        fecha_registro: t.Date(),
    }),
    estadoAcreditacionActual: t.Nullable(t.Object({
        nombre_estado: t.String(),
    })),
});
export const organizersListResponseSchema = t.Array(adminOrganizerSchema);

// Schema para la petición de actualizar el estado de acreditación
export const updateAcreditationSchema = t.Object({
    id_estado_acreditacion: t.Integer({ description: "ID del nuevo estado (ej. 2 para Aprobado)" }),
    notas_admin: t.Optional(t.String({ description: "Notas del administrador sobre el cambio." }))
});

// Schema para la respuesta de un usuario en las listas de admin
export const adminUserSchema = t.Object({
    id_usuario: t.Integer(),
    nombre_usuario: t.String(),
    correo: t.String(),
    fecha_registro: t.Date(),
    rol: t.Nullable(t.Object({
        id_rol: t.Integer(),
        nombre_rol: t.String()
    }))
});
export const usersListResponseSchema = t.Array(adminUserSchema);

// Schema para los parámetros de paginación
export const paginationQuerySchema = t.Object({
    page: t.Optional(t.Numeric({ default: 1, minimum: 1 })),
    pageSize: t.Optional(t.Numeric({ default: 10, minimum: 1, maximum: 50 }))
});

// Parámetros de ruta genéricos
export const idParamsSchema = t.Object({
  id: t.Numeric({ minimum: 1 })
});