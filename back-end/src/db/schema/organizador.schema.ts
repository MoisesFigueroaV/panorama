import { pgTable, serial, integer, varchar, boolean, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { usuarioTable } from './usuario.schema';
import { estadoAcreditacionTable } from './estadoAcreditacion.schema'; // Asegúrate que esté importado

export const organizadorTable = pgTable('organizador', {
    id_organizador: serial('id_organizador').primaryKey(),
    id_usuario: integer('id_usuario').references(() => usuarioTable.id_usuario).unique().notNull(),
    nombre_organizacion: varchar('nombre_organizacion', { length: 150 }).notNull(),
    descripcion: text('descripcion'), // Coincide con el SQL
    documento_acreditacion: varchar('documento_acreditacion', { length: 250 }),
    acreditado: boolean('acreditado').default(true),
    
    // Columnas que tu frontend usa y que ya deben estar en la DB
    ubicacion: varchar('ubicacion', { length: 250 }),
    anio_fundacion: integer('anio_fundacion'),
    sitio_web: varchar('sitio_web', { length: 250 }),
    imagen_portada: varchar('imagen_portada', { length: 250 }),
    logo_organizacion: varchar('logo_organizacion', { length: 250 }),
    
    // Nuevos campos agregados
    tipo_organizacion: varchar('tipo_organizacion', { length: 50 }),
    rut_organizacion: varchar('rut_organizacion', { length: 20 }),
    telefono_organizacion: varchar('telefono_organizacion', { length: 20 }),
    
    // La nueva y eficiente columna de estado
    id_estado_acreditacion_actual: integer('id_estado_acreditacion_actual')
        .references(() => estadoAcreditacionTable.id_estado_acreditacion)
});

// Relaciones que ahora funcionarán perfectamente
export const organizadorRelations = relations(organizadorTable, ({ one }) => ({
    usuario: one(usuarioTable, {
        fields: [organizadorTable.id_usuario],
        references: [usuarioTable.id_usuario],
    }),
    estadoAcreditacionActual: one(estadoAcreditacionTable, {
        fields: [organizadorTable.id_estado_acreditacion_actual],
        references: [estadoAcreditacionTable.id_estado_acreditacion],
    })
}));

export type Organizador = typeof organizadorTable.$inferSelect;
export type NewOrganizador = typeof organizadorTable.$inferInsert;