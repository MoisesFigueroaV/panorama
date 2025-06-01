// src/db/schema/usuario.schema.ts
import { pgTable, serial, integer, varchar, date, char } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm'; // Para usar funciones SQL como CURRENT_DATE
import { relations } from 'drizzle-orm';
import { rolUsuarioTable } from './rolUsuario.schema'; // Importa la tabla de roles para la FK

// Definición de la tabla 'usuario' para Drizzle
export const usuarioTable = pgTable('usuario', {
  id_usuario: serial('id_usuario').primaryKey(),
  // Clave foránea a 'rol_usuario'. Drizzle infiere 'NOT NULL' si no se especifica '.nullable()'.
  // Si 'id_rol' PUEDE ser nulo según tu DDL (lo cual es común si un usuario se registra y luego se le asigna rol), usa:
  // id_rol: integer('id_rol').references(() => rolUsuarioTable.id_rol).nullable(),
  id_rol: integer('id_rol').references(() => rolUsuarioTable.id_rol), // Asumiendo que siempre tendrá un rol al ser insertado o la FK permite NULL
  correo: varchar('correo', { length: 150 }).notNull().unique(),
  nombre_usuario: varchar('nombre_usuario', { length: 100 }).notNull(),
  contrasena: varchar('contrasena', { length: 100 }).notNull(), // Aquí se guardará el HASH de la contraseña
  fecha_registro: date('fecha_registro').default(sql`CURRENT_DATE`).notNull(),
  sexo: char('sexo', { length: 1 }), // Ejemplo: 'M', 'F', 'O' (Otro). Puede ser nullable si no es obligatorio.
  fecha_nacimiento: date('fecha_nacimiento'), // Puede ser nullable
});

export const usuarioRelations = relations(usuarioTable, ({ one }) => ({
  rol: one(rolUsuarioTable, {
    fields: [usuarioTable.id_rol],
    references: [rolUsuarioTable.id_rol],
  }),
}));

// Tipos inferidos por Drizzle
export type Usuario = typeof usuarioTable.$inferSelect;
export type NewUsuario = typeof usuarioTable.$inferInsert;