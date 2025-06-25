import { pgTable, integer, timestamp } from 'drizzle-orm/pg-core';
import { notificacionTable } from './notificaciones.schema';
import { estadoNotificacionTable } from './estado_notificacion.schema';

export const historialEstadoNotificacionTable = pgTable('historial_estado_notificacion', {
  id_notificacion: integer('id_notificacion')
    .references(() => notificacionTable.id_notificacion)
    .notNull(),
  id_estado_notificacion: integer('id_estado_notificacion')
    .references(() => estadoNotificacionTable.id_estado_notificacion)
    .notNull(),
  fecha_cambio: timestamp('fecha_cambio').defaultNow().notNull(),
});

export type HistorialEstadoNotificacion = typeof historialEstadoNotificacionTable.$inferSelect;
export type NewHistorialEstadoNotificacion = typeof historialEstadoNotificacionTable.$inferInsert;
