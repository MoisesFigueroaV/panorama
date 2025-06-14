// src/db/schema/evento.schema.ts
import { pgTable, serial, integer, varchar, text, date, numeric, timestamp } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { organizadorTable } from './organizador.schema';
import { categoriaEventoTable } from './categoriaEvento.schema';
import { estadoEventoTable } from './estadoEvento.schema';

export const eventoTable = pgTable('evento', {
  id_evento: serial('id_evento').primaryKey(),
  id_organizador: integer('id_organizador').references(() => organizadorTable.id_organizador).notNull(),
  id_categoria: integer('id_categoria').references(() => categoriaEventoTable.id_categoria),
  titulo: varchar('titulo', { length: 150 }).notNull(),
  descripcion: text('descripcion'), // text es más flexible que varchar(1000)
  fecha_inicio: date('fecha_inicio').notNull(),
  fecha_fin: date('fecha_fin').notNull(),
  fecha_registro: date('fecha_registro').default(sql`CURRENT_DATE`),
  ubicacion: varchar('ubicacion', { length: 250 }),
  latitud: numeric('latitud', { precision: 9, scale: 6 }),
  longitud: numeric('longitud', { precision: 9, scale: 6 }),
  imagen: varchar('imagen', { length: 250 }),
  capacidad: integer('capacidad').notNull(),
  id_estado_evento: integer('id_estado_evento').references(() => estadoEventoTable.id_estado_evento),
});

// Relaciones para la tabla de eventos
export const eventoRelations = relations(eventoTable, ({ one }) => ({
  organizador: one(organizadorTable, {
    fields: [eventoTable.id_organizador],
    references: [organizadorTable.id_organizador],
  }),
  categoria: one(categoriaEventoTable, {
    fields: [eventoTable.id_categoria],
    references: [categoriaEventoTable.id_categoria],
  }),
  estado: one(estadoEventoTable, {
    fields: [eventoTable.id_estado_evento],
    references: [estadoEventoTable.id_estado_evento],
  }),
}));

export type Evento = typeof eventoTable.$inferSelect;
export type NewEvento = typeof eventoTable.$inferInsert;
