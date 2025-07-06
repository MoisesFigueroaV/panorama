import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { usuarioTable } from './usuario.schema';
import { eventoTable } from './evento.schema';

export const notificacionTable = pgTable('notificacion', {
  id_notificacion: serial('id_notificacion').primaryKey(),
  id_usuario: integer('id_usuario').references(() => usuarioTable.id_usuario).notNull(),
  mensaje: text('mensaje').notNull(),
  fecha_envio: timestamp('fecha_envio').defaultNow().notNull(),
  tipo: text('tipo').default('sistema').notNull(),
});
export type Notificacion = typeof notificacionTable.$inferSelect;
export type NewNotificacion = typeof notificacionTable.$inferInsert;
