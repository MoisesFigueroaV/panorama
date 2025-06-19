import { pgTable, serial, integer, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizadorTable } from './organizador.schema';

export const redSocialOrganizadorTable = pgTable('red_social_organizador', {
    id_red: serial('id_red').primaryKey(),
    id_organizador: integer('id_organizador').references(() => organizadorTable.id_organizador).notNull(),
    plataforma: varchar('plataforma', { length: 50 }).notNull(),
    url: varchar('url', { length: 250 }).notNull(),
});

// Relaciones
export const redSocialOrganizadorRelations = relations(redSocialOrganizadorTable, ({ one }) => ({
    organizador: one(organizadorTable, {
        fields: [redSocialOrganizadorTable.id_organizador],
        references: [organizadorTable.id_organizador],
    })
}));

export type RedSocialOrganizador = typeof redSocialOrganizadorTable.$inferSelect;
export type NewRedSocialOrganizador = typeof redSocialOrganizadorTable.$inferInsert; 