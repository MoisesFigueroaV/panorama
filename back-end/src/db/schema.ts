import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Aquí puedes definir tus tablas usando pgTable
// Este es un ejemplo básico que puedes modificar según tus necesidades
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}); 