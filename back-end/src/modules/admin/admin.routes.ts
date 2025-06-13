// src/modules/admin/admin.routes.ts
import Elysia, { t } from 'elysia';
import { authMiddleware, requireAuth, hasRole, type AppSession } from '../../middleware/auth.middleware';
import { ROLES_IDS } from '../../config/constants';
import * as adminServices from './admin.services';
import * as adminTypes from './admin.types';

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
    body: { id_estado_acreditacion: number, notas_admin?: string },
    session: AppSession 
  }) => {
    const adminId = (session as NonNullable<AppSession>).subAsNumber;
    return adminServices.updateAcreditationStatusService(
      params.id,
      body.id_estado_acreditacion,
      adminId,
      body.notas_admin ?? null
    );
  },
  { 
    params: t.Object({ id: t.Numeric() }),
    body: t.Object({ 
      id_estado_acreditacion: t.Numeric(),
      notas_admin: t.Optional(t.String())
    }),
    detail: { summary: 'Actualizar estado de acreditación de un organizador' }
  }
)

// --- Rutas de Gestión de Usuarios ---
.get('/users', 
  ({ query }: { query: { page?: number, pageSize?: number } }) => 
    adminServices.getAllUsersService(query.page, query.pageSize),
  { 
    query: t.Object({
      page: t.Optional(t.Numeric()),
      pageSize: t.Optional(t.Numeric())
    }),
    response: { 200: adminTypes.usersListResponseSchema },
    detail: { summary: 'Obtener lista paginada de usuarios' }
  }
);