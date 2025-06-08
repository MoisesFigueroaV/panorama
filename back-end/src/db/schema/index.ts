import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export * from './rolUsuario.schema';
export * from './usuario.schema';
export * from './organizador.schema';
export * from './historialAcreditacion.schema';
export * from './estadoAcreditacion.schema';