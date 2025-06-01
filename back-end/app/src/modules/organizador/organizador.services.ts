// src/modules/organizador/organizador.service.ts
import { db } from '../../db/drizzle';
import {
  organizadorTable,
  type Organizador,
  type NewOrganizador,
  usuarioTable // Para joins
} from '../../db/schema';
import { eq, and, desc, ilike, or } from 'drizzle-orm';
import { CustomError, handleErrorLog } from '../../utils/errors';
import type { CreateOrganizadorPayload, UpdateOrganizadorPayload } from './organizador.types';
import type { AppSession } from '../../middleware/auth.middleware'; // Para el tipo de sesión

// Tipo para el objeto de organizador devuelto por los servicios, incluyendo datos del usuario
type OrganizadorConUsuario = Omit<Organizador, 'id_usuario'> & {
    id_usuario: number; // Aseguramos que id_usuario está (aunque en Organizador es opcional por Drizzle)
    usuario?: Omit<typeof usuarioTable.$inferSelect, 'contrasena' | 'fecha_registro' | 'fecha_nacimiento'> & {
        fecha_registro: Date;
        fecha_nacimiento: Date | null;
    }
};

type UsuarioPublico = Omit<typeof usuarioTable.$inferSelect, 'contrasena'> & {
    fecha_registro: Date;
    fecha_nacimiento: Date | null;
};

/**
 * Crea un perfil de organizador para un usuario existente.
 */
export async function createOrganizadorService(
  userId: number, // ID del usuario que se convierte en organizador
  data: CreateOrganizadorPayload
): Promise<OrganizadorConUsuario> {
  try {
    // 1. Verificar que el usuario exista (opcional, la FK lo haría, pero es bueno ser explícito)
    const usuarioExistente = await db.query.usuarioTable.findFirst({
      where: eq(usuarioTable.id_usuario, userId),
      columns: { id_usuario: true }
    });
    if (!usuarioExistente) {
      throw new CustomError('Usuario no encontrado para asociar como organizador.', 404);
    }

    // 2. Verificar que este usuario no tenga ya un perfil de organizador
    const perfilExistente = await db.query.organizadorTable.findFirst({
      where: eq(organizadorTable.id_usuario, userId)
    });
    if (perfilExistente) {
      throw new CustomError('Este usuario ya tiene un perfil de organizador.', 409);
    }
    
    // 3. (Opcional) Verificar si el nombre de la organización ya existe (si debe ser único)
    // const orgNameExists = await db.query.organizadorTable.findFirst({
    //   where: eq(organizadorTable.nombre_organizacion, data.nombre_organizacion)
    // });
    // if (orgNameExists) {
    //   throw new CustomError(`El nombre de organización '${data.nombre_organizacion}' ya está en uso.`, 409);
    // }

    // TODO: Lógica de subida de `documento_acreditacion_file` si se implementa
    // let documentoUrl = data.documento_acreditacion_url;
    // if (data.documento_acreditacion_file) { ... }

    const newOrganizadorPayload: NewOrganizador = {
      id_usuario: userId,
      nombre_organizacion: data.nombre_organizacion,
      descripcion: data.descripcion,
      documento_acreditacion: data.documento_acreditacion_url, // Usar la URL procesada
      acreditado: false, // Por defecto, no acreditado
    };

    const [insertedOrganizador] = await db
      .insert(organizadorTable)
      .values(newOrganizadorPayload)
      .returning();

    if (!insertedOrganizador) {
      throw new CustomError('No se pudo crear el perfil de organizador.', 500);
    }

    // Devolver el organizador con los datos del usuario asociado
    return getOrganizadorByIdService(insertedOrganizador.id_organizador);

  } catch (error) {
    if (error instanceof CustomError) throw error;
    handleErrorLog(error, `servicio createOrganizador (userId: ${userId})`);
    throw new CustomError('Error interno al crear el perfil de organizador.', 500);
  }
}

/**
 * Obtiene un perfil de organizador por su ID, incluyendo datos del usuario.
 */
export async function getOrganizadorByIdService(organizadorId: number): Promise<OrganizadorConUsuario> {
  try {
    const organizador = await db.query.organizadorTable.findFirst({
      where: eq(organizadorTable.id_organizador, organizadorId),
      with: {
        usuario: {
          columns: {
            contrasena: false
          }
        }
      }
    });

    if (!organizador || !organizador.usuario) {
      throw new CustomError(`Organizador con ID ${organizadorId} o usuario asociado no encontrado.`, 404);
    }

    const usuarioPublico = organizador.usuario as unknown as UsuarioPublico;
    
    return {
      ...organizador,
      id_usuario: organizador.id_usuario as number,
      usuario: {
          ...usuarioPublico,
          fecha_registro: new Date(usuarioPublico.fecha_registro as string),
          fecha_nacimiento: usuarioPublico.fecha_nacimiento ? new Date(usuarioPublico.fecha_nacimiento as string) : null
      }
    };
  } catch (error) {
    if (error instanceof CustomError) throw error;
    handleErrorLog(error, `servicio getOrganizadorById (id: ${organizadorId})`);
    throw new CustomError('Error interno al obtener el organizador.', 500);
  }
}

/**
 * Obtiene el perfil de organizador asociado a un ID de usuario.
 */
export async function getOrganizadorByUserIdService(userId: number): Promise<OrganizadorConUsuario | null> {
  try {
    const organizador = await db.query.organizadorTable.findFirst({
      where: eq(organizadorTable.id_usuario, userId),
      with: {
        usuario: { columns: { contrasena: false } }
      }
    });

    if (!organizador || !organizador.usuario) {
      return null;
    }
    
    const usuarioPublico = organizador.usuario as unknown as UsuarioPublico;
    
    return {
      ...organizador,
      id_usuario: organizador.id_usuario as number,
      usuario: {
          ...usuarioPublico,
          fecha_registro: new Date(usuarioPublico.fecha_registro as string),
          fecha_nacimiento: usuarioPublico.fecha_nacimiento ? new Date(usuarioPublico.fecha_nacimiento as string) : null
      }
    };
  } catch (error) {
    handleErrorLog(error, `servicio getOrganizadorByUserId (userId: ${userId})`);
    throw new CustomError('Error interno al buscar perfil de organizador.', 500);
  }
}


/**
 * Actualiza un perfil de organizador.
 * Solo el propio organizador o un admin pueden hacerlo.
 */
export async function updateOrganizadorService(
  organizadorId: number,
  data: UpdateOrganizadorPayload,
  session: NonNullable<AppSession> // Sesión del usuario autenticado
): Promise<OrganizadorConUsuario> {
  try {
    const organizadorActual = await getOrganizadorByIdService(organizadorId);

    // Verificar permisos: ¿Es el dueño del perfil o un admin?
    // const isAdmin = session.rol === ADMIN_ROLE_ID; // Necesitarías ADMIN_ROLE_ID
    const esDueño = organizadorActual.id_usuario === session.subAsNumber;

    // if (!esDueño && !isAdmin) {
    if (!esDueño) { // Simplificado: solo el dueño puede editar por ahora
      throw new CustomError('No tienes permiso para actualizar este perfil de organizador.', 403);
    }

    // TODO: Lógica de actualización de `documento_acreditacion_file`
    // let documentoUrl = data.documento_acreditacion_url === undefined ? organizadorActual.documento_acreditacion : data.documento_acreditacion_url;

    const updateData: Partial<Omit<NewOrganizador, 'id_usuario' | 'acreditado'>> = {};
    if (data.nombre_organizacion !== undefined) updateData.nombre_organizacion = data.nombre_organizacion;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.documento_acreditacion_url !== undefined) updateData.documento_acreditacion = data.documento_acreditacion_url;

    if (Object.keys(updateData).length === 0) {
      return organizadorActual; // No hay nada que actualizar
    }
    
    // (Opcional) Si el nombre de la organización cambia, verificar unicidad
    // if (updateData.nombre_organizacion && updateData.nombre_organizacion !== organizadorActual.nombre_organizacion) { ... }


    const [updatedOrganizador] = await db
      .update(organizadorTable)
      .set(updateData)
      .where(eq(organizadorTable.id_organizador, organizadorId))
      .returning();

    if (!updatedOrganizador) {
      throw new CustomError('No se pudo actualizar el perfil de organizador.', 500);
    }

    return getOrganizadorByIdService(updatedOrganizador.id_organizador); // Devolver con datos de usuario

  } catch (error) {
    if (error instanceof CustomError) throw error;
    handleErrorLog(error, `servicio updateOrganizador (id: ${organizadorId})`);
    throw new CustomError('Error interno al actualizar el perfil de organizador.', 500);
  }
}

/**
 * Actualiza el estado de acreditación de un organizador (solo Admin).
 */
export async function updateAcreditacionOrganizadorService(
  organizadorId: number,
  acreditado: boolean
  // session: NonNullable<AppSession> // Para verificar rol de Admin
): Promise<OrganizadorConUsuario> {
  try {
    // if (session.rol !== ADMIN_ROLE_ID) {
    //   throw new CustomError('Solo los administradores pueden cambiar el estado de acreditación.', 403);
    // }
    await getOrganizadorByIdService(organizadorId); // Verifica que exista

    const [updatedOrganizador] = await db
      .update(organizadorTable)
      .set({ acreditado })
      .where(eq(organizadorTable.id_organizador, organizadorId))
      .returning();

    if (!updatedOrganizador) {
      throw new CustomError('No se pudo actualizar el estado de acreditación.', 500);
    }
    // TODO: Registrar en historial_estado_acreditacion
    return getOrganizadorByIdService(updatedOrganizador.id_organizador);
  } catch (error) {
    if (error instanceof CustomError) throw error;
    handleErrorLog(error, `servicio updateAcreditacion (id: ${organizadorId})`);
    throw new CustomError('Error interno al actualizar acreditación.', 500);
  }
}


// TODO: Servicio para listar todos los organizadores (con filtros: acreditados, nombre, etc.)
// export async function getAllOrganizadoresService(filters: {...}): Promise<OrganizadorConUsuario[]> { ... }

// TODO: Servicio para eliminar un perfil de organizador (Admin)
// Considerar si se elimina el usuario asociado o solo el perfil de organizador.