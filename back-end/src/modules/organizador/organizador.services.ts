// src/modules/organizador/organizador.service.ts
import { db } from '../../db/drizzle';
import {
  organizadorTable,
  type Organizador as DrizzleOrganizador,
  type NewOrganizador as DrizzleNewOrganizadorOrganizador, // Alias
  usuarioTable,
  type NewUsuario as DrizzleNewUsuarioUsuario, // Alias
  estadoAcreditacionTable, // <--- Importar la tabla de estado de acreditación
  historialEstadoAcreditacionTable,
  type NewHistorialEstadoAcreditacion,
} from '../../db/schema';
// Importar constantes de roles y estados
import { ROLES_IDS, ESTADOS_ACREDITACION_IDS } from '../../config/constants'; // <--- IMPORTAR CONSTANTES
import { eq, and } from 'drizzle-orm';
import { CustomError, handleErrorLog } from '../../utils/errors';
import type {
    RegistroCompletoOrganizadorApiPayload,
    CreateOrganizadorPerfilApiPayload,
    UpdateOrganizadorPerfilApiPayload,
} from './organizador.types';

// Import or alias ApiUpdatePayload if it's the same as UpdateOrganizadorPerfilApiPayload
import type { UpdateOrganizadorPerfilApiPayload as ApiUpdatePayload } from './organizador.types';
import type { AppSession } from '../../middleware/auth.middleware';
import type { Usuario as DrizzleUsuario } from '../../db/schema';


// --- Funciones Placeholder para Subida/Borrado de Archivos (¡IMPLEMENTAR!) ---
async function uploadDocumentoAcreditacion(file: File, orgNombre: string, userId: number): Promise<string> {
    console.warn(`SIMULANDO subida para: ${file.name}`);
    return `https://fake-storage.com/docs/${userId}_${orgNombre.replace(/\s+/g, '_')}_${Date.now()}_${file.name}`;
}
async function deleteDocumentoAcreditacion(url: string | null): Promise<void> {
    if (url) console.warn(`SIMULANDO borrado para: ${url}`);
}
// ---

// Helper para hashear contraseñas (debería ser el mismo que en usuario.service.ts o uno central)
async function hashUserPassword(password: string): Promise<string> {
    // ¡¡¡REEMPLAZAR CON Bun.password.hash!!!
    console.warn("SEGURIDAD: Usando hashing de contraseña placeholder en organizador.service.");
    return `Bun_Hashed_${password}_Placeholder`;
}

// Tipo para el usuario anidado en la respuesta de OrganizadorDetalladoResponse
type NestedUsuarioData = Omit<DrizzleUsuario, 'contrasena' | 'fecha_registro' | 'fecha_nacimiento'> & {
    fecha_registro: Date;
    fecha_nacimiento: Date | null;
    id_rol: number | null;
};

// Tipo para la respuesta detallada del organizador
export type OrganizadorDetalladoResponse = Omit<DrizzleOrganizador, 'id_usuario' | 'id_estado_acreditacion_actual' | 'acreditado' | 'redes_sociales'> & {
    id_usuario: number;
    acreditado: boolean;
    id_estado_acreditacion_actual: number;
    nombre_estado_acreditacion?: string; // Se poblará si haces join con estadoAcreditacionTable
    usuario?: NestedUsuarioData;
    redes_sociales?: Array<{ type: string; url: string }> | null; // Parseado del JSONB
};

// Importar el servicio para obtener el usuario completo (si es necesario)
import { getUsuarioByIdService as fetchUsuarioById } from '../usuario/usuario.services';


/**
 * Servicio para registrar un nuevo usuario Y su perfil de organizador en una sola transacción.
 */
export async function registrarUsuarioYCrearPerfilOrganizadorService(
  data: RegistroCompletoOrganizadorApiPayload // Este payload viene de la ruta
): Promise<OrganizadorDetalladoResponse> {
  
  const { 
    documento_acreditacion_file,
    nombre_usuario_contacto, correo, contrasena, sexo_contacto, fecha_nacimiento_contacto,
    nombre_organizacion, descripcion_organizacion, tipo_organizacion, rut_organizacion,
    telefono_organizacion, direccion_organizacion, redes_sociales_json
  } = data;

  let uploadedDocumentoUrl: string | null = null;

  return db.transaction(async (tx) => {
    // 1. Validaciones previas
    const existingUser = await tx.query.usuarioTable.findFirst({ where: eq(usuarioTable.correo, correo), columns: { id_usuario: true } });
    if (existingUser) throw new CustomError('El correo electrónico ya está en uso.', 409);

    const existingOrg = await tx.query.organizadorTable.findFirst({ where: eq(organizadorTable.nombre_organizacion, nombre_organizacion), columns: { id_organizador: true } });
    if (existingOrg) throw new CustomError('El nombre de la organización ya está en uso.', 409);

    // 2. Crear Usuario con ROL_ORGANIZADOR_ID
    const contrasenaHash = await hashUserPassword(contrasena);
    const newUserForDb: DrizzleNewUsuarioUsuario = {
      nombre_usuario: nombre_usuario_contacto,
      correo: correo,
      contrasena: contrasenaHash,
      id_rol: ROLES_IDS.ORGANIZADOR, // Usar constante importada
      sexo: sexo_contacto || null,
      fecha_nacimiento: fecha_nacimiento_contacto || null,
    };
    const [insertedUser] = await tx.insert(usuarioTable).values(newUserForDb).returning({ id_usuario: usuarioTable.id_usuario });
    if (!insertedUser?.id_usuario) throw new CustomError('Falló la creación de la cuenta de usuario.', 500);
    const newUserId = insertedUser.id_usuario;

    // 3. Subir Documento
    if (documento_acreditacion_file) {
      try {
        uploadedDocumentoUrl = await uploadDocumentoAcreditacion(documento_acreditacion_file, nombre_organizacion, newUserId);
      } catch (uploadError) {
        handleErrorLog(uploadError, 'subida documento registro organizador');
        throw new CustomError('Error al subir el documento de acreditación.', 500);
      }
    }

    // 4. Parsear redes sociales
    let redesSocialesParsed = null;
    if (redes_sociales_json) {
        try { 
            redesSocialesParsed = JSON.parse(redes_sociales_json);
            if (!Array.isArray(redesSocialesParsed)) throw new Error("redes_sociales_json no es un array válido");
        }
        catch (e) { throw new CustomError("JSON de redes sociales inválido.", 400); }
    }

    // 5. Crear Organizador
    const newOrganizadorForDb: DrizzleNewOrganizadorOrganizador = {
      id_usuario: newUserId,
      nombre_organizacion,
      descripcion: descripcion_organizacion,
      tipo_organizacion,
      rut_organizacion,
      telefono_organizacion,
      direccion_organizacion,
      redes_sociales: redesSocialesParsed, // Para columna JSONB
      documento_acreditacion: uploadedDocumentoUrl,
      acreditado: false,
      id_estado_acreditacion_actual: ESTADOS_ACREDITACION_IDS.PENDIENTE, // Usar constante
    };
    const [insertedOrganizador] = await tx.insert(organizadorTable).values(newOrganizadorForDb).returning({ id_organizador: organizadorTable.id_organizador });
    if (!insertedOrganizador?.id_organizador) {
        if (uploadedDocumentoUrl) await deleteDocumentoAcreditacion(uploadedDocumentoUrl).catch(console.error);
        throw new CustomError('No se pudo crear el perfil de la organización.', 500);
    }

    // 6. Crear Historial
    const newHistorial: NewHistorialEstadoAcreditacion = {
        id_organizador: insertedOrganizador.id_organizador,
        id_estado_acreditacion: ESTADOS_ACREDITACION_IDS.PENDIENTE,
        notas_cambio: "Perfil creado, pendiente de revisión inicial."
    };
    await tx.insert(historialEstadoAcreditacionTable).values(newHistorial);
    
    // Devolver el ID, la ruta llamará a getOrganizadorByIdService para obtener el objeto completo
    return { id_organizador: insertedOrganizador.id_organizador } as unknown as OrganizadorDetalladoResponse; // Casteo temporal
  }).catch(async (error) => {
    if (uploadedDocumentoUrl) {
      await deleteDocumentoAcreditacion(uploadedDocumentoUrl).catch(console.error);
    }
    if (error instanceof CustomError) throw error;
    handleErrorLog(error, 'servicio registrarUsuarioYCrearPerfilOrganizadorService');
    throw new CustomError('Error interno durante el registro del organizador.', 500);
  });
}

/**
 * Servicio para que un usuario YA AUTENTICADO cree su perfil de organizador.
 */
export async function crearPerfilOrganizadorService(
  userId: number,
  data: CreateOrganizadorPerfilApiPayload & { documento_acreditacion_file?: File }
): Promise<OrganizadorDetalladoResponse> {
  let uploadedDocumentoUrl: string | null = null;
  const { documento_acreditacion_file, redes_sociales_json, ...orgData } = data;

  return db.transaction(async (tx) => {
    const usuario = await tx.query.usuarioTable.findFirst({ where: eq(usuarioTable.id_usuario, userId), columns: { id_rol: true }});
    if (!usuario) throw new CustomError("Usuario no encontrado.", 404);

    const perfilExistente = await tx.query.organizadorTable.findFirst({ where: eq(organizadorTable.id_usuario, userId) });
    if (perfilExistente) throw new CustomError('Este usuario ya tiene un perfil de organizador.', 409);

    // (Opcional) Verificar unicidad de nombre de organización
    const existingOrgName = await tx.query.organizadorTable.findFirst({ where: eq(organizadorTable.nombre_organizacion, orgData.nombre_organizacion) });
    if (existingOrgName) throw new CustomError(`El nombre '${orgData.nombre_organizacion}' ya está en uso.`, 409);

    if (documento_acreditacion_file) {
      uploadedDocumentoUrl = await uploadDocumentoAcreditacion(documento_acreditacion_file, orgData.nombre_organizacion, userId);
    }

    let redesSocialesParsed = null;
    if (redes_sociales_json) {
        try { redesSocialesParsed = JSON.parse(redes_sociales_json); }
        catch (e) { throw new CustomError("JSON de redes sociales inválido.", 400); }
    }

    const newOrganizadorForDb: DrizzleNewOrganizadorOrganizador = {
      id_usuario: userId,
      nombre_organizacion: orgData.nombre_organizacion,
      descripcion: orgData.descripcion_organizacion,
      tipo_organizacion: orgData.tipo_organizacion,
      rut_organizacion: orgData.rut_organizacion,
      telefono_organizacion: orgData.telefono_organizacion,
      direccion_organizacion: orgData.direccion_organizacion,
      redes_sociales: redesSocialesParsed,
      documento_acreditacion: uploadedDocumentoUrl,
      acreditado: false,
      id_estado_acreditacion_actual: ESTADOS_ACREDITACION_IDS.PENDIENTE,
    };
    const [insertedOrganizador] = await tx.insert(organizadorTable).values(newOrganizadorForDb).returning({ id_organizador: organizadorTable.id_organizador });
    if (!insertedOrganizador?.id_organizador) {
        if (uploadedDocumentoUrl) await deleteDocumentoAcreditacion(uploadedDocumentoUrl).catch(console.error);
        throw new CustomError('No se pudo crear el perfil de la organización.', 500);
    }
    
    // Actualizar rol del usuario a Organizador si era Común
    if (usuario.id_rol === ROLES_IDS.USUARIO_COMUN) {
        await tx.update(usuarioTable)
            .set({ id_rol: ROLES_IDS.ORGANIZADOR })
            .where(eq(usuarioTable.id_usuario, userId));
    }

    await tx.insert(historialEstadoAcreditacionTable).values({
        id_organizador: insertedOrganizador.id_organizador,
        id_estado_acreditacion: ESTADOS_ACREDITACION_IDS.PENDIENTE,
        notas_cambio: "Usuario existente creó su perfil de organizador."
    });

    return { id_organizador: insertedOrganizador.id_organizador } as unknown as OrganizadorDetalladoResponse; // Casteo temporal
  }).catch(async (error) => {
    if (uploadedDocumentoUrl) await deleteDocumentoAcreditacion(uploadedDocumentoUrl).catch(console.error);
    if (error instanceof CustomError) throw error;
    handleErrorLog(error, `servicio crearPerfilOrganizador (userId: ${userId})`);
    throw new CustomError('Error interno al crear el perfil de organizador.', 500);
  });
}

export async function getOrganizadorByIdService(organizadorId: number): Promise<OrganizadorDetalladoResponse> {
  try {
    const organizadorData = await db.query.organizadorTable.findFirst({
      where: eq(organizadorTable.id_organizador, organizadorId),
      with: {
        usuario: {
          columns: { contrasena: false }, // Excluir contraseña
          with: { rol: { columns: { nombre_rol: true } } } // Anidar nombre del rol del usuario
        },
        estadoAcreditacion: { // Asumiendo que definiste esta relación
          columns: { nombre_estado: true }
        }
      }
    });

    // Para que `estadoAcreditacion` funcione en el `with` anterior, necesitas definir la relación
    // en `src/db/schema/organizador.schema.ts`:
    // export const organizadorRelations = relations(organizadorTable, ({ one }) => ({
    //   usuario: one(usuarioTable, { fields: [organizadorTable.id_usuario], references: [usuarioTable.id_usuario] }),
    //   estadoAcreditacion: one(estadoAcreditacionTable, { // <--- ESTA RELACIÓN
    //     fields: [organizadorTable.id_estado_acreditacion_actual],
    //     references: [estadoAcreditacionTable.id_estado_acreditacion],
    //     relationName: 'estadoAcreditacionActual' // O el nombre que uses en el `with`
    //   }),
    // }));
    // Y pasar `organizadorRelations` al schema en `db/drizzle.ts`.

    if (!organizadorData || organizadorData.id_usuario === null) {
      throw new CustomError(`Organizador con ID ${organizadorId} no encontrado.`, 404);
    }
    if (!organizadorData.usuario) {
        throw new CustomError(`Usuario asociado al organizador ID ${organizadorData.id_organizador} no encontrado.`, 404);
    }

    const usuarioAnidado = organizadorData.usuario as any; // Forzar el tipo para evitar error de 'never'

    return {
      id_organizador: organizadorData.id_organizador,
      nombre_organizacion: organizadorData.nombre_organizacion,
      descripcion: organizadorData.descripcion,
      documento_acreditacion: organizadorData.documento_acreditacion,
      acreditado: !!organizadorData.acreditado,
      id_estado_acreditacion_actual: organizadorData.id_estado_acreditacion_actual,
      nombre_estado_acreditacion: (organizadorData as any).estadoAcreditacion?.nombre_estado, // Acceder a través del nombre de la relación
      id_usuario: organizadorData.id_usuario,
      tipo_organizacion: organizadorData.tipo_organizacion, // Añadir si existen en DrizzleOrganizador
      rut_organizacion: organizadorData.rut_organizacion,
      telefono_organizacion: organizadorData.telefono_organizacion,
      direccion_organizacion: organizadorData.direccion_organizacion,
      redes_sociales: organizadorData.redes_sociales as Array<{ type: string; url: string }> | null, // Castear si es JSONB
      usuario: {
        id_usuario: usuarioAnidado.id_usuario,
        correo: usuarioAnidado.correo,
        nombre_usuario: usuarioAnidado.nombre_usuario,
        fecha_registro: new Date(usuarioAnidado.fecha_registro as string),
        sexo: usuarioAnidado.sexo,
        fecha_nacimiento: usuarioAnidado.fecha_nacimiento ? new Date(usuarioAnidado.fecha_nacimiento as string) : null,
        id_rol: usuarioAnidado.id_rol,
        // Podrías anidar el nombre del rol del usuario si lo trajiste con el `with` anidado
        // rol: usuarioAnidado.rol ? { id_rol: usuarioAnidado.rol.id_rol, nombre_rol: usuarioAnidado.rol.nombre_rol } : null
      }
    };
  } catch (error) {
    if (error instanceof CustomError) throw error;
    handleErrorLog(error, `servicio getOrganizadorById (id: ${organizadorId})`);
    throw new CustomError('Error interno al obtener el organizador.', 500);
  }
}

// getOrganizadorByUserIdService debe ser similar a getOrganizadorByIdService pero buscando por `id_usuario`

export async function updateOrganizadorPerfilService(
  organizadorId: number,
  data: ApiUpdatePayload & { documento_acreditacion_file?: File | null },
  session: NonNullable<AppSession>
): Promise<OrganizadorDetalladoResponse> {
  const organizadorActual = await getOrganizadorByIdService(organizadorId);
  if (organizadorActual.id_usuario !== session.subAsNumber) {
    throw new CustomError('No tienes permiso para actualizar este perfil.', 403);
  }

  let newDocumentoUrl: string | null | undefined = undefined; // undefined significa "no cambiar"
  const { documento_acreditacion_file, redes_sociales_json, ...textData } = data;

  if (data.hasOwnProperty('documento_acreditacion_file')) {
      const fileOrNull = documento_acreditacion_file;
      if (fileOrNull === null) { // Cliente quiere borrar el documento
          await deleteDocumentoAcreditacion(organizadorActual.documento_acreditacion);
          newDocumentoUrl = null;
      } else if (fileOrNull instanceof File) { // Cliente envía un nuevo archivo
          if(organizadorActual.documento_acreditacion) { // Borrar el antiguo si existía
            await deleteDocumentoAcreditacion(organizadorActual.documento_acreditacion);
          }
          newDocumentoUrl = await uploadDocumentoAcreditacion(fileOrNull, textData.nombre_organizacion || organizadorActual.nombre_organizacion, session.subAsNumber);
      }
  }
  
  const updatePayloadForDb: Partial<DrizzleNewOrganizadorOrganizador> = { ...textData };
  if (newDocumentoUrl !== undefined) { // Solo actualizar si newDocumentoUrl fue explícitamente seteado (a string o null)
    updatePayloadForDb.documento_acreditacion = newDocumentoUrl;
  }
  if (redes_sociales_json !== undefined) {
      try {
          updatePayloadForDb.redes_sociales = redes_sociales_json ? JSON.parse(redes_sociales_json) : null;
      } catch (e) { throw new CustomError("JSON de redes sociales inválido para actualizar.", 400); }
  }

  // Filtrar campos undefined para que Drizzle no intente setearlos a NULL si no se enviaron
  Object.keys(updatePayloadForDb).forEach(key => 
    (updatePayloadForDb as any)[key] === undefined && delete (updatePayloadForDb as any)[key]
  );

  if (Object.keys(updatePayloadForDb).length === 0) {
    return organizadorActual; // No hay cambios significativos
  }

  await db.update(organizadorTable)
    .set(updatePayloadForDb)
    .where(eq(organizadorTable.id_organizador, organizadorId));
    
  return getOrganizadorByIdService(organizadorId); // Devolver el perfil actualizado
}


export async function adminUpdateAcreditacionService(
  organizadorId: number,
  nuevoEstadoId: number,
  notasAdmin: string | null,
  adminUserId: number
): Promise<OrganizadorDetalladoResponse> {
  return db.transaction(async (tx) => {
    const organizador = await tx.query.organizadorTable.findFirst({
        where: eq(organizadorTable.id_organizador, organizadorId),
        columns: { id_estado_acreditacion_actual: true, id_usuario: true } // Necesitamos id_usuario para el historial
    });
    if (!organizador) throw new CustomError('Organizador no encontrado.', 404);

    const estadoDestino = await tx.query.estadoAcreditacionTable.findFirst({
        where: eq(estadoAcreditacionTable.id_estado_acreditacion, nuevoEstadoId)
    });
    if (!estadoDestino) throw new CustomError('Estado de acreditación objetivo inválido.', 400);

    await tx.update(organizadorTable)
      .set({
        id_estado_acreditacion_actual: nuevoEstadoId,
        acreditado: nuevoEstadoId === ESTADOS_ACREDITACION_IDS.APROBADO,
      })
      .where(eq(organizadorTable.id_organizador, organizadorId));

    const newHistorial: NewHistorialEstadoAcreditacion = {
      id_organizador: organizadorId,
      id_estado_acreditacion: nuevoEstadoId,
      id_admin_responsable: adminUserId,
      notas_cambio: notasAdmin,
    };
    await tx.insert(historialEstadoAcreditacionTable).values(newHistorial);
    
    // Devolver el ID para que la ruta lo busque y obtenga el objeto completo
    return { id_organizador: organizadorId } as unknown as OrganizadorDetalladoResponse; // Casteo temporal
  });
}

export function getOrganizadorByUserIdService(subAsNumber: number): any {
    throw new Error('Function not implemented.');
}
