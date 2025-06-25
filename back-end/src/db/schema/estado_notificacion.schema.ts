import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const estadoNotificacionTable = pgTable('estado_notificacion', {
  id_estado_notificacion: serial('id_estado_notificacion').primaryKey(),
  nombre_estado: text('nombre_estado').notNull().unique(),
  descripcion: text('descripcion'),
});

export type EstadoNotificacion = typeof estadoNotificacionTable.$inferSelect;
export type NewEstadoNotificacion = typeof estadoNotificacionTable.$inferInsert;
