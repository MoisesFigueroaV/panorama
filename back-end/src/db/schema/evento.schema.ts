import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const eventoTable = pgTable('eventos', {
  id_evento: serial('id_evento').primaryKey(),
  id_organizador: integer('id_organizador').notNull(),
  titulo: text('titulo').notNull(),
  descripcion: text('descripcion'),
  fecha_inicio: timestamp('fecha_inicio').notNull(),
  fecha_fin: timestamp('fecha_fin').notNull(),
  imagen_url: text('imagen_url'),
  ubicacion: text('ubicacion').notNull(),
  capacidad: integer('capacidad').notNull(),
  categorias: text('categorias').notNull(), // Puedes guardar como string separado por comas o JSON
  creado_en: timestamp('creado_en').defaultNow(),
  actualizado_en: timestamp('actualizado_en').defaultNow(),
});