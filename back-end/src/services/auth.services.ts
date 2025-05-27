// services/auth.service.ts
import { pool } from '../utils/db'
import { sign } from 'jsonwebtoken'

export class AuthService {
  async register({ correo, nombre_usuario, contrasena, sexo, fecha_nacimiento, id_rol = 2 }) {
    // Validar si el correo ya existe
    const existing = await sql`SELECT * FROM usuario WHERE correo = ${correo}`
    if (existing.length > 0) throw new Error('Correo ya registrado')

    const result = await sql`
      INSERT INTO usuario (correo, nombre_usuario, contrasena, sexo, fecha_nacimiento, id_rol)
      VALUES (${correo}, ${nombre_usuario}, ${contrasena}, ${sexo}, ${fecha_nacimiento}, ${id_rol})
      RETURNING id_usuario, correo, nombre_usuario, id_rol
    `
    return result[0]
  }

  async login(correo: string, contrasena: string) {
    const result = await sql`
      SELECT id_usuario, nombre_usuario, id_rol FROM usuario
      WHERE correo = ${correo} AND contrasena = ${contrasena}
    `
    if (result.length === 0) throw new Error('Credenciales inválidas')

    const user = result[0]
    const token = sign(
      {
        id_usuario: user.id_usuario,
        id_rol: user.id_rol
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    )

    return { user, token }
  }
}
