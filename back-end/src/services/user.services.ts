import { sql } from '../db'
import bcrypt from 'bcrypt'

// Buscar usuario por correo
export async function getUserByEmail(email: string) {
  const [user] = await sql`
    SELECT * FROM usuario WHERE correo = ${email}
  `
  return user
}

// Crear usuario nuevo
export async function createUser({
  correo,
  nombre_usuario,
  contrasena,
  id_rol,
  sexo,
  fecha_nacimiento,
}: {
  correo: string
  nombre_usuario: string
  contrasena: string
  id_rol: number
  sexo?: string
  fecha_nacimiento?: string
}) {
  const hashedPassword = await bcrypt.hash(contrasena, 10)

  const [user] = await sql`
    INSERT INTO usuario (
      correo,
      nombre_usuario,
      contrasena,
      id_rol,
      sexo,
      fecha_nacimiento
    )
    VALUES (
      ${correo},
      ${nombre_usuario},
      ${hashedPassword},
      ${id_rol},
      ${sexo},
      ${fecha_nacimiento}
    )
    RETURNING *
  `

  return user
}

// Verificar credenciales (login)
export async function verifyUser(email: string, password: string) {
  const user = await getUserByEmail(email)
  if (!user) return null

  const isValid = await bcrypt.compare(password, user.contrasena)
  if (!isValid) return null

  return user
}
