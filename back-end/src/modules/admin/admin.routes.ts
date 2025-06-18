// src/modules/admin/admin.routes.ts
import Elysia, { t } from 'elysia';
import { authMiddleware, requireAuth, hasRole, type AppSession } from '../../middleware/auth.middleware';
import { ROLES_IDS } from '../../config/constants';
import * as adminServices from './admin.services';
import * as adminTypes from './admin.types';
import { getAllEventosForAdminService, updateEventoEstadoByAdminService, getEventosWithFiltersService, getEventosFilterOptionsService } from '../evento/evento.services';
import { initializeEventStatesService } from './admin.services';
import { publishTestEventsService } from './admin.services';

export const adminRoutes = new Elysia({
  prefix: '/admin',
  detail: { tags: ['Admin'] },
})
.use(authMiddleware)
.onBeforeHandle(({ session }) => {
  const currentSession = requireAuth()(session);
  hasRole([ROLES_IDS.ADMINISTRADOR])(currentSession);
})

// --- Rutas del Dashboard ---
.get('/dashboard/kpis', 
  () => adminServices.getDashboardKpisService(),
  { response: { 200: adminTypes.kpisResponseSchema },
    detail: { summary: 'Obtener KPIs para el Dashboard' }
  }
)
.post('/dashboard/initialize-events', 
  () => initializeEventStatesService(),
  { response: { 200: t.Object({ message: t.String() }) },
    detail: { summary: 'Inicializar estados de eventos' }
  }
)
.post('/dashboard/publish-test-events', 
  () => publishTestEventsService(),
  { response: { 200: t.Object({ message: t.String() }) },
    detail: { summary: 'Publicar eventos de prueba' }
  }
)

// --- Rutas de Gestión de Organizadores ---
.get('/organizers', 
  () => adminServices.getAllOrganizersService(),
  { response: { 200: adminTypes.organizersListResponseSchema },
    detail: { summary: 'Obtener lista de todos los organizadores' }
  }
)
.patch('/organizers/:id/acreditation', 
  ({ params, body, session }: { 
    params: { id: number }, 
    body: { id_estado_acreditacion: number, notas_admin: string | null },
    session: AppSession 
  }) => {
    const adminId = (session as NonNullable<AppSession>).subAsNumber;
    return adminServices.updateAcreditationStatusService(
      params.id,
      body.id_estado_acreditacion,
      adminId,
      body.notas_admin
    );
  },
  { 
    params: t.Object({ id: t.Numeric() }),
    body: t.Object({ 
      id_estado_acreditacion: t.Numeric(),
      notas_admin: t.Union([t.String(), t.Null()])
    }),
    detail: { summary: 'Actualizar estado de acreditación de un organizador' }
  }
)

// --- Rutas de Gestión de Usuarios ---
.get('/users', 
  () => adminServices.getAllUsersService(),
  { response: { 200: adminTypes.usersListResponseSchema },
    detail: { summary: 'Obtener lista de todos los usuarios' }
  }
)

// --- Rutas de Gestión de Eventos ---
.get('/events', 
  ({ query }: { query: { 
    page?: string; 
    limit?: string; 
    search?: string; 
    estado?: string; 
    categoria?: string; 
    organizador?: string; 
    fechaDesde?: string; 
    fechaHasta?: string; 
    sortBy?: string; 
    sortOrder?: string; 
  }}) => {
    const params = {
      page: query.page ? parseInt(query.page) : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
      search: query.search,
      estado: query.estado ? parseInt(query.estado) : undefined,
      categoria: query.categoria ? parseInt(query.categoria) : undefined,
      organizador: query.organizador ? parseInt(query.organizador) : undefined,
      fechaDesde: query.fechaDesde,
      fechaHasta: query.fechaHasta,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder as 'asc' | 'desc' | undefined,
    };
    return getEventosWithFiltersService(params);
  },
  { 
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
      search: t.Optional(t.String()),
      estado: t.Optional(t.String()),
      categoria: t.Optional(t.String()),
      organizador: t.Optional(t.String()),
      fechaDesde: t.Optional(t.String()),
      fechaHasta: t.Optional(t.String()),
      sortBy: t.Optional(t.String()),
      sortOrder: t.Optional(t.String()),
    }),
    response: { 200: t.Object({
      eventos: t.Array(t.Object({
        id_evento: t.Number(),
        titulo: t.String(),
        descripcion: t.Union([t.String(), t.Null()]),
        fecha_inicio: t.String(),
        fecha_fin: t.String(),
        fecha_registro: t.Union([t.String(), t.Null()]),
        ubicacion: t.Union([t.String(), t.Null()]),
        imagen: t.Union([t.String(), t.Null()]),
        capacidad: t.Number(),
        id_estado_evento: t.Union([t.Number(), t.Null()]),
        id_categoria: t.Number(),
        id_organizador: t.Number(),
        latitud: t.Union([t.Number(), t.Null()]),
        longitud: t.Union([t.Number(), t.Null()]),
        nombre_organizacion: t.Union([t.String(), t.Null()]),
        nombre_categoria: t.Union([t.String(), t.Null()]),
        nombre_estado: t.Union([t.String(), t.Null()]),
      })),
      pagination: t.Object({
        page: t.Number(),
        limit: t.Number(),
        total: t.Number(),
        totalPages: t.Number(),
        hasNext: t.Boolean(),
        hasPrev: t.Boolean(),
      })
    }) },
    detail: { summary: 'Obtener lista de eventos con filtros y paginación' }
  }
)
.get('/events/filter-options', 
  () => getEventosFilterOptionsService(),
  { response: { 200: t.Object({
      categorias: t.Array(t.Object({
        id_categoria: t.Number(),
        nombre_categoria: t.String(),
      })),
      estados: t.Array(t.Object({
        id_estado_evento: t.Number(),
        nombre_estado: t.String(),
      })),
      organizadores: t.Array(t.Object({
        id_organizador: t.Number(),
        nombre_organizacion: t.String(),
      }))
    }) },
    detail: { summary: 'Obtener opciones de filtros para eventos' }
  }
)
.get('/events/all', 
  () => getAllEventosForAdminService(),
  { response: { 200: t.Array(t.Object({
      id_evento: t.Number(),
      titulo: t.String(),
      descripcion: t.Union([t.String(), t.Null()]),
      fecha_inicio: t.String(),
      fecha_fin: t.String(),
      fecha_registro: t.Union([t.String(), t.Null()]),
      ubicacion: t.Union([t.String(), t.Null()]),
      imagen: t.Union([t.String(), t.Null()]),
      capacidad: t.Number(),
      id_estado_evento: t.Union([t.Number(), t.Null()]),
      id_categoria: t.Number(),
      id_organizador: t.Number(),
      latitud: t.Union([t.Number(), t.Null()]),
      longitud: t.Union([t.Number(), t.Null()]),
      nombre_organizacion: t.Union([t.String(), t.Null()]),
      nombre_categoria: t.Union([t.String(), t.Null()]),
      nombre_estado: t.Union([t.String(), t.Null()]),
    })) },
    detail: { summary: 'Obtener lista de todos los eventos (sin paginación)' }
  }
)
.patch('/events/:id/status', 
  ({ params, body }: { 
    params: { id: number }, 
    body: { id_estado_evento: number }
  }) => {
    return updateEventoEstadoByAdminService(params.id, body.id_estado_evento);
  },
  { 
    params: t.Object({ id: t.Numeric() }),
    body: t.Object({ id_estado_evento: t.Numeric() }),
    detail: { summary: 'Cambiar estado de un evento' }
  }
)