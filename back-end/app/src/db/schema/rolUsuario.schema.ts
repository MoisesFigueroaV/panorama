// src/db/schema/rolUsuario.schema.ts
import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

// Definición de la tabla 'rol_usuario' para Drizzle
export const rolUsuarioTable = pgTable('rol_usuario', {
  id_rol: serial('id_rol').primaryKey(), // Columna 'id_rol', tipo SERIAL, clave primaria
  nombre_rol: varchar('nombre_rol', { length: 50 }).notNull().unique(), // Columna 'nombre_rol', VARCHAR(50), no nulo y único
});

// Tipos inferidos por Drizzle para usar en tu aplicación (fuertemente recomendado)
export type RolUsuario = typeof rolUsuarioTable.$inferSelect; // Tipo para los datos cuando se leen de la DB
export type NewRolUsuario = typeof rolUsuarioTable.$inferInsert; // Tipo para los datos cuando se insertan en la DB