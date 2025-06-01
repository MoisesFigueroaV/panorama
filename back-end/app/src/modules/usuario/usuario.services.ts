// src/modules/usuario/usuario.service.ts
import { db } from '../../db/drizzle';
import {
  usuarioTable,
  type Usuario,
  type NewUsuario as DrizzleNewUsuario,
  // rolUsuarioTable, // No se usa directamente aquí si `with` trae el objeto rol
} from '../../db/schema';
import { eq } from 'drizzle-orm'; // `and`, `desc` no se usaban, los quité
import { CustomError, handleErrorLog } from '../../utils/errors'; // handleErrorLog sí se usa
import type {
  RegistroUsuarioPayload,
  LoginUsuarioPayload,
  UpdateUsuarioPerfilPayload,
} from './usuario.types';
// import type { JwtPayload } from '../../middleware/auth.middleware'; // Ya no es JwtPayload, sino el tipo de los signers

const ROL_USUARIO_COMUN_ID = 2;

const seleccionCamposUsuarioPublico = {
    id_usuario: usuarioTable.id_usuario,
    correo: usuarioTable.correo,
    nombre_usuario: usuarioTable.nombre_usuario,
    fecha_registro: usuarioTable.fecha_registro,
    sexo: usuarioTable.sexo,
    fecha_nacimiento: usuarioTable.fecha_nacimiento,
    id_rol: usuarioTable.id_rol,
};

type PublicUsuario = Omit<Usuario, 'contrasena' | 'fecha_registro' | 'fecha_nacimiento'> & {
    fecha_registro: Date;
    fecha_nacimiento: Date | null;
};
type PublicUsuarioConRol = Omit<Usuario, 'contrasena' | 'id_rol' | 'fecha_registro' | 'fecha_nacimiento'> & {
    id_rol: number | null;
    fecha_registro: Date;
    fecha_nacimiento: Date | null;
    rol?: { id_rol: number; nombre_rol: string } | null; // Permitir null para rol
};

// Extender el tipo NewUsuario para aceptar Date
type NewUsuario = Omit<DrizzleNewUsuario, 'fecha_nacimiento'> & {
  fecha_nacimiento?: Date | null;
};

async function hashPassword(password: string): Promise<string> {
    if (process.env.NODE_ENV === 'test') return `hashed_${password}`;
    console.warn("ADVERTENCIA: Usando hashing de contraseña inseguro para desarrollo.");
    return `dev_hashed_${password}`;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
    if (process.env.NODE_ENV === 'test') return `hashed_${password}` === hash;
    return `dev_hashed_${password}` === hash;
}

export async function registrarUsuarioService(
  data: RegistroUsuarioPayload,
  targetRolId: number = ROL_USUARIO_COMUN_ID
): Promise<PublicUsuario> {
  try {
    const existingUser = await db.query.usuarioTable.findFirst({
      where: eq(usuarioTable.correo, data.correo),
    });
    if (existingUser) {
      throw new CustomError('El correo electrónico ya está registrado.', 409);
    }

    const contrasenaHash = await hashPassword(data.contrasena);

    const newUserPayload: DrizzleNewUsuario = {
      nombre_usuario: data.nombre_usuario,
      correo: data.correo,
      contrasena: contrasenaHash,
      id_rol: targetRolId,
      sexo: data.sexo || null,
      fecha_nacimiento: data.fecha_nacimiento || null,
    };

    const [insertedUser] = await db
        .insert(usuarioTable)
        .values(newUserPayload)
        .returning(seleccionCamposUsuarioPublico);

    if (!insertedUser) {
        throw new CustomError('Falló la creación del perfil de usuario.', 500);
    }
    
    return {
        ...insertedUser,
        // Drizzle devuelve string para DATE si no se configura el driver pg para parsear fechas.
        // Por eso, convertimos explícitamente para que coincida con el tipo PublicUsuario.
        fecha_registro: new Date(insertedUser.fecha_registro as string),
        fecha_nacimiento: insertedUser.fecha_nacimiento ? new Date(insertedUser.fecha_nacimiento as string) : null,
    };

  } catch (error) {
    if (error instanceof CustomError) throw error;
    handleErrorLog(error, 'servicio registrarUsuarioService');
    throw new CustomError('Error interno durante el registro.', 500);
  }
}

export async function loginUsuarioService(
  payload: LoginUsuarioPayload,
  jwtSigners: {
    access: (payload: { sub: string; rol?: number }) => Promise<string>, // payload.sub es string
    refresh: (payload: { sub: string }) => Promise<string>             // payload.sub es string
  }
): Promise<{ accessToken: string; refreshToken: string; usuario: PublicUsuarioConRol }> {
  try {
    const userWithPasswordAndRol = await db.query.usuarioTable.findFirst({
      where: eq(usuarioTable.correo, payload.correo),
      with: {
        rol: true // Seleccionar todas las columnas del rol
      }
    });

    if (!userWithPasswordAndRol || !userWithPasswordAndRol.contrasena) {
      throw new CustomError('Credenciales inválidas.', 401);
    }

    const contrasenaValida = await verifyPassword(payload.contrasena, userWithPasswordAndRol.contrasena);
    if (!contrasenaValida) {
      throw new CustomError('Credenciales inválidas.', 401);
    }

    const jwtAccessPayload = {
      sub: String(userWithPasswordAndRol.id_usuario), // Convertir id_usuario (number) a string para 'sub'
      ...(userWithPasswordAndRol.id_rol !== null && typeof userWithPasswordAndRol.id_rol === 'number' && { rol: userWithPasswordAndRol.id_rol }),
    };

    const jwtRefreshPayload = {
        sub: String(userWithPasswordAndRol.id_usuario) // Convertir id_usuario (number) a string para 'sub'
    };

    const accessToken = await jwtSigners.access(jwtAccessPayload);
    const refreshToken = await jwtSigners.refresh(jwtRefreshPayload);

    const usuarioPublico: PublicUsuarioConRol = {
        id_usuario: userWithPasswordAndRol.id_usuario,
        correo: userWithPasswordAndRol.correo,
        nombre_usuario: userWithPasswordAndRol.nombre_usuario,
        fecha_registro: new Date(userWithPasswordAndRol.fecha_registro as string),
        sexo: userWithPasswordAndRol.sexo,
        fecha_nacimiento: userWithPasswordAndRol.fecha_nacimiento ? new Date(userWithPasswordAndRol.fecha_nacimiento as string) : null,
        id_rol: userWithPasswordAndRol.id_rol,
        rol: userWithPasswordAndRol.rol ? { 
            id_rol: userWithPasswordAndRol.rol.id_rol,
            nombre_rol: userWithPasswordAndRol.rol.nombre_rol 
        } : null,
    };

    return {
      accessToken,
      refreshToken,
      usuario: usuarioPublico,
    };
  } catch (error) {
    if (error instanceof CustomError) throw error;
    handleErrorLog(error, 'servicio loginUsuarioService');
    throw new CustomError('Error interno durante el inicio de sesión.', 500);
  }
}

export async function refreshTokenService(
  // verifiedRefreshTokenPayload.sub vendrá como string desde el middleware
  verifiedRefreshTokenPayload: { sub: string },
  jwtSignerAccess: (payload: { sub: string; rol?: number }) => Promise<string> // payload.sub es string
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

    const newAccessTokenPayload = {
      sub: String(userIdAsNumber), // Firmar con sub como string
      ...(user.id_rol !== null && typeof user.id_rol === 'number' && { rol: user.id_rol }),
    };

    const accessToken = await jwtSignerAccess(newAccessTokenPayload);
    return { accessToken };

  } catch (error) {
    if (error instanceof CustomError) throw error;
    handleErrorLog(error, 'servicio refreshTokenService');
    throw new CustomError('Error interno al refrescar el token.', 500);
  }
}

export async function getUsuarioByIdService(id: number): Promise<PublicUsuarioConRol> {
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
      throw new CustomError(`Usuario con ID ${id} no encontrado.`, 404);
    }
    
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
    handleErrorLog(error, `servicio getUsuarioByIdService (id: ${id})`);
    throw new CustomError('Error interno al obtener el perfil del usuario.', 500);
  }
}

export async function updateUsuarioPerfilService(
  userId: number, // Viene como número desde la ruta (currentSession.subAsNumber)
  data: UpdateUsuarioPerfilPayload
): Promise<PublicUsuario> {
    try {
        const currentUser = await db.query.usuarioTable.findFirst({
            where: eq(usuarioTable.id_usuario, userId),
            columns: { id_usuario: true }
        });
        if (!currentUser) {
            throw new CustomError('Usuario no encontrado para actualizar.', 404);
        }

        const updatePayloadForDb: Partial<DrizzleNewUsuario> = {};
        if (data.nombre_usuario !== undefined) updatePayloadForDb.nombre_usuario = data.nombre_usuario;
        if (data.hasOwnProperty('sexo')) updatePayloadForDb.sexo = data.sexo;
        if (data.hasOwnProperty('fecha_nacimiento')) {
          updatePayloadForDb.fecha_nacimiento = data.fecha_nacimiento || null;
        }
        
        if (Object.keys(updatePayloadForDb).length === 0) {
            const userToReturn = await getUsuarioByIdService(userId);
            const { rol, ...publicUserSinRolObject } = userToReturn;
            return publicUserSinRolObject as PublicUsuario;
        }

        const [updatedUserRaw] = await db.update(usuarioTable)
            .set(updatePayloadForDb)
            .where(eq(usuarioTable.id_usuario, userId))
            .returning(seleccionCamposUsuarioPublico);
        
        if (!updatedUserRaw) {
            throw new CustomError('No se pudo actualizar el perfil del usuario.', 500);
        }
        
        return {
            ...updatedUserRaw,
            fecha_registro: new Date(updatedUserRaw.fecha_registro as string),
            fecha_nacimiento: updatedUserRaw.fecha_nacimiento ? new Date(updatedUserRaw.fecha_nacimiento as string) : null,
        };
    } catch (error) {
        if (error instanceof CustomError) throw error;
        handleErrorLog(error, `servicio updateUsuarioPerfilService (userId: ${userId})`);
        throw new CustomError('Error interno al actualizar el perfil.', 500);
    }
}