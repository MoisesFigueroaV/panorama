// src/modules/admin/admin.services.ts

import { db } from '../../db/drizzle';
import { usuarioTable, organizadorTable, historialEstadoAcreditacionTable, rolUsuarioTable } from '../../db/schema';
import { count, desc, eq, sql } from 'drizzle-orm';
import { CustomError, handleErrorLog } from '../../utils/errors';
import { ROLES_IDS, ESTADOS_ACREDITACION_IDS } from '../../config/constants';
import type { NewHistorialEstadoAcreditacion } from '../../db/schema';

// ===============================================
// TIPOS DE RESPUESTA PARA EL MÓDULO ADMIN
// (Es una buena práctica definirlos aquí para mantener los servicios desacoplados)
// ===============================================

export type KpiServiceResponse = {
  totalUsuarios: number;
  totalOrganizadores: number;
  eventosActivos: number; // Placeholder por ahora
  solicitudesPendientes: number;
};

// ===============================================
// SERVICIOS PARA EL DASHBOARD
// ===============================================

/**
 * Obtiene las estadísticas clave (KPIs) para el dashboard del admin.
 */
export async function getDashboardKpisService(): Promise<KpiServiceResponse> {
  try {
    const [userCount] = await db
      .select({ value: count() })
      .from(usuarioTable)
      .where(sql`${usuarioTable.id_rol} != ${ROLES_IDS.ADMINISTRADOR}`);

    const [organizerCount] = await db
      .select({ value: count() })
      .from(organizadorTable);
    
    // Esta consulta ahora es simple y rápida gracias a la columna optimizada.
    const [pendingCount] = await db
      .select({ value: count() })
      .from(organizadorTable)
      .where(eq(organizadorTable.id_estado_acreditacion_actual, ESTADOS_ACREDITACION_IDS.PENDIENTE));
    
    return {
      totalUsuarios: userCount.value,
      totalOrganizadores: organizerCount.value,
      solicitudesPendientes: pendingCount.value,
      eventosActivos: 0, // Placeholder hasta que se implemente la lógica de eventos
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
 * Obtiene una lista de todos los organizadores con su usuario y estado de acreditación.
 * Esta es la forma eficiente y correcta de hacerlo con Drizzle y la DB optimizada.
 */
export async function getAllOrganizersService() {
  try {
    // UNA SOLA CONSULTA, ULTRA RÁPIDA gracias a la nueva estructura y las relaciones.
    const organizers = await db.query.organizadorTable.findMany({
      with: {
        usuario: {
          columns: {
            nombre_usuario: true,
            correo: true,
            fecha_registro: true
          }
        },
        estadoAcreditacionActual: { // <-- Esto ahora funciona gracias a los cambios
          columns: {
            nombre_estado: true
          }
        }
      },
      orderBy: [desc(organizadorTable.id_organizador)],
    });

    // Mapeamos para asegurar que el formato de fecha sea consistente para la API (string ISO)
    return organizers.map(org => ({
      ...org,
      acreditado: org.acreditado ?? false,
      usuario: org.usuario ? {
        ...org.usuario,
        fecha_registro: new Date(org.usuario.fecha_registro).toISOString()
      } : null,
    }));
  } catch (error) {
    handleErrorLog(error, 'servicio getAllOrganizersService');
    throw new CustomError('Error al obtener la lista de organizadores.', 500);
  }
}

/**
 * Aprueba o rechaza la acreditación de un organizador.
 */
export async function updateAcreditationStatusService(organizadorId: number, nuevoEstadoId: number, adminUserId: number, notasAdmin: string | null) {
  return db.transaction(async (tx) => {
    // 1. Actualizamos el estado actual en la tabla principal del organizador
    const [updatedOrganizador] = await tx
      .update(organizadorTable)
      .set({
        id_estado_acreditacion_actual: nuevoEstadoId, // <-- Actualizamos el "atajo"
        acreditado: nuevoEstadoId === ESTADOS_ACREDITACION_IDS.APROBADO,
      })
      .where(eq(organizadorTable.id_organizador, organizadorId))
      .returning({ id: organizadorTable.id_organizador });
    
    if (!updatedOrganizador) {
      throw new CustomError(`Organizador con ID ${organizadorId} no encontrado.`, 404);
    }

    // 2. Insertamos un registro en el historial para auditoría (el porqué del cambio)
    const newHistorial: NewHistorialEstadoAcreditacion = {
      id_organizador: organizadorId,
      id_estado_acreditacion: nuevoEstadoId,
      id_admin_responsable: adminUserId, // <-- Usamos la nueva columna
      notas_cambio: notasAdmin,         // <-- Usamos la nueva columna
    };
    await tx.insert(historialEstadoAcreditacionTable).values(newHistorial);

    return { message: "Estado de acreditación actualizado correctamente." };
  });
}


// ===============================================
// SERVICIOS PARA GESTIÓN DE USUARIOS
// ===============================================

/**
 * Obtiene una lista paginada de todos los usuarios (excluyendo administradores y organizadores).
 */
export async function getAllUsersService(page: number = 1, pageSize: number = 10) {
  try {
    const whereClause = sql`${usuarioTable.id_rol} NOT IN (${ROLES_IDS.ADMINISTRADOR}, ${ROLES_IDS.ORGANIZADOR})`;

    // Obtenemos el total de usuarios para la paginación
    const [{ value: totalUsers }] = await db
      .select({ value: count() })
      .from(usuarioTable)
      .where(whereClause);

    // Obtenemos los usuarios de la página actual
    const usersFromDb = await db.query.usuarioTable.findMany({
        where: whereClause,
        columns: { contrasena: false },
        with: { rol: true },
        orderBy: [desc(usuarioTable.fecha_registro)],
        limit: pageSize,
        offset: (page - 1) * pageSize,
    });

    return {
      users: usersFromDb.map(user => ({
        ...user,
        fecha_registro: new Date(user.fecha_registro).toISOString(),
        fecha_nacimiento: user.fecha_nacimiento ? new Date(user.fecha_nacimiento).toISOString() : null,
      })),
      total: totalUsers,
      page,
      pageSize,
    };
  } catch (error) {
    handleErrorLog(error, 'servicio getAllUsersService');
    throw new CustomError('Error al obtener la lista de usuarios.', 500);
  }
}