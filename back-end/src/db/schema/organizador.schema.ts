// src/db/schema/organizador.schema.ts
import { pgTable, serial, integer, varchar, boolean, text, jsonb, PgColumn, PgTableWithColumns } from 'drizzle-orm/pg-core'; // Añadido text, jsonb
import { usuarioTable } from './usuario.schema';
import { estadoAcreditacionTable } from './estadoAcreditacion.schema';

// Define tus IDs de estado aquí o impórtalos
export const ID_ESTADO_ACREDITACION_PENDIENTE = 1;
export const ID_ESTADO_ACREDITACION_APROBADO = 2; // AJUSTA ESTOS VALORES A LOS IDs REALES DE TU DB

export const organizadorTable = pgTable('organizador', {
  id_organizador: serial('id_organizador').primaryKey(),
  id_usuario: integer('id_usuario').references(() => usuarioTable.id_usuario).unique().notNull(),
  nombre_organizacion: varchar('nombre_organizacion', { length: 150 }).notNull(),
  descripcion: text('descripcion_organizacion'), // Usar text para descripciones más largas
  documento_acreditacion: varchar('documento_acreditacion', { length: 250 }), // URL
  acreditado: boolean('acreditado').default(false).notNull(),
  id_estado_acreditacion_actual: integer('id_estado_acreditacion_actual')
    .references(() => estadoAcreditacionTable.id_estado_acreditacion)
    .default(ID_ESTADO_ACREDITACION_PENDIENTE)
    .default(ID_ESTADO_ACREDITACION_APROBADO) // Estado por defecto
    .notNull(),

  // Campos adicionales que podrías haber añadido según el formulario del frontend
  tipo_organizacion: varchar('tipo_organizacion', { length: 100 }), // Ej: 'empresa', 'ong'
  rut_organizacion: varchar('rut_organizacion', { length: 20 }),
  telefono_organizacion: varchar('telefono_organizacion', { length: 25 }),
  direccion_organizacion: varchar('direccion_organizacion', { length: 250 }), // Ciudad y país o dirección
  redes_sociales: jsonb('redes_sociales'), // Para guardar el array de {type, url} como JSONB
});

export const organizadorRelations = relations(organizadorTable, ({ one }) => ({
  usuario: one(usuarioTable, {
    fields: [organizadorTable.id_usuario],
    references: [usuarioTable.id_usuario],
  }),
  estadoAcreditacionActual: one(estadoAcreditacionTable, { // Nombre de la relación
    fields: [organizadorTable.id_estado_acreditacion_actual],
    references: [estadoAcreditacionTable.id_estado_acreditacion],
  }),
}));


export type Organizador = typeof organizadorTable.$inferSelect;
export type NewOrganizador = typeof organizadorTable.$inferInsert;

// Implementation of the relations function
function relations<TTable, TRelations>(
  _table: TTable,
  builder: (helpers: { one: <TRelationTable>(
    table: TRelationTable,
    config: { fields: any[]; references: any[] }
  ) => any }) => TRelations
): TRelations {
  // Provide a minimal 'one' helper that just returns the config for demonstration.
  // In a real ORM, this would register the relation.
  const one = <TRelationTable>(
    table: TRelationTable,
    config: { fields: any[]; references: any[] }
  ) => ({
    table,
    ...config,
    type: 'one',
  });
  return builder({ one });
}
