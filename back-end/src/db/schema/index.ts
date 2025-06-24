import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Dummy users table (lo mantenemos por ahora)
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

// Tablas Principales
export * from './usuario.schema';
export * from './organizador.schema';
export * from './redSocialOrganizador.schema';
export * from './evento.schema';
export * from './notificaciones.schema';

// Tablas de Historial
export * from './historialEstadoAcreditacion.schema';
