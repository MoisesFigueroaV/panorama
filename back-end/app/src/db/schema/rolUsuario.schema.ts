import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const rolUsuario = pgTable('rol_usuario', {
  id: serial('id').primaryKey(),
  nombre: text('nombre').notNull(),
  descripcion: text('descripcion'),
});