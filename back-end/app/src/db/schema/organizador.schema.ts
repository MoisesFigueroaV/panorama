// src/db/schema/organizador.schema.ts
import { pgTable, serial, integer, varchar, boolean } from 'drizzle-orm/pg-core';
import { usuarioTable } from './usuario.schema'; 

export const organizadorTable = pgTable('organizador', {
  id_organizador: serial('id_organizador').primaryKey(),
  id_usuario: integer('id_usuario').references(() => usuarioTable.id_usuario).unique(), 
  nombre_organizacion: varchar('nombre_organizacion', { length: 150 }).notNull(),
  descripcion: varchar('descripcion', { length: 500 }), 
  documento_acreditacion: varchar('documento_acreditacion', { length: 250 }),
  acreditado: boolean('acreditado').default(false), 
});

export type Organizador = typeof organizadorTable.$inferSelect;
export type NewOrganizador = typeof organizadorTable.$inferInsert;