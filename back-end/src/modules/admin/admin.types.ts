// src/modules/admin/admin.types.ts
import { t } from 'elysia';

// Schema para KPIs
export const kpisResponseSchema = t.Object({
    totalUsuarios: t.Integer(),
    totalOrganizadores: t.Integer(),
    solicitudesPendientes: t.Integer(),
    eventosActivos: t.Integer(),
});

// Schema para la lista de organizadores
export const adminOrganizerSchema = t.Object({
    id_organizador: t.Integer(),
    nombre_organizacion: t.String(),
    descripcion: t.Nullable(t.String()),
    documento_acreditacion: t.Nullable(t.String()),
    acreditado: t.Boolean(),
    ubicacion: t.Nullable(t.String()),
    anio_fundacion: t.Nullable(t.Integer()),
    sitio_web: t.Nullable(t.String()),
    imagen_portada: t.Nullable(t.String()),
    logo_organizacion: t.Nullable(t.String()),
    id_usuario: t.Integer(),
    usuario: t.Nullable(t.Object({
        nombre_usuario: t.String(),
        correo: t.String(),
        fecha_registro: t.String({ format: 'date-time' })
    })),
    estadoAcreditacionActual: t.Nullable(t.Object({
        nombre_estado: t.String()
    }))
});
export const organizersListResponseSchema = t.Array(adminOrganizerSchema);

// Schema para actualizar acreditación
export const updateAcreditationSchema = t.Object({ /* ... */ });

// Schema para la lista de usuarios
export const adminUserSchema = t.Object({
    id_usuario: t.Integer(),
    nombre_usuario: t.String(),
    correo: t.String(),
    fecha_registro: t.String({ format: 'date-time' }),
    fecha_nacimiento: t.Nullable(t.String({ format: 'date-time' })),
    id_rol: t.Nullable(t.Integer()),
    sexo: t.Nullable(t.String()),
    rol: t.Nullable(t.Object({
        id_rol: t.Integer(),
        nombre_rol: t.String()
    }))
});

export const usersListResponseSchema = t.Object({
    users: t.Array(adminUserSchema),
    total: t.Integer(),
    page: t.Integer(),
    pageSize: t.Integer()
});

// Schemas de paginación y parámetros
export const paginationQuerySchema = t.Object({ /* ... */ });
export const idParamsSchema = t.Object({ /* ... */ });