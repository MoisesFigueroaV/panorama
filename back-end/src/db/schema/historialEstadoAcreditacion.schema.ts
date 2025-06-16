// src/db/schema/historialEstadoAcreditacion.schema.ts
import { pgTable, integer, date, text } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { organizadorTable } from './organizador.schema';
import { estadoAcreditacionTable } from './estadoAcreditacion.schema';
import { usuarioTable } from './usuario.schema';

export const historialEstadoAcreditacionTable = pgTable('historial_estado_acreditacion', {
  // La tabla usa una clave primaria compuesta de id_organizador e id_estado_acreditacion
  id_organizador: integer('id_organizador')
    .references(() => organizadorTable.id_organizador)
    .notNull(),
  id_estado_acreditacion: integer('id_estado_acreditacion')
    .references(() => estadoAcreditacionTable.id_estado_acreditacion)
    .notNull(),
  fecha_cambio: date('fecha_cambio').default(sql`CURRENT_DATE`).notNull(),
  id_admin_responsable: integer('id_admin_responsable')
    .references(() => usuarioTable.id_usuario),
  notas_cambio: text('notas_cambio'),
}, (table) => ({
  // Definimos la clave primaria compuesta
  pk: sql`PRIMARY KEY (${table.id_organizador}, ${table.id_estado_acreditacion})`
}));

export type HistorialEstadoAcreditacion = typeof historialEstadoAcreditacionTable.$inferSelect;
export type NewHistorialEstadoAcreditacion = typeof historialEstadoAcreditacionTable.$inferInsert;