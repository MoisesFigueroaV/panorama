import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { usuarioTable } from './usuario.schema';
import { eventoTable } from './evento.schema';

export const notificacionTable = pgTable('notificacion', {
  id_notificacion: serial('id_notificacion').primaryKey(),
  id_usuario: integer('id_usuario').references(() => usuarioTable.id_usuario).notNull(),
  id_evento: integer('id_evento').references(() => eventoTable.id_evento),
  mensaje: text('mensaje').notNull(),
  fecha_envio: timestamp('fecha_envio').defaultNow().notNull(),
});
export type Notificacion = typeof notificacionTable.$inferSelect;
export type NewNotificacion = typeof notificacionTable.$inferInsert;
