// src/modules/admin/admin.services.ts

import { db } from '../../db/drizzle';
import { usuarioTable, organizadorTable, eventoTable, historialEstadoAcreditacionTable } from '../../db/schema';
import { count, desc, eq, inArray, sql } from 'drizzle-orm';
import { CustomError, handleErrorLog } from '../../utils/errors';
import { ROLES_IDS, ESTADOS_ACREDITACION_IDS } from '../../config/constants';
import type { NewHistorialEstadoAcreditacion } from '../../db/schema';

// ===============================================
// TIPOS DE RESPUESTA PARA EL MÓDULO ADMIN
// ===============================================
// Mantener los tipos de respuesta aquí ayuda a desacoplar el servicio de los tipos de Elysia.

export type KpiServiceResponse = {
  totalUsuarios: number;
  totalOrganizadores: number;
  eventosActivos: number;
  solicitudesPendientes: number;
};

// Se pueden definir más tipos según se necesiten (ej. AdminOrganizadorDetallado, etc.)

// ===============================================
// SERVICIOS PARA EL DASHBOARD
// ===============================================

/**
 * Obtiene las estadísticas clave (KPIs) para el dashboard del admin.
 */
export async function getDashboardKpisService(): Promise<KpiServiceResponse> {
  try {
    const [userCount] = await db.select({ value: count() }).from(usuarioTable);
    const [organizerCount] = await db.select({ value: count() }).from(organizadorTable);
    const [pendingCount] = await db.select({ value: count() }).from(organizadorTable).where(eq(organizadorTable.id_estado_acreditacion_actual, ESTADOS_ACREDITACION_IDS.PENDIENTE));
    
    // Suponiendo que 'eventos activos' significa eventos publicados (ej. id_estado_evento = 3)
    // const [activeEventsCount] = await db.select({ value: count() }).from(eventoTable).where(eq(eventoTable.id_estado_evento, 3));
    
    return {
      totalUsuarios: userCount.value,
      totalOrganizadores: organizerCount.value,
      solicitudesPendientes: pendingCount.value,
      eventosActivos: 0, // Reemplazar con activeEventsCount.value cuando se implementen estados de evento
    };
  } catch (error) {
    handleErrorLog(error, 'servicio getDashboardKpisService');
    throw new CustomError('Error al obtener los KPIs del dashboard.', 500);
  }
}

// ===============================================
// SERVICIOS PARA GESTIÓN DE ORGANIZADORES
// ===============================================

/**
 * Obtiene una lista de todos los organizadores con su estado actual de acreditación.
 */
export async function getAllOrganizersService() {
  try {
    const organizers = await db.query.organizadorTable.findMany({
      with: {
        usuario: { columns: { nombre_usuario: true, correo: true, fecha_registro: true } },
        estadoAcreditacionActual: { columns: { nombre_estado: true } }
      },
      orderBy: [desc(organizadorTable.id_organizador)],
    });
    return organizers;
  } catch (error) {
    handleErrorLog(error, 'servicio getAllOrganizersService');
    throw new CustomError('Error al obtener la lista de organizadores.', 500);
  }
}

/**
 * Aprueba o rechaza la acreditación de un organizador, actualizando su estado y registrando el cambio en el historial.
 * (Esta es la lógica que antes estaba en `organizador.service.ts`, ahora centralizada aquí)
 */
export async function updateAcreditationStatusService(
  organizadorId: number,
  nuevoEstadoId: number,
  adminUserId: number,
  notasAdmin: string | null
): Promise<{ id_organizador: number; id_estado_acreditacion_actual: number }> {
    return db.transaction(async (tx) => {
        const [updatedOrganizador] = await tx.update(organizadorTable)
            .set({
                id_estado_acreditacion_actual: nuevoEstadoId,
                acreditado: nuevoEstadoId === ESTADOS_ACREDITACION_IDS.APROBADO,
            })
            .where(eq(organizadorTable.id_organizador, organizadorId))
            .returning({ id_organizador: organizadorTable.id_organizador, id_estado_acreditacion_actual: organizadorTable.id_estado_acreditacion_actual });
        
        if (!updatedOrganizador) {
            throw new CustomError(`Organizador con ID ${organizadorId} no encontrado.`, 404);
        }

        const newHistorial: NewHistorialEstadoAcreditacion = {
            id_organizador: organizadorId,
            id_estado_acreditacion: nuevoEstadoId,
            id_admin_responsable: adminUserId,
            notas_cambio: notasAdmin,
            // fecha_cambio se setea por defecto en la DB
        };
        await tx.insert(historialEstadoAcreditacionTable).values(newHistorial);

        return updatedOrganizador;
    });
}


// ===============================================
// SERVICIOS PARA GESTIÓN DE USUARIOS
// ===============================================

/**
 * Obtiene una lista paginada de todos los usuarios (excluyendo otros administradores).
 */
export async function getAllUsersService(page: number = 1, pageSize: number = 10) {
    try {
        const usersFromDb = await db.query.usuarioTable.findMany({
            where: sql`${usuarioTable.id_rol} != ${ROLES_IDS.ADMINISTRADOR}`,
            columns: { contrasena: false }, // ¡Nunca devolver la contraseña!
            with: { rol: true },
            orderBy: [desc(usuarioTable.fecha_registro)],
            limit: pageSize,
            offset: (page - 1) * pageSize,
        });

        const usersForApi = usersFromDb.map(user => ({
            ...user,
            fecha_registro: new Date(user.fecha_registro),
            fecha_nacimiento: user.fecha_nacimiento ? new Date(user.fecha_nacimiento) : null,   
        }));

        return usersForApi;
    }catch(error) {
        handleErrorLog(error, 'servicio getAllUsersService');
        throw new CustomError('Error al obtener la lista de usuarios.', 500);
    }

}
