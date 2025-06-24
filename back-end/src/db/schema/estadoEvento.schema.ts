// src/db/schema/estadoEvento.schema.ts
import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const estadoEventoTable = pgTable('estado_evento', {
  id_estado_evento: serial('id_estado_evento').primaryKey(),
  nombre_estado: varchar('nombre_estado', { length: 50 }).notNull().unique(),
  descripcion: varchar('descripcion', { length: 100 }),
});

export type EstadoEvento = typeof estadoEventoTable.$inferSelect;
export type NewEstadoEvento = typeof estadoEventoTable.$inferInsert;
