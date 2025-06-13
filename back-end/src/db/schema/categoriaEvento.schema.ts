import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';
export const categoriaEventoTable = pgTable('categoria_evento', {
  id_categoria: serial('id_categoria').primaryKey(),
  nombre_categoria: varchar('nombre_categoria', { length: 100 }).notNull().unique(),
});