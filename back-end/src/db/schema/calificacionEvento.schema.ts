import { pgTable, serial, integer, varchar, date } from 'drizzle-orm/pg-core';
import { usuarioTable } from './usuario.schema';
import { eventoTable } from './evento.schema';

export const calificacionEventoTable = pgTable('calificacion_evento', {
  id_calificacion: serial('id_calificacion').primaryKey(),
  id_usuario: integer('id_usuario').references(() => usuarioTable.id_usuario),
  id_evento: integer('id_evento').references(() => eventoTable.id_evento),
  puntuacion: integer('puntuacion'),
  comentario: varchar('comentario', { length: 1000 }),
  fecha: date('fecha').notNull(),
});

export type CalificacionEvento = typeof calificacionEventoTable.$inferSelect;
export type NewCalificacionEvento = typeof calificacionEventoTable.$inferInsert; 