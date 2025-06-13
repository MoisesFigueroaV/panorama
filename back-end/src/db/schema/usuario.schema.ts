// src/db/schema/usuario.schema.ts
import { pgTable, serial, integer, varchar, date, char } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm'; 
import { relations } from 'drizzle-orm';
import { rolUsuarioTable } from './rolUsuario.schema';
import { organizadorTable } from './organizador.schema';

export const usuarioTable = pgTable('usuario', {
  id_usuario: serial('id_usuario').primaryKey(),
  id_rol: integer('id_rol').references(() => rolUsuarioTable.id_rol), 
  correo: varchar('correo', { length: 150 }).notNull().unique(),
  nombre_usuario: varchar('nombre_usuario', { length: 100 }).notNull(),
  contrasena: varchar('contrasena', { length: 100 }).notNull(), 
  fecha_registro: date('fecha_registro').default(sql`CURRENT_DATE`).notNull(),
  sexo: char('sexo', { length: 1 }), 
  fecha_nacimiento: date('fecha_nacimiento'), 
});

export const usuarioRelations = relations(usuarioTable, ({ one }) => ({
  rol: one(rolUsuarioTable, {
    fields: [usuarioTable.id_rol],
    references: [rolUsuarioTable.id_rol],
  }),
  organizador: one(organizadorTable, {
    fields: [usuarioTable.id_usuario],
    references: [organizadorTable.id_usuario],
  }),
}));

export type Usuario = typeof usuarioTable.$inferSelect;
export type NewUsuario = typeof usuarioTable.$inferInsert;