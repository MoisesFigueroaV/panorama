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

// Tipos para los payloads de los signers, deben coincidir con el middleware
type SignerAccessPayload = { sub: string; rol?: number };
type SignerRefreshPayload = { sub: string };

// Tipos de respuesta del servicio (deben ser compatibles con usuarioBaseResponseSchema)
type UsuarioServiceResponse = {
    id_usuario: number;
    correo: string;
    nombre_usuario: string;
    fecha_registro: Date; // El servicio devuelve Date
    sexo: string | null;
    fecha_nacimiento: Date | null; // El servicio devuelve Date
    id_rol: number | null;
};

type UsuarioConRolServiceResponse = UsuarioServiceResponse & {
    rol?: { id_rol: number; nombre_rol: string } | null;
};

const ROL_USUARIO_COMUN_ID = 2;

const seleccionColumnasUsuarioPublico = {
    id_usuario: usuarioTable.id_usuario,
    correo: usuarioTable.correo,
    nombre_usuario: usuarioTable.nombre_usuario,
    fecha_registro: usuarioTable.fecha_registro,
    sexo: usuarioTable.sexo,
    fecha_nacimiento: usuarioTable.fecha_nacimiento,
    id_rol: usuarioTable.id_rol,
};

async function hashPassword(password: string): Promise<string> {
    if (process.env.NODE_ENV === 'test') return `hashed_${password}`;
    console.warn("ADVERTENCIA DE SEGURIDAD: Usando hashing de contraseña inseguro.");
    return `dev_hashed_${password}`; // ¡¡¡REEMPLAZAR!!!
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
    if (process.env.NODE_ENV === 'test') return `hashed_${password}` === hash;
    return `dev_hashed_${password}` === hash; // ¡¡¡REEMPLAZAR!!!
}

export async function registrarUsuarioService(
  data: RegistroUsuarioPayload,
  targetRolId: number = ROL_USUARIO_COMUN_ID
): Promise<UsuarioConRolServiceResponse> {
  try {
    const existingUser = await db.query.usuarioTable.findFirst({
      where: eq(usuarioTable.correo, data.correo),
    });
    if (existingUser) {
      console.log('El correo electrónico ya está registrado.')
      throw new CustomError('El correo electrónico ya está registrado.', 409);
    }
    const contrasenaHash = await hashPassword(data.contrasena);
    const newUserPayloadForDb: DrizzleNewUsuario = {
      nombre_usuario: data.nombre_usuario,
      correo: data.correo,
      contrasena: contrasenaHash,
      id_rol: targetRolId,
      sexo: data.sexo || null,
      fecha_nacimiento: data.fecha_nacimiento || null, // Drizzle/pg maneja string a date
    };
    const [insertedUserBrief] = await db
        .insert(usuarioTable)
        .values(newUserPayloadForDb)
        .returning({ id_usuario: usuarioTable.id_usuario });
    if (!insertedUserBrief || !insertedUserBrief.id_usuario) {
      console.log('Falló la creación del perfil de usuario.')
        throw new CustomError('Falló la creación del perfil de usuario.', 500);
    }
    return getUsuarioByIdService(insertedUserBrief.id_usuario);
  } catch (error) {
    if (error instanceof CustomError) throw error;
    console.log("Error en registrar", error)
    handleErrorLog(error, 'servicio registrarUsuarioService');
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
        fecha_registro: new Date(userFromDb.fecha_registro as string),
        sexo: userFromDb.sexo,
        fecha_nacimiento: userFromDb.fecha_nacimiento ? new Date(userFromDb.fecha_nacimiento as string) : null,
        id_rol: userFromDb.id_rol,
        rol: userFromDb.rol ? { 
            id_rol: userFromDb.rol.id_rol,
            nombre_rol: userFromDb.rol.nombre_rol 
        } : null,
    };
    return { accessToken, refreshToken, usuario: usuarioParaRespuesta };
  } catch (error) {
    if (error instanceof CustomError) throw error;
    handleErrorLog(error, 'servicio loginUsuarioService');
    throw new CustomError('Error interno durante el inicio de sesión.', 500);
  }
}

export async function refreshTokenService(
  verifiedRefreshTokenPayload: { sub: string },
  jwtSignerAccess: (payload: SignerAccessPayload) => Promise<string>
): Promise<{ accessToken: string }> {
  try {
    const userIdAsNumber = parseInt(verifiedRefreshTokenPayload.sub, 10);
    if (isNaN(userIdAsNumber)) {
        throw new CustomError("Payload de token de refresco inválido (sub no es numérico).", 401);
    }
    const user = await db.query.usuarioTable.findFirst({
      where: eq(usuarioTable.id_usuario, userIdAsNumber),
      columns: { id_rol: true }
    });
    if (!user) {
      throw new CustomError('Usuario asociado al token de refresco no encontrado.', 401);
    }
    const newAccessTokenPayload: SignerAccessPayload = {
      sub: String(userIdAsNumber),
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
    const userFromDb = await db.query.usuarioTable.findFirst({
      where: eq(usuarioTable.id_usuario, id),
      columns: {
        id_usuario: true, correo: true, nombre_usuario: true,
        fecha_registro: true, sexo: true, fecha_nacimiento: true, id_rol: true,
      },
      with: { rol: true },
    });
    if (!userFromDb) {
      console.log(`Usuario con ID ${id} no encontrado.`)
      throw new CustomError(`Usuario con ID ${id} no encontrado.`, 404);
    }
    console.log("USUARIO", userFromDb)
    return {
        id_usuario: userFromDb.id_usuario,
        correo: userFromDb.correo,
        nombre_usuario: userFromDb.nombre_usuario,
        fecha_registro: new Date(userFromDb.fecha_registro as string),
        sexo: userFromDb.sexo,
        fecha_nacimiento: userFromDb.fecha_nacimiento ? new Date(userFromDb.fecha_nacimiento as string) : null,
        id_rol: userFromDb.id_rol,
        rol: userFromDb.rol ? { 
            id_rol: userFromDb.rol.id_rol,
            nombre_rol: userFromDb.rol.nombre_rol 
        } : null,
    };
  } catch (error) {
    if (error instanceof CustomError) throw error;
    console.log("ERROR AAAA", error)
    handleErrorLog(error, `servicio getUsuarioByIdService (id: ${id})`);
    throw new CustomError('Error interno al obtener el perfil del usuario.', 500);
  }
}

export async function updateUsuarioPerfilService(
  userId: number,
  data: UpdateUsuarioPerfilPayload
): Promise<UsuarioConRolServiceResponse> {
    try {
        const currentUser = await db.query.usuarioTable.findFirst({
            where: eq(usuarioTable.id_usuario, userId),
            columns: { id_usuario: true }
        });
        if (!currentUser) {
            throw new CustomError('Usuario no encontrado para actualizar.', 404);
        }
        const updatePayloadForDb: Partial<Pick<DrizzleNewUsuario, 'nombre_usuario' | 'sexo' | 'fecha_nacimiento'>> = {};
        if (data.nombre_usuario !== undefined) updatePayloadForDb.nombre_usuario = data.nombre_usuario;
        if (data.hasOwnProperty('sexo')) updatePayloadForDb.sexo = data.sexo;
        if (data.hasOwnProperty('fecha_nacimiento')) {
          updatePayloadForDb.fecha_nacimiento = data.fecha_nacimiento; // Drizzle/pg maneja string para DATE
        }
        if (Object.keys(updatePayloadForDb).length === 0) {
            return getUsuarioByIdService(userId);
        }
        const [updatedUserRaw] = await db.update(usuarioTable)
            .set(updatePayloadForDb)
            .where(eq(usuarioTable.id_usuario, userId))
            .returning({id_usuario: usuarioTable.id_usuario}); // Solo el ID
        if (!updatedUserRaw || !updatedUserRaw.id_usuario) {
            throw new CustomError('No se pudo actualizar el perfil del usuario.', 500);
        }
        return getUsuarioByIdService(updatedUserRaw.id_usuario);
    } catch (error) {
        if (error instanceof CustomError) throw error;
        handleErrorLog(error, `servicio updateUsuarioPerfilService (userId: ${userId})`);
        throw new CustomError('Error interno al actualizar el perfil.', 500);
    }
}