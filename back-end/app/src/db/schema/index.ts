import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Tabla de ejemplo para probar
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Importar otros schemas si existen
export * from './rolUsuario.schema';