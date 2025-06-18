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
  redSocialOrganizadorTable,
  type NewRedSocialOrganizador,
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
async function uploadDocumentoAcreditacion(file: any): Promise<string> {
    console.warn(`SIMULANDO subida para: ${file.name || file.filename || 'archivo'}`);
    return `https://fake-storage.com/docs/${Date.now()}_${file.name || file.filename || 'documento.pdf'}`;
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
    try {
        // Verificar si el usuario ya existe
        const existingUser = await db.query.usuarioTable.findFirst({
            where: eq(usuarioTable.correo, data.correo),
        });
        if (existingUser) {
            throw new CustomError('El correo electrónico ya está registrado.', 409);
        }

        // Hash de la contraseña
        const contrasenaHash = await hashUserPassword(data.contrasena);

        // Crear el usuario
        const [newUser] = await db
            .insert(usuarioTable)
            .values({
                nombre_usuario: data.nombre_usuario,
                correo: data.correo,
                contrasena: contrasenaHash,
                id_rol: ROLES_IDS.ORGANIZADOR, // Asignar rol de organizador
                sexo: data.sexo || null,
                fecha_nacimiento: data.fecha_nacimiento || null,
            })
            .returning({ id_usuario: usuarioTable.id_usuario });

        if (!newUser) {
            throw new CustomError('Error al crear el usuario.', 500);
        }

        // Procesar documento de acreditación si existe
        let documentoUrl = null;
        if (data.documento_acreditacion_file) {
            // El archivo puede venir como File o como objeto de FormData
            const file = data.documento_acreditacion_file as any;
            if (file && (file instanceof File || file.buffer || file.data)) {
                documentoUrl = await uploadDocumentoAcreditacion(file);
            }
        }

        // Crear el organizador
        const [newOrganizador] = await db
            .insert(organizadorTable)
            .values({
                id_usuario: newUser.id_usuario,
                nombre_organizacion: data.nombre_organizacion,
                tipo_organizacion: data.tipo_organizacion,
                rut_organizacion: data.rut_organizacion,
                descripcion: data.descripcion || null,
                telefono_organizacion: data.telefono_organizacion || null,
                ubicacion: data.ubicacion || null,
                anio_fundacion: data.anio_fundacion ? parseInt(data.anio_fundacion) : null,
                sitio_web: data.sitio_web || null,
                documento_acreditacion: documentoUrl,
                acreditado: false, // Por defecto no acreditado
                id_estado_acreditacion_actual: ESTADOS_ACREDITACION_IDS.PENDIENTE, // Estado inicial
            })
            .returning({ id_organizador: organizadorTable.id_organizador });

        if (!newOrganizador) {
            throw new CustomError('Error al crear el perfil de organizador.', 500);
        }

        // Procesar redes sociales si existen
        if (data.redes_sociales) {
            try {
                const redesSociales = JSON.parse(data.redes_sociales);
                if (Array.isArray(redesSociales) && redesSociales.length > 0) {
                    const redesParaInsertar: NewRedSocialOrganizador[] = redesSociales
                        .filter((red: any) => red.plataforma && red.url)
                        .map((red: any) => ({
                            id_organizador: newOrganizador.id_organizador,
                            plataforma: red.plataforma,
                            url: red.url,
                        }));

                    if (redesParaInsertar.length > 0) {
                        await db.insert(redSocialOrganizadorTable).values(redesParaInsertar);
                    }
                }
            } catch (error) {
                console.warn('Error al procesar redes sociales:', error);
                // No fallar el registro por errores en redes sociales
            }
        }

        // Crear historial de estado inicial (opcional, ya que el estado se maneja en la tabla principal)
        try {
            await db.insert(historialEstadoAcreditacionTable).values({
                id_organizador: newOrganizador.id_organizador,
                id_estado_acreditacion: ESTADOS_ACREDITACION_IDS.PENDIENTE,
                fecha_cambio: new Date().toISOString().split('T')[0], // Convertir a formato date
            });
        } catch (error) {
            console.warn('Error al crear historial de estado:', error);
            // No fallar el registro por errores en el historial
        }

        return { id_organizador: newOrganizador.id_organizador };
    } catch (error) {
        if (error instanceof CustomError) throw error;
        handleErrorLog(error, 'servicio registrarUsuarioYCrearPerfilOrganizadorService');
        throw new CustomError('Error interno durante el registro del organizador.', 500);
    }
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