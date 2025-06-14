// src/db/schema/historialEstadoAcreditacion.schema.ts
import { pgTable, integer, date, serial, varchar, text } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { organizadorTable } from './organizador.schema';
import { estadoAcreditacionTable } from './estadoAcreditacion.schema';
import { usuarioTable } from './usuario.schema';

export const historialEstadoAcreditacionTable = pgTable('historial_estado_acreditacion', {
  id_historial_acreditacion: serial('id_historial_acreditacion').primaryKey(), // PK simple
  id_organizador: integer('id_organizador').references(() => organizadorTable.id_organizador).notNull(),
  id_estado_acreditacion: integer('id_estado_acreditacion').references(() => estadoAcreditacionTable.id_estado_acreditacion).notNull(),
  fecha_cambio: date('fecha_cambio').default(sql`CURRENT_DATE`).notNull(),
  id_admin_responsable: integer('id_admin_responsable').references(() => usuarioTable.id_usuario), // Puede ser null si el primer estado es automático
  notas_cambio: text('notas_cambio'), // Usar text para notas más largas
});

export type HistorialEstadoAcreditacion = typeof historialEstadoAcreditacionTable.$inferSelect;
export type NewHistorialEstadoAcreditacion = typeof historialEstadoAcreditacionTable.$inferInsert;