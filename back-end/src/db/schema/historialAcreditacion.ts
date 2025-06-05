import { pgTable, serial, integer, varchar, date, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { estadoAcreditacionTable } from './estadoAcreditacion';
import { organizadorTable } from './organizador.schema';

export const historialAcreditacionTable = pgTable('historial_acreditacion', {
    id_historial_acreditacion: serial('id_historial_acreditacion').primaryKey(),
    id_organizador: integer('id_organizador').references(() => organizadorTable.id_organizador),
    id_estado_acreditacion: integer('id_estado_acreditacion').references(() => estadoAcreditacionTable.id_estado_acreditacion),
    fecha_acreditacion: date('fecha_acreditacion').default(sql`CURRENT_DATE`).notNull(),
});

export type HistorialAcreditacion = typeof historialAcreditacionTable.$inferSelect;
export type NewHistorialAcreditacion = typeof historialAcreditacionTable.$inferInsert;