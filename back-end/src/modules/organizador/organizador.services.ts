// src/modules/organizador/organizador.service.ts
import { db } from '../../db/drizzle';
import {
  organizadorTable,
  type Organizador, // Tipo de Drizzle para leer
  type NewOrganizador, // Tipo de Drizzle para insertar
  usuarioTable, // Para joins y tipo de usuario
  type Usuario as DrizzleUsuario // Tipo de Drizzle para Usuario
} from '../../db/schema';
import { eq } from 'drizzle-orm';
import { CustomError, handleErrorLog } from '../../utils/errors';
import type { CreateOrganizadorPayload as ApiCreatePayload, UpdateOrganizadorPayload as ApiUpdatePayload } from './organizador.types';
import type { AppSession } from '../../middleware/auth.middleware';

// --- Funciones Placeholder para Subida/Borrado de Archivos ---
// ¡DEBES IMPLEMENTAR ESTAS FUNCIONES CORRECTAMENTE!
async function uploadDocumentoAcreditacion(file: File, organizadorNombre: string, userId: number): Promise<string> {
  console.warn(`ADVERTENCIA: uploadDocumentoAcreditacion NO IMPLEMENTADO. Simulando subida para ${file.name}`);
  // Aquí iría tu lógica real de subida a Supabase Storage, Cloudinary, S3, etc.
  // y devolverías la URL pública del archivo subido.
  return `https://storage.example.com/documentos_acreditacion/${userId}_${organizadorNombre.replace(/\s+/g, '_')}_${Date.now()}_${file.name}`;
}

async function deleteDocumentoAcreditacion(documentoUrl: string | null): Promise<void> {
    if (!documentoUrl) return;
    console.warn(`ADVERTENCIA: deleteDocumentoAcreditacion NO IMPLEMENTADO para ${documentoUrl}`);
    // Aquí iría tu lógica real para eliminar el archivo del almacenamiento en la nube.
}
// --- Fin Placeholders ---


type NestedUsuarioPublico = Omit<DrizzleUsuario, 'contrasena' | 'fecha_registro' | 'fecha_nacimiento'> & {
    fecha_registro: Date;
    fecha_nacimiento: Date | null;
};

type OrganizadorConUsuario = Omit<Organizador, 'id_usuario' | 'acreditado'> & {
    id_usuario: number; 
    acreditado: boolean;
    usuario?: NestedUsuarioPublico; 
};


export async function createOrganizadorService(
  userId: number,
  data: ApiCreatePayload & { 
    documento_acreditacion_file?: File;
    documento_acreditacion_url?: string | null;
  }
): Promise<OrganizadorConUsuario> {
  try {
    const usuarioExistente = await db.query.usuarioTable.findFirst({
      where: eq(usuarioTable.id_usuario, userId),
      columns: { id_usuario: true }
    });
    if (!usuarioExistente) {
      throw new CustomError('Usuario no encontrado para asociar como organizador.', 404);
    }

    const perfilExistente = await db.query.organizadorTable.findFirst({
      where: eq(organizadorTable.id_usuario, userId)
    });
    if (perfilExistente) {
      throw new CustomError('Este usuario ya tiene un perfil de organizador.', 409);
    }

    let documentoUrlFinal: string | null = null;
    if (data.documento_acreditacion_file) {
      documentoUrlFinal = await uploadDocumentoAcreditacion(data.documento_acreditacion_file, data.nombre_organizacion, userId);
    } else if (data.documento_acreditacion_url) { 
        documentoUrlFinal = data.documento_acreditacion_url;
    }

    let orgSocialsParaDb: Record<string, string> | null = null;
    if (data.orgSocialsJson) {
        try {
            const parsedSocials = JSON.parse(data.orgSocialsJson);
            orgSocialsParaDb = parsedSocials;
        } catch (e) {
            throw new CustomError("Formato de redes sociales (orgSocialsJson) inválido.", 400);
        }
    }


    const newOrganizadorPayloadForDb: NewOrganizador = {
      id_usuario: userId,
      nombre_organizacion: data.nombre_organizacion,
      descripcion: data.descripcion,
      documento_acreditacion: documentoUrlFinal,
      acreditado: false, 
    };

    const [insertedOrganizador] = await db
      .insert(organizadorTable)
      .values(newOrganizadorPayloadForDb)
      .returning({ id_organizador: organizadorTable.id_organizador }); 

    if (!insertedOrganizador || !insertedOrganizador.id_organizador) {
      if (documentoUrlFinal) await deleteDocumentoAcreditacion(documentoUrlFinal); 
      throw new CustomError('No se pudo crear el perfil de organizador.', 500);
    }

    return getOrganizadorByIdService(insertedOrganizador.id_organizador);
  } catch (error) {
    if (error instanceof CustomError) throw error;
    handleErrorLog(error, `servicio createOrganizador (userId: ${userId})`);
    throw new CustomError('Error interno al crear el perfil de organizador.', 500);
  }
}

export async function getOrganizadorByIdService(organizadorId: number): Promise<OrganizadorConUsuario> {
  try {
    const organizadorData = await db.query.organizadorTable.findFirst({
      where: eq(organizadorTable.id_organizador, organizadorId),
      with: {
        usuario: {
          columns: { 
            contrasena: false,
          }
        }
      }
    });

    if (!organizadorData || organizadorData.id_usuario === null) { 
      throw new CustomError(`Organizador con ID ${organizadorId} no encontrado o sin usuario válido.`, 404);
    }
    if (!organizadorData.usuario) {
        throw new CustomError(`Usuario asociado al organizador ID ${organizadorData.id_organizador} no encontrado.`, 404);
    }

    const usuarioAnidado = organizadorData.usuario as Omit<DrizzleUsuario, 'contrasena'>;

    return {
      id_organizador: organizadorData.id_organizador,
      nombre_organizacion: organizadorData.nombre_organizacion,
      descripcion: organizadorData.descripcion,
      documento_acreditacion: organizadorData.documento_acreditacion,
      acreditado: !!organizadorData.acreditado, 
      id_usuario: organizadorData.id_usuario, 
      usuario: {
        id_usuario: usuarioAnidado.id_usuario,
        correo: usuarioAnidado.correo,
        nombre_usuario: usuarioAnidado.nombre_usuario,
        fecha_registro: new Date(usuarioAnidado.fecha_registro as string),
        sexo: usuarioAnidado.sexo,
        fecha_nacimiento: usuarioAnidado.fecha_nacimiento ? new Date(usuarioAnidado.fecha_nacimiento as string) : null,
        id_rol: usuarioAnidado.id_rol, 
      }
    };
  } catch (error) {
    if (error instanceof CustomError) throw error;
    handleErrorLog(error, `servicio getOrganizadorById (id: ${organizadorId})`);
    throw new CustomError('Error interno al obtener el organizador.', 500);
  }
}

export async function getOrganizadorByUserIdService(userId: number): Promise<OrganizadorConUsuario | null> {
  try {
    const organizadorData = await db.query.organizadorTable.findFirst({
      where: eq(organizadorTable.id_usuario, userId),
      with: {
        usuario: { columns: { contrasena: false } }
      }
    });

    if (!organizadorData || organizadorData.id_usuario === null) {
      return null; 
    }
    if (!organizadorData.usuario) {
        console.warn(`Organizador con id_usuario ${userId} no tiene un objeto usuario anidado.`);
        return null;
    }

    const usuarioAnidado = organizadorData.usuario as Omit<DrizzleUsuario, 'contrasena'>;

    return {
      id_organizador: organizadorData.id_organizador,
      nombre_organizacion: organizadorData.nombre_organizacion,
      descripcion: organizadorData.descripcion,
      documento_acreditacion: organizadorData.documento_acreditacion,
      acreditado: !!organizadorData.acreditado,
      id_usuario: organizadorData.id_usuario,
      usuario: {
        id_usuario: usuarioAnidado.id_usuario,
        correo: usuarioAnidado.correo,
        nombre_usuario: usuarioAnidado.nombre_usuario,
        fecha_registro: new Date(usuarioAnidado.fecha_registro as string),
        sexo: usuarioAnidado.sexo,
        fecha_nacimiento: usuarioAnidado.fecha_nacimiento ? new Date(usuarioAnidado.fecha_nacimiento as string) : null,
        id_rol: usuarioAnidado.id_rol,
      }
    };
  } catch (error) {
    handleErrorLog(error, `servicio getOrganizadorByUserId (userId: ${userId})`);
    throw new CustomError('Error interno al buscar perfil de organizador.', 500);
  }
}


export async function updateOrganizadorService(
  organizadorId: number,
  data: ApiUpdatePayload & { documento_acreditacion_file?: File | null }, 
  session: NonNullable<AppSession>
): Promise<OrganizadorConUsuario> {
  try {
    const organizadorActual = await getOrganizadorByIdService(organizadorId); 
    if (organizadorActual.id_usuario !== session.subAsNumber) {
      throw new CustomError('No tienes permiso para actualizar este perfil de organizador.', 403);
    }

    let newDocumentoUrl: string | null | undefined = undefined; 

    if (data.hasOwnProperty('documento_acreditacion_file')) {
        const fileOrNull = data.documento_acreditacion_file;
        if (fileOrNull === null) { 
            await deleteDocumentoAcreditacion(organizadorActual.documento_acreditacion);
            newDocumentoUrl = null;
        } else if (fileOrNull instanceof File) { 
            await deleteDocumentoAcreditacion(organizadorActual.documento_acreditacion);
            newDocumentoUrl = await uploadDocumentoAcreditacion(fileOrNull, data.nombre_organizacion || organizadorActual.nombre_organizacion, session.subAsNumber);
        }
    }
    
    const updatePayloadForDb: Partial<Omit<NewOrganizador, 'id_usuario' | 'acreditado'>> = {};
    if (data.nombre_organizacion !== undefined) updatePayloadForDb.nombre_organizacion = data.nombre_organizacion;
    if (data.descripcion !== undefined) updatePayloadForDb.descripcion = data.descripcion;
    if (newDocumentoUrl !== undefined) updatePayloadForDb.documento_acreditacion = newDocumentoUrl;

    if (Object.keys(updatePayloadForDb).length === 0) { 
      return organizadorActual; 
    }

    const [updatedResult] = await db
      .update(organizadorTable)
      .set(updatePayloadForDb)
      .where(eq(organizadorTable.id_organizador, organizadorId))
      .returning({ id_organizador: organizadorTable.id_organizador });

    if (!updatedResult || !updatedResult.id_organizador) {
        if (newDocumentoUrl !== undefined && newDocumentoUrl !== organizadorActual.documento_acreditacion) {
             await deleteDocumentoAcreditacion(newDocumentoUrl);
        }
        throw new CustomError('No se pudo actualizar el perfil de organizador.', 500);
    }
    return getOrganizadorByIdService(updatedResult.id_organizador);
  } catch (error) {
    if (error instanceof CustomError) throw error;
    handleErrorLog(error, `servicio updateOrganizador (id: ${organizadorId})`);
    throw new CustomError('Error interno al actualizar el perfil de organizador.', 500);
  }
}

export async function updateAcreditacionOrganizadorService(
  organizadorId: number,
  acreditado: boolean
): Promise<OrganizadorConUsuario> {
  try {
    await getOrganizadorByIdService(organizadorId); 
    const [updatedOrg] = await db.update(organizadorTable).set({ acreditado }).where(eq(organizadorTable.id_organizador, organizadorId)).returning({id_organizador: organizadorTable.id_organizador});
    if (!updatedOrg || !updatedOrg.id_organizador) {
        throw new CustomError('No se pudo actualizar el estado de acreditación.', 500);
    }
    return getOrganizadorByIdService(updatedOrg.id_organizador);
  } catch (error) {
    if (error instanceof CustomError) throw error;
    handleErrorLog(error, `servicio updateAcreditacion (id: ${organizadorId})`);
    throw new CustomError('Error interno al actualizar acreditación.', 500);
  }
}