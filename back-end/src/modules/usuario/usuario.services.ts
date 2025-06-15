// src/modules/usuario/usuario.service.ts
import { db } from '../../db/drizzle';
import {
  usuarioTable,
  type Usuario as DrizzleUsuario,
  type NewUsuario as DrizzleNewUsuario,
} from '../../db/schema';
import { eq } from 'drizzle-orm';
import { CustomError, handleErrorLog } from '../../utils/errors';
import type {
  RegistroUsuarioPayload,
  LoginUsuarioPayload,
  UpdateUsuarioPerfilPayload,
} from './usuario.types';
import { ROLES_IDS } from '../../config/constants'; // <--- IMPORTAR CONSTANTES DE ROLES

// Tipos para los payloads de los signers
type SignerAccessPayload = { sub: string; rol?: number };
type SignerRefreshPayload = { sub: string };

// Tipos de respuesta del servicio
export type UsuarioServiceResponse = {
    id_usuario: number;
    correo: string;
    nombre_usuario: string;
    fecha_registro: string; // Formato ISO
    sexo: string | null;
    fecha_nacimiento: string | null; // Formato ISO
    id_rol: number | null;
    // Campos de perfil
    biografia: string | null;
    intereses: string[] | null;
    foto_perfil: string | null;
    // Campos de contacto
    telefono: string | null;
    ubicacion: string | null;
};

export type UsuarioConRolServiceResponse = UsuarioServiceResponse & {
    rol?: { id_rol: number; nombre_rol: string } | null;
};

// Constantes de roles (ahora importadas)
// const ROL_ADMINISTRADOR_ID = ROLES_IDS.ADMINISTRADOR; // Descomenta si lo usas aquí
export const ROL_ORGANIZADOR_ID = ROLES_IDS.ORGANIZADOR; // Exportar si organizador.service lo necesita desde aquí
export const ROL_USUARIO_COMUN_ID = ROLES_IDS.USUARIO_COMUN;
export const ROL_ADMINISTRADOR_ID = ROLES_IDS.ADMINISTRADOR; // Exportar si otro servicio lo necesita

// No necesitas `seleccionColumnasUsuarioPublico` si tus funciones de get y returning especifican los campos.

async function hashPassword(password: string): Promise<string> {
    // ¡¡¡IMPLEMENTACIÓN SEGURA URGENTE con Bun.password.hash!!!
    console.warn("SEGURIDAD: Usando hashing de contraseña placeholder en usuario.service.");
    return `${password}`; // Cambia esto
}

async function verifyPassword(password: string, hashFromDb: string): Promise<boolean> {
    // ¡¡¡IMPLEMENTACIÓN SEGURA URGENTE con Bun.password.verify!!!
    console.warn("SEGURIDAD: Usando verificación de contraseña placeholder en usuario.service.");
    return `${password}` === hashFromDb; // Cambia esto
}

/**
 * Registra un NUEVO USUARIO COMÚN.
 * Para registrar un organizador, usa el servicio en `organizador.service.ts`.
 */
export async function registrarUsuarioComunService( // Renombrado para claridad
  data: RegistroUsuarioPayload
): Promise<UsuarioConRolServiceResponse> {
  try {
    const targetRolId = ROL_USUARIO_COMUN_ID; // <--- Asigna rol de usuario común
    
    const existingUser = await db.query.usuarioTable.findFirst({
      where: eq(usuarioTable.correo, data.correo),
    });
    if (existingUser) {
      throw new CustomError('El correo electrónico ya está registrado.', 409);
    }

    const contrasenaHash = await hashPassword(data.contrasena);
    const newUserPayloadForDb: DrizzleNewUsuario = {
      nombre_usuario: data.nombre_usuario,
      correo: data.correo,
      contrasena: contrasenaHash,
      id_rol: targetRolId, // Asigna el rol de usuario común
      sexo: data.sexo || null,
      fecha_nacimiento: data.fecha_nacimiento || null,
      // Nuevos campos de perfil
      biografia: data.biografia || null,
      intereses: data.intereses || null,
      foto_perfil: data.foto_perfil || null,
    };

    const [insertedUserBrief] = await db
        .insert(usuarioTable)
        .values(newUserPayloadForDb)
        .returning({ id_usuario: usuarioTable.id_usuario });

    if (!insertedUserBrief || !insertedUserBrief.id_usuario) {
        throw new CustomError('Falló la creación del perfil de usuario.', 500);
    }
    // Devolver el usuario completo con su rol
    return getUsuarioByIdService(insertedUserBrief.id_usuario);
  } catch (error) {
    if (error instanceof CustomError) throw error;
    handleErrorLog(error, 'servicio registrarUsuarioComunService');
    throw new CustomError('Error interno durante el registro.', 500);
  }
}

export async function loginUsuarioService(
  payload: LoginUsuarioPayload,
  jwtSigners: {
    access: (payload: SignerAccessPayload) => Promise<string>,
    refresh: (payload: SignerRefreshPayload) => Promise<string>
  }
): Promise<{ accessToken: string; refreshToken: string; usuario: UsuarioConRolServiceResponse }> {
  try {
    const userFromDb = await db.query.usuarioTable.findFirst({
      where: eq(usuarioTable.correo, payload.correo),
      with: { rol: true }
    });

    if (!userFromDb || !userFromDb.contrasena) {
      throw new CustomError('Credenciales inválidas.', 401);
    }

    const contrasenaValida = await verifyPassword(payload.contrasena, userFromDb.contrasena);
    if (!contrasenaValida) {
      throw new CustomError('Credenciales inválidas.', 401);
    }

    const jwtAccessPayload: SignerAccessPayload = {
      sub: String(userFromDb.id_usuario),
      ...(userFromDb.id_rol !== null && { rol: userFromDb.id_rol }),
    };
    const jwtRefreshPayload: SignerRefreshPayload = {
      sub: String(userFromDb.id_usuario)
    };

    const accessToken = await jwtSigners.access(jwtAccessPayload);
    const refreshToken = await jwtSigners.refresh(jwtRefreshPayload);

    const usuarioParaRespuesta: UsuarioConRolServiceResponse = {
      id_usuario: userFromDb.id_usuario,
      correo: userFromDb.correo,
      nombre_usuario: userFromDb.nombre_usuario,
      fecha_registro: new Date(userFromDb.fecha_registro).toISOString(),
      sexo: userFromDb.sexo,
      fecha_nacimiento: userFromDb.fecha_nacimiento ? new Date(userFromDb.fecha_nacimiento).toISOString() : null,
      id_rol: userFromDb.id_rol,
      biografia: userFromDb.biografia,
      intereses: userFromDb.intereses,
      foto_perfil: userFromDb.foto_perfil,
      telefono: userFromDb.telefono,
      ubicacion: userFromDb.ubicacion,
      rol: userFromDb.rol ? {
        id_rol: userFromDb.rol.id_rol,
        nombre_rol: userFromDb.rol.nombre_rol,
      } : null,
    };

    return { accessToken, refreshToken, usuario: usuarioParaRespuesta };
  } catch (error) {
    handleErrorLog(error, 'loginUsuarioService');
    throw error;
  }
}

export async function refreshTokenService(
  verifiedRefreshTokenPayload: { sub: string }, // sub es string
  jwtSignerAccess: (payload: SignerAccessPayload) => Promise<string>
): Promise<{ accessToken: string }> {
  try {
    const userIdAsNumber = parseInt(verifiedRefreshTokenPayload.sub, 10);
    if (isNaN(userIdAsNumber)) {
        throw new CustomError("Token de refresco inválido (sub no numérico).", 401);
    }

    const user = await db.query.usuarioTable.findFirst({
      where: eq(usuarioTable.id_usuario, userIdAsNumber),
      columns: { id_rol: true } // Solo necesitamos el rol para el nuevo token de acceso
    });

    if (!user) {
      throw new CustomError('Usuario asociado al token de refresco no encontrado.', 401);
    }

    const newAccessTokenPayload: SignerAccessPayload = {
      sub: String(userIdAsNumber), // `sub` debe ser string para firmar
      ...(user.id_rol !== null && { rol: user.id_rol }),
    };

    const accessToken = await jwtSignerAccess(newAccessTokenPayload);
    return { accessToken };
  } catch (error) {
    if (error instanceof CustomError) throw error;
    handleErrorLog(error, 'servicio refreshTokenService');
    throw new CustomError('Error interno al refrescar el token.', 500);
  }
}

export async function getUsuarioByIdService(id: number): Promise<UsuarioConRolServiceResponse> {
  try {
    const usuario = await db.query.usuarioTable.findFirst({
      where: eq(usuarioTable.id_usuario, id),
      with: {
        rol: true,
      },
      columns: {
        id_usuario: true,
        correo: true,
        nombre_usuario: true,
        fecha_registro: true,
        sexo: true,
        fecha_nacimiento: true,
        id_rol: true,
        biografia: true,
        intereses: true,
        foto_perfil: true,
        telefono: true,
        ubicacion: true,
      },
    });

    if (!usuario) {
      throw new CustomError('Usuario no encontrado', 404);
    }

    const response: UsuarioConRolServiceResponse = {
      id_usuario: usuario.id_usuario,
      correo: usuario.correo,
      nombre_usuario: usuario.nombre_usuario,
      fecha_registro: new Date(usuario.fecha_registro).toISOString(),
      sexo: usuario.sexo,
      fecha_nacimiento: usuario.fecha_nacimiento ? new Date(usuario.fecha_nacimiento).toISOString() : null,
      id_rol: usuario.id_rol,
      biografia: usuario.biografia,
      intereses: usuario.intereses,
      foto_perfil: usuario.foto_perfil,
      telefono: usuario.telefono,
      ubicacion: usuario.ubicacion,
      rol: usuario.rol ? {
        id_rol: usuario.rol.id_rol,
        nombre_rol: usuario.rol.nombre_rol,
      } : null,
    };

    return response;
  } catch (error) {
    handleErrorLog(error, 'getUsuarioByIdService');
    throw error;
  }
}

export async function updateUsuarioPerfilService(
  id: number,
  data: UpdateUsuarioPerfilPayload
): Promise<UsuarioConRolServiceResponse> {
  try {
    const usuario = await db.query.usuarioTable.findFirst({
      where: eq(usuarioTable.id_usuario, id),
      with: {
        rol: true,
      },
      columns: {
        id_usuario: true,
        correo: true,
        nombre_usuario: true,
        fecha_registro: true,
        sexo: true,
        fecha_nacimiento: true,
        id_rol: true,
        biografia: true,
        intereses: true,
        foto_perfil: true,
        telefono: true,
        ubicacion: true,
      },
    });

    if (!usuario) {
      throw new CustomError('Usuario no encontrado', 404);
    }

    const updatedUsuario = await db
      .update(usuarioTable)
      .set({
        nombre_usuario: data.nombre_usuario,
        sexo: data.sexo,
        fecha_nacimiento: data.fecha_nacimiento ? new Date(data.fecha_nacimiento).toISOString() : null,
        biografia: data.biografia,
        intereses: data.intereses,
        foto_perfil: data.foto_perfil,
        telefono: data.telefono,
        ubicacion: data.ubicacion,
      })
      .where(eq(usuarioTable.id_usuario, id))
      .returning();

    if (!updatedUsuario[0]) {
      throw new CustomError('Error al actualizar el usuario', 500);
    }

    // Convertir fechas a formato ISO string
    const fechaRegistro = new Date(usuario.fecha_registro).toISOString();
    const fechaNacimiento = usuario.fecha_nacimiento ? new Date(usuario.fecha_nacimiento).toISOString() : null;

    const response: UsuarioConRolServiceResponse = {
      ...updatedUsuario[0],
      fecha_registro: fechaRegistro,
      fecha_nacimiento: fechaNacimiento,
      rol: usuario.rol ? {
        id_rol: usuario.rol.id_rol,
        nombre_rol: usuario.rol.nombre_rol,
      } : null,
    };

    return response;
  } catch (error) {
    handleErrorLog(error);
    throw error;
  }
}

export async function updateUsuarioContrasenaService(
  userId: number,
  data: { contrasena_actual: string; nueva_contrasena: string }
): Promise<void> {
  try {
    const userFromDb = await db.query.usuarioTable.findFirst({
      where: eq(usuarioTable.id_usuario, userId),
      columns: { id_usuario: true, contrasena: true }
    });

    if (!userFromDb || !userFromDb.contrasena) {
      throw new CustomError('Usuario no encontrado.', 404);
    }

    // Verificar la contraseña actual
    const contrasenaActualValida = await verifyPassword(data.contrasena_actual, userFromDb.contrasena);
    if (!contrasenaActualValida) {
      throw new CustomError('La contraseña actual es incorrecta.', 401);
    }

    // Hash de la nueva contraseña
    const nuevaContrasenaHash = await hashPassword(data.nueva_contrasena);

    // Actualizar la contraseña
    const [updatedUser] = await db.update(usuarioTable)
      .set({ contrasena: nuevaContrasenaHash })
      .where(eq(usuarioTable.id_usuario, userId))
      .returning({ id_usuario: usuarioTable.id_usuario });

    if (!updatedUser) {
      throw new CustomError('No se pudo actualizar la contraseña.', 500);
    }
  } catch (error) {
    if (error instanceof CustomError) throw error;
    handleErrorLog(error, `servicio updateUsuarioContrasenaService (userId: ${userId})`);
    throw new CustomError('Error interno al actualizar la contraseña.', 500);
  }
}