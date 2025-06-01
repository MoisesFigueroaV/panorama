// src/modules/rolUsuario/rolUsuario.service.ts
import { db } from '../../db/drizzle'; // Nuestra instancia de Drizzle
import { rolUsuarioTable, type RolUsuario, type NewRolUsuario } from '../../db/schema/rolUsuario.schema'; // Nuestro schema y tipos de Drizzle
import { eq, asc, not, and } from 'drizzle-orm';
import { CustomError, handleErrorLog } from '../../utils/errors'; // Nuestras utilidades de error
import type { CreateRolUsuarioPayload, UpdateRolUsuarioPayload } from './rolUsuario.types'; // Nuestros tipos de payload

/**
 * Crea un nuevo rol de usuario.
 */
export async function createRol(
  data: CreateRolUsuarioPayload,
  // No necesitamos organizationId para roles, pero lo mantengo por si otros servicios lo usan
): Promise<RolUsuario> {
  try {
    // Verificar si el nombre del rol ya existe
    const existingRol = await db.query.rolUsuarioTable.findFirst({
      where: eq(rolUsuarioTable.nombre_rol, data.nombre_rol),
    });
    if (existingRol) {
      throw new CustomError(`El rol '${data.nombre_rol}' ya existe.`, 409); // 409 Conflict
    }

    const [newRol] = await db
      .insert(rolUsuarioTable)
      .values({
        nombre_rol: data.nombre_rol,
      })
      .returning() // Devuelve el objeto completo insertado

    if (!newRol) {
      // Esto no debería pasar si la inserción no lanza error, pero es una guarda
      throw new CustomError('Falló la creación del rol de usuario.', 500);
    }
    return newRol;
  } catch (error) {
    // Si el error ya es un CustomError (como el 409 de arriba), relánzalo.
    if (error instanceof CustomError) throw error;
    
    // Para otros errores, loguea y lanza un error genérico.
    handleErrorLog(error, 'servicio createRol'); // Usamos nuestro handleErrorLog
    throw new CustomError('Error interno al crear el rol de usuario.', 500);
  }
}

/**
 * Obtiene todos los roles de usuario.
 */
export async function getAllRoles(): Promise<RolUsuario[]> {
  try {
    const roles = await db
      .select()
      .from(rolUsuarioTable)
      .orderBy(asc(rolUsuarioTable.nombre_rol)); // Ordenar por nombre
    return roles;
  } catch (error) {
    handleErrorLog(error, 'servicio getAllRoles');
    throw new CustomError('Error interno al obtener los roles de usuario.', 500);
  }
}

/**
 * Obtiene un rol de usuario por su ID.
 */
export async function getRolById(rolId: number): Promise<RolUsuario> {
  try {
    const [rol] = await db
      .select()
      .from(rolUsuarioTable)
      .where(eq(rolUsuarioTable.id_rol, rolId));

    if (!rol) {
      throw new CustomError(`Rol de usuario con ID ${rolId} no encontrado.`, 404);
    }
    return rol;
  } catch (error) {
    if (error instanceof CustomError) throw error;
    handleErrorLog(error, `servicio getRolById (id: ${rolId})`);
    throw new CustomError('Error interno al obtener el rol de usuario.', 500);
  }
}

/**
 * Actualiza un rol de usuario existente.
 */
export async function updateRol(
  rolId: number,
  data: UpdateRolUsuarioPayload,
): Promise<RolUsuario> {
  try {
    // Verificar que el rol a actualizar exista
    const rolToUpdate = await getRolById(rolId); // Esto ya lanza 404 si no existe

    // Si se está intentando cambiar el nombre_rol, verificar que no colisione con otro existente
    if (data.nombre_rol && data.nombre_rol !== rolToUpdate.nombre_rol) {
      const existingRolWithNewName = await db.query.rolUsuarioTable.findFirst({
        where: and(
          eq(rolUsuarioTable.nombre_rol, data.nombre_rol),
          not(eq(rolUsuarioTable.id_rol, rolId)) // Excluir el rol actual
        ),
      });
      if (existingRolWithNewName) {
        throw new CustomError(`El nombre de rol '${data.nombre_rol}' ya está en uso.`, 409);
      }
    }

    // Construir el objeto de actualización solo con los campos proporcionados en 'data'
    const updateData: Partial<Pick<NewRolUsuario, 'nombre_rol'>> = {};
    if (data.nombre_rol !== undefined) {
      updateData.nombre_rol = data.nombre_rol;
    }

    // Si no hay nada que actualizar (ej. payload vacío o solo con campos no modificables)
    if (Object.keys(updateData).length === 0) {
      return rolToUpdate; // Devuelve el rol existente sin cambios
    }

    const [updatedRol] = await db
      .update(rolUsuarioTable)
      .set(updateData)
      .where(eq(rolUsuarioTable.id_rol, rolId))
      .returning();

    if (!updatedRol) {
      // Podría ocurrir si el rol fue eliminado entre la verificación y la actualización (muy raro)
      throw new CustomError('Falló la actualización del rol, es posible que ya no exista.', 404);
    }
    return updatedRol;
  } catch (error) {
    if (error instanceof CustomError) throw error;
    handleErrorLog(error, `servicio updateRol (id: ${rolId})`);
    throw new CustomError('Error interno al actualizar el rol de usuario.', 500);
  }
}

/**
 * Elimina un rol de usuario.
 */
export async function deleteRol(rolId: number): Promise<{ message: string }> {
  try {
    // Opcional: Verificar que el rol exista antes de intentar borrarlo para un error 404 más preciso.
    // await getRolById(rolId);

    // TODO: Lógica de negocio: ¿Qué pasa si hay usuarios con este rol? ¿Prevenir? ¿Reasignar?
    // Por ahora, borrado directo.

    const result = await db
      .delete(rolUsuarioTable)
      .where(eq(rolUsuarioTable.id_rol, rolId))
      .returning({ id: rolUsuarioTable.id_rol }); // Para saber si algo fue realmente borrado

    if (result.length === 0) {
      throw new CustomError(`Rol de usuario con ID ${rolId} no encontrado para eliminar.`, 404);
    }

    return { message: 'Rol de usuario eliminado exitosamente' };
  } catch (error) {
    if (error instanceof CustomError) throw error;
    handleErrorLog(error, `servicio deleteRol (id: ${rolId})`);
    // Si hay FK constraints, la DB podría lanzar un error aquí.
    throw new CustomError('Error interno al eliminar el rol de usuario.', 500);
  }
}