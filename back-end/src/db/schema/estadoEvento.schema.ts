import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';
export const estadoEventoTable = pgTable('estado_evento', {
  id_estado_evento: serial('id_estado_evento').primaryKey(),
  nombre_estado: varchar('nombre_estado', { length: 50 }).notNull().unique(),
  descripcion: varchar('descripcion', { length: 20 }), // Largo 20 es muy corto, ¿seguro?
});