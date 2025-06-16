import { db } from '../../db/drizzle';
import {
  organizadorTable, type Organizador as DrizzleOrganizador, usuarioTable
} from '../../db/schema';
import { ROLES_IDS } from '../../config/constants';
import { eq } from 'drizzle-orm';
import { CustomError } from '../../utils/errors';
import type {
  RegistroCompletoOrganizadorApiPayload,
  CreateOrganizadorPerfilApiPayload,
  UpdateOrganizadorPerfilApiPayload
} from './organizador.types';
import type { AppSession } from '../../middleware/auth.middleware';

// Registro completo: usuario + organizador
export async function registrarUsuarioYCrearPerfilOrganizadorService(data: RegistroCompletoOrganizadorApiPayload): Promise<{ id_organizador: number }> {
  const { correo, contrasena, nombre_usuario, sexo, fecha_nacimiento, ...organizadorData } = data;

  const existingUser = await db.query.usuarioTable.findFirst({ where: eq(usuarioTable.correo, correo) });
  if (existingUser) throw new CustomError('El correo ya está registrado.', 409);

  const [newUser] = await db.insert(usuarioTable).values({
    correo,
    nombre_usuario,
    contrasena,  // Aquí iría el hash
    id_rol: ROLES_IDS.ORGANIZADOR,
    sexo: sexo ?? null,
    fecha_nacimiento: fecha_nacimiento ?? null
  }).returning();

  if (!newUser) throw new CustomError('Error creando el usuario.', 500);

  const [newOrganizador] = await db.insert(organizadorTable).values({
    id_usuario: newUser.id_usuario,
    ...organizadorData
  }).returning();

  if (!newOrganizador) throw new CustomError('Error creando el perfil de organizador.', 500);
  return { id_organizador: newOrganizador.id_organizador };
}

// Crear perfil cuando el usuario ya está autenticado
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

export async function updateOrganizadorPerfilService(organizadorId: number, data: UpdateOrganizadorPerfilApiPayload, session: NonNullable<AppSession>): Promise<DrizzleOrganizador> {
  const [updated] = await db.update(organizadorTable)
    .set(data)
    .where(eq(organizadorTable.id_organizador, organizadorId))
    .returning();

  if (!updated) throw new CustomError('No se pudo actualizar el perfil.', 500);
  return updated;
}
