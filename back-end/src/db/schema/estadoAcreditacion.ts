import { pgTable, serial, integer, varchar, boolean } from 'drizzle-orm/pg-core';


export const estadoAcreditacionTable = pgTable('estado_acreditacion', {
    id_estado_acreditacion: serial('id_estado_acreditacion').primaryKey(),
    nombre_estado: varchar('nombre_estado', { length: 50 }).notNull(),
    descripcion: varchar('descripcion', { length: 100 }),
});

export type EstadoAcreditacion = typeof estadoAcreditacionTable.$inferSelect;
export type NewEstadoAcreditacion = typeof estadoAcreditacionTable.$inferInsert;