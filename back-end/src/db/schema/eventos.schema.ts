import { pgTable, serial, varchar, text, timestamp, integer, boolean, date, numeric } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { organizadorTable } from './organizador.schema';
import { categoriaEventoTable } from './categoriaEvento.schema';

export const eventoTable = pgTable('evento', {
  id_evento: serial('id_evento').primaryKey(),
  id_organizador: integer('id_organizador').references(() => organizadorTable.id_organizador).notNull(),
  id_categoria: integer('id_categoria').references(() => categoriaEventoTable.id_categoria),
  
  titulo: varchar('titulo', { length: 150 }).notNull(),
  descripcion: text('descripcion'), // 'text' es mejor que varchar(1000)
  fecha_inicio: date('fecha_inicio').notNull(), // Tu SQL usa DATE, no TIMESTAMP
  fecha_fin: date('fecha_fin').notNull(),       // Tu SQL usa DATE
  fecha_registro: date('fecha_registro').default(sql`CURRENT_DATE`),
  
  ubicacion: varchar('ubicacion', { length: 250 }),
  latitud: numeric('latitud', { precision: 9, scale: 6 }),
  longitud: numeric('longitud', { precision: 9, scale: 6 }),
  
  imagen: varchar('imagen', { length: 250 }),
  capacidad: integer('capacidad').notNull(),

  // La columna id_estado_evento no está en tu SQL de evento, pero sí en el historial.
  // Similar al organizador, es MUCHO mejor tenerla aquí.
  // Si no la quieres añadir, debemos quitarla del schema.
  // Recomiendo AÑADIRLA a tu tabla `evento` en Supabase.
  id_estado_evento: integer('id_estado_evento'),
});