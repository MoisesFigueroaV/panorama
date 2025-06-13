// src/modules/organizador/organizador.services.ts
import { db } from '../../db/drizzle';
import {
  organizadorTable,
  type Organizador as DrizzleOrganizador,
  type NewOrganizador as NewDrizzleOrganizador,
  usuarioTable,
  type NewUsuario as NewDrizzleUsuario,
  historialEstadoAcreditacionTable,
  type NewHistorialEstadoAcreditacion,
} from '../../db/schema';
import { ROLES_IDS, ESTADOS_ACREDITACION_IDS } from '../../config/constants';
import { eq, desc } from 'drizzle-orm';
import { CustomError, handleErrorLog } from '../../utils/errors';
import type {
    RegistroCompletoOrganizadorApiPayload,
    CreateOrganizadorPerfilApiPayload,
    UpdateOrganizadorPerfilApiPayload,
} from './organizador.types';
import type { AppSession } from '../../middleware/auth.middleware';

// Aquí irían las funciones REALES de subida de archivos a Supabase Storage
async function uploadDocumentoAcreditacion(file: File): Promise<string> {
    console.warn(`SIMULANDO subida para: ${file.name}`);
    return `https://fake-storage.com/docs/${Date.now()}_${file.name}`;
}
async function deleteDocumentoAcreditacion(url: string | null): Promise<void> {
    if (url) console.warn(`SIMULANDO borrado para: ${url}`);
}

// Helper para hashear contraseñas (debería ser el mismo que en usuario.service.ts)
async function hashUserPassword(password: string): Promise<string> {
    console.warn("SEGURIDAD: Usando hashing de contraseña placeholder.");
    return `${password}`;
}

export type OrganizadorDetalladoResponse = DrizzleOrganizador & {
    usuario?: {
        id_usuario: number;
        correo: string;
        nombre_usuario: string;
    };
    estadoAcreditacionActual: typeof historialEstadoAcreditacionTable.$inferSelect | null;
};

export async function registrarUsuarioYCrearPerfilOrganizadorService(data: RegistroCompletoOrganizadorApiPayload): Promise<{ id_organizador: number }> {
    // ... (Tu lógica de registrarUsuarioYCrearPerfilOrganizadorService sin cambios)
    // ...
    return { id_organizador: 1 }; // Placeholder
}

export async function crearPerfilOrganizadorService(userId: number, data: CreateOrganizadorPerfilApiPayload): Promise<{ id_organizador: number }> {
    // ... (Tu lógica de crearPerfilOrganizadorService sin cambios)
    // ...
    return { id_organizador: 1 }; // Placeholder
}

export async function getOrganizadorByIdService(organizadorId: number): Promise<OrganizadorDetalladoResponse> {
    const [organizadorData] = await db
        .select({
            organizador: organizadorTable,
            usuario: usuarioTable,
            ultimoEstado: historialEstadoAcreditacionTable
        })
        .from(organizadorTable)
        .leftJoin(usuarioTable, eq(organizadorTable.id_usuario, usuarioTable.id_usuario))
        .leftJoin(
            historialEstadoAcreditacionTable,
            eq(organizadorTable.id_organizador, historialEstadoAcreditacionTable.id_organizador)
        )
        .where(eq(organizadorTable.id_organizador, organizadorId))
        .orderBy(desc(historialEstadoAcreditacionTable.fecha_cambio))
        .limit(1);

    if (!organizadorData) {
        throw new CustomError(`Organizador con ID ${organizadorId} no encontrado.`, 404);
    }

    const { organizador, usuario, ultimoEstado } = organizadorData;
    return {
        ...organizador,
        usuario: usuario ? {
            id_usuario: usuario.id_usuario,
            correo: usuario.correo,
            nombre_usuario: usuario.nombre_usuario
        } : undefined,
        estadoAcreditacionActual: ultimoEstado || null
    };
}

export async function getOrganizadorByUserIdService(userId: number): Promise<OrganizadorDetalladoResponse> {
    const [organizadorData] = await db
        .select({
            organizador: organizadorTable,
            usuario: usuarioTable,
            ultimoEstado: historialEstadoAcreditacionTable
        })
        .from(organizadorTable)
        .leftJoin(usuarioTable, eq(organizadorTable.id_usuario, usuarioTable.id_usuario))
        .leftJoin(
            historialEstadoAcreditacionTable,
            eq(organizadorTable.id_organizador, historialEstadoAcreditacionTable.id_organizador)
        )
        .where(eq(organizadorTable.id_usuario, userId))
        .orderBy(desc(historialEstadoAcreditacionTable.fecha_cambio))
        .limit(1);

    if (!organizadorData) {
        throw new CustomError(`Perfil de organizador para el usuario ID ${userId} no encontrado.`, 404);
    }

    const { organizador, usuario, ultimoEstado } = organizadorData;
    return {
        ...organizador,
        usuario: usuario ? {
            id_usuario: usuario.id_usuario,
            correo: usuario.correo,
            nombre_usuario: usuario.nombre_usuario
        } : undefined,
        estadoAcreditacionActual: ultimoEstado || null
    };
}

export async function updateOrganizadorPerfilService(organizadorId: number, data: UpdateOrganizadorPerfilApiPayload, session: NonNullable<AppSession>): Promise<OrganizadorDetalladoResponse> {
    // ... (Tu lógica de updateOrganizadorPerfilService sin cambios)
    // ...
    return getOrganizadorByIdService(organizadorId);
}