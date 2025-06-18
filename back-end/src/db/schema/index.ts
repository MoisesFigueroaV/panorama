import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tablas Maestras
export * from './rolUsuario.schema';
export * from './categoriaEvento.schema';
export * from './estadoEvento.schema';
export * from './estadoAcreditacion.schema';
// ... exporta aquí los otros estados (notificacion, denuncia) si los necesitas.

// Tablas Principales
export * from './usuario.schema';
export * from './organizador.schema';
export * from './redSocialOrganizador.schema';
export * from './evento.schema';
// ... exporta aquí seguimiento, notificacion, calificacion, denuncia si los necesitas.

// Tablas de Historial
export * from './historialEstadoAcreditacion.schema';
// ... exporta aquí los otros historiales si los necesitas.
