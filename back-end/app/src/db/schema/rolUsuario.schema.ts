// src/db/schema/rolUsuario.schema.ts
import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const rolUsuarioTable = pgTable('rol_usuario', {
  id_rol: serial('id_rol').primaryKey(), 
  nombre_rol: varchar('nombre_rol', { length: 50 }).notNull().unique(), 
});

export type RolUsuario = typeof rolUsuarioTable.$inferSelect; 
export type NewRolUsuario = typeof rolUsuarioTable.$inferInsert; 