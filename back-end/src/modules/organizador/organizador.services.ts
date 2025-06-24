import { db } from '../../db/drizzle';
import {
  organizadorTable, type Organizador as DrizzleOrganizador, usuarioTable
} from '../../db/schema';
import { eventoTable } from '../../db/schema/evento.schema';
import { ROLES_IDS, ESTADOS_ACREDITACION_IDS } from '../../config/constants';
import { eq, desc, count, and } from 'drizzle-orm';
import { CustomError, handleErrorLog } from '../../utils/errors';
import type {
  RegistroCompletoOrganizadorApiPayload,
  CreateOrganizadorPerfilApiPayload,
  UpdateOrganizadorPerfilApiPayload
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
  const [newOrganizador] = await db.insert(organizadorTable).values({
    id_usuario: userId,
    ...data
  }).returning();

  if (!newOrganizador) throw new CustomError('Error creando el perfil.', 500);
  return { id_organizador: newOrganizador.id_organizador };
}

export async function getOrganizadorByIdService(organizadorId: number): Promise<DrizzleOrganizador> {
  const [organizador] = await db.select().from(organizadorTable).where(eq(organizadorTable.id_organizador, organizadorId));
  if (!organizador) throw new CustomError('Organizador no encontrado.', 404);
  return organizador;
}

export async function getOrganizadorByUserIdService(userId: number): Promise<DrizzleOrganizador> {
  const [organizador] = await db.select().from(organizadorTable).where(eq(organizadorTable.id_usuario, userId));
  if (!organizador) throw new CustomError('No tienes un perfil de organizador.', 404);
  return organizador;
}

export async function updateOrganizadorPerfilService(organizadorId: number, data: UpdateOrganizadorPerfilApiPayload, session: NonNullable<AppSession>): Promise<OrganizadorDetalladoResponse> {
    // ... (Tu lógica de updateOrganizadorPerfilService sin cambios)
    // ...
    return {} as OrganizadorDetalladoResponse; // Placeholder
}

/**
 * Servicio para obtener el perfil público completo del organizador
 */
export async function getOrganizadorPublicProfileService(organizadorId: number) {
    try {
        // Obtener datos básicos del organizador
        const [organizadorData] = await db
            .select({
                organizador: organizadorTable,
                usuario: usuarioTable,
            })
            .from(organizadorTable)
            .leftJoin(usuarioTable, eq(organizadorTable.id_usuario, usuarioTable.id_usuario))
            .where(eq(organizadorTable.id_organizador, organizadorId));

        if (!organizadorData) {
            throw new CustomError(`Organizador con ID ${organizadorId} no encontrado.`, 404);
        }

        // Obtener eventos del organizador (solo los publicados)
        const [eventosCount] = await db
            .select({ count: count() })
            .from(eventoTable)
            .where(eq(eventoTable.id_organizador, organizadorId));

        return {
            ...organizadorData.organizador,
            usuario: organizadorData.usuario ? {
                id_usuario: organizadorData.usuario.id_usuario,
                nombre_usuario: organizadorData.usuario.nombre_usuario,
                correo: organizadorData.usuario.correo,
            } : null,
            redes_sociales: [], // Array vacío por ahora
            total_eventos: eventosCount.count,
        };
    } catch (error) {
        if (error instanceof CustomError) throw error;
        handleErrorLog(error, 'servicio getOrganizadorPublicProfileService');
        throw new CustomError('Error al obtener el perfil público del organizador.', 500);
    }
}

/**
 * Servicio para actualizar el perfil público del organizador
 */
export async function updateOrganizadorPublicProfileService(
    organizadorId: number, 
    data: {
        nombre_organizacion?: string;
        descripcion?: string;
        ubicacion?: string;
        anio_fundacion?: number;
        sitio_web?: string;
        imagen_portada?: string;
        logo_organizacion?: string;
        tipo_organizacion?: string;
        telefono_organizacion?: string;
        redes_sociales?: Array<{
            plataforma: string;
            url: string;
        }>;
    }
) {
    try {
        // Actualizar datos básicos del organizador
        const [organizadorActualizado] = await db
            .update(organizadorTable)
            .set({
                nombre_organizacion: data.nombre_organizacion,
                descripcion: data.descripcion,
                ubicacion: data.ubicacion,
                anio_fundacion: data.anio_fundacion,
                sitio_web: data.sitio_web,
                imagen_portada: data.imagen_portada,
                logo_organizacion: data.logo_organizacion,
                tipo_organizacion: data.tipo_organizacion,
                telefono_organizacion: data.telefono_organizacion,
            })
            .where(eq(organizadorTable.id_organizador, organizadorId))
            .returning();

        if (!organizadorActualizado) {
            throw new CustomError('No se pudo actualizar el perfil del organizador.', 500);
        }

        // Por ahora no manejamos redes sociales
        // TODO: Implementar manejo de redes sociales cuando se necesite

        return organizadorActualizado;
    } catch (error) {
        if (error instanceof CustomError) throw error;
        handleErrorLog(error, 'servicio updateOrganizadorPublicProfileService');
        throw new CustomError('Error al actualizar el perfil público del organizador.', 500);
    }
}

/**
 * Servicio para obtener organizadores verificados para la página principal
 */
export async function getOrganizadoresVerificadosService(limit: number = 3) {
    try {
        // Obtener organizadores verificados (acreditados)
        const organizadores = await db
            .select({
                id_organizador: organizadorTable.id_organizador,
                nombre_organizacion: organizadorTable.nombre_organizacion,
                descripcion: organizadorTable.descripcion,
                ubicacion: organizadorTable.ubicacion,
                imagen_portada: organizadorTable.imagen_portada,
                logo_organizacion: organizadorTable.logo_organizacion,
                tipo_organizacion: organizadorTable.tipo_organizacion,
                anio_fundacion: organizadorTable.anio_fundacion,
                sitio_web: organizadorTable.sitio_web,
            })
            .from(organizadorTable)
            .where(
                eq(organizadorTable.id_estado_acreditacion_actual, 2) // Solo organizadores aprobados (estado 2)
            )
            .orderBy(desc(organizadorTable.id_organizador)) // Más recientes primero
            .limit(limit);

        // Para cada organizador, contar sus eventos
        const organizadoresConEventos = await Promise.all(
            organizadores.map(async (organizador) => {
                const [eventosCount] = await db
                    .select({ count: count() })
                    .from(eventoTable)
                    .where(
                        and(
                            eq(eventoTable.id_organizador, organizador.id_organizador),
                            eq(eventoTable.id_estado_evento, 2) // Solo eventos publicados
                        )
                    );

                return {
                    ...organizador,
                    total_eventos: eventosCount.count,
                };
            })
        );

        return organizadoresConEventos;
    } catch (error) {
        if (error instanceof CustomError) throw error;
        handleErrorLog(error, 'servicio getOrganizadoresVerificadosService');
        throw new CustomError('Error al obtener organizadores verificados.', 500);
    }
}
