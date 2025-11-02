
--- /Users/moisesfig/Documents/Programacion/panorama-1/back-end/src/db/schema/categoriaEvento.schema.ts ---
import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const categoria_evento = pgTable('categoria_evento', {
  id_categoria_evento: serial('id_categoria_evento').primaryKey(),
  nombre_categoria: varchar('nombre_categoria', { length: 255 }).notNull(),
  descripcion: varchar('descripcion', { length: 255 }),
  fecha_creacion: timestamp('fecha_creacion').defaultNow().notNull(),
  fecha_actualizacion: timestamp('fecha_actualizacion').defaultNow().notNull(),
});

export const insertCategoriaEventoSchema = createInsertSchema(categoria_evento);
export const selectCategoriaEventoSchema = createSelectSchema(categoria_evento);

export type CategoriaEvento = z.infer<typeof selectCategoriaEventoSchema>;
export type NewCategoriaEvento = z.infer<typeof insertCategoriaEventoSchema>;

--- /Users/moisesfig/Documents/Programacion/panorama-1/back-end/src/db/schema/estado_notificacion.schema.ts ---
import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const estado_notificacion = pgTable('estado_notificacion', {
  id_estado_notificacion: serial('id_estado_notificacion').primaryKey(),
  nombre_estado: varchar('nombre_estado', { length: 255 }).notNull(),
  descripcion: varchar('descripcion', { length: 255 }),
  fecha_creacion: timestamp('fecha_creacion').defaultNow().notNull(),
  fecha_actualizacion: timestamp('fecha_actualizacion').defaultNow().notNull(),
});

export const insertEstadoNotificacionSchema =
  createInsertSchema(estado_notificacion);
export const selectEstadoNotificacionSchema =
  createSelectSchema(estado_notificacion);

export type EstadoNotificacion = z.infer<typeof selectEstadoNotificacionSchema>;
export type NewEstadoNotificacion = z.infer<
  typeof insertEstadoNotificacionSchema
>;

--- /Users/moisesfig/Documents/Programacion/panorama-1/back-end/src/db/schema/estadoAcreditacion.schema.ts ---
import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const estado_acreditacion = pgTable('estado_acreditacion', {
  id_estado_acreditacion: serial('id_estado_acreditacion').primaryKey(),
  nombre_estado: varchar('nombre_estado', { length: 255 }).notNull(),
  descripcion: varchar('descripcion', { length: 255 }),
  fecha_creacion: timestamp('fecha_creacion').defaultNow().notNull(),
  fecha_actualizacion: timestamp('fecha_actualizacion').defaultNow().notNull(),
});

export const insertEstadoAcreditacionSchema =
  createInsertSchema(estado_acreditacion);
export const selectEstadoAcreditacionSchema =
  createSelectSchema(estado_acreditacion);

export type EstadoAcreditacion = z.infer<typeof selectEstadoAcreditacionSchema>;
export type NewEstadoAcreditacion = z.infer<
  typeof insertEstadoAcreditacionSchema
>;

--- /Users/moisesfig/Documents/Programacion/panorama-1/back-end/src/db/schema/estadoEvento.schema.ts ---
import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const estado_evento = pgTable('estado_evento', {
  id_estado: serial('id_estado').primaryKey(),
  nombre_estado: varchar('nombre_estado', { length: 255 }).notNull(),
  descripcion: varchar('descripcion', { length: 255 }),
  fecha_creacion: timestamp('fecha_creacion').defaultNow().notNull(),
  fecha_actualizacion: timestamp('fecha_actualizacion').defaultNow().notNull(),
});

export const insertEstadoEventoSchema = createInsertSchema(estado_evento);
export const selectEstadoEventoSchema = createSelectSchema(estado_evento);

export type EstadoEvento = z.infer<typeof selectEstadoEventoSchema>;
export type NewEstadoEvento = z.infer<typeof insertEstadoEventoSchema>;

--- /Users/moisesfig/Documents/Programacion/panorama-1/back-end/src/db/schema/evento.schema.ts ---
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  json,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { organizador } from './organizador.schema';
import { categoria_evento } from './categoriaEvento.schema';
import { estado_evento } from './estadoEvento.schema';

export const evento = pgTable('evento', {
  id_evento: serial('id_evento').primaryKey(),
  nombre_evento: varchar('nombre_evento', { length: 255 }).notNull(),
  descripcion: text('descripcion'),
  fecha_inicio: timestamp('fecha_inicio').notNull(),
  fecha_fin: timestamp('fecha_fin').notNull(),
  hora_inicio: varchar('hora_inicio', { length: 255 }),
  hora_fin: varchar('hora_fin', { length: 255 }),
  id_organizador: integer('id_organizador').references(
    () => organizador.id_organizador
  ),
  id_categoria_evento: integer('id_categoria_evento').references(
    () => categoria_evento.id_categoria_evento
  ),
  id_estado: integer('id_estado').references(() => estado_evento.id_estado),
  ubicacion: varchar('ubicacion', { length: 255 }),
  latitud: varchar('latitud', { length: 255 }),
  longitud: varchar('longitud', { length: 255 }),
  es_pago: boolean('es_pago').default(false),
  precio: varchar('precio', { length: 255 }),
  url_compra: varchar('url_compra', { length: 255 }),
  url_imagen: varchar('url_imagen', { length: 255 }),
  es_destacado: boolean('es_destacado').default(false),
  es_aprobado: boolean('es_aprobado').default(false),
  fecha_creacion: timestamp('fecha_creacion').defaultNow().notNull(),
  fecha_actualizacion: timestamp('fecha_actualizacion').defaultNow().notNull(),
  // TODO: Add the following fields to the table
  // capacidad: integer('capacidad'),
  // es_recurrente: boolean('es_recurrente').default(false),
  // frecuencia_recurrencia: varchar('frecuencia_recurrencia', { length: 255 }),
  // dia_semana_recurrencia: varchar('dia_semana_recurrencia', { length: 255 }),
  // fecha_fin_recurrencia: timestamp('fecha_fin_recurrencia'),
  // tags: json('tags'),
});

export const eventoRelations = relations(evento, ({ one }) => ({
  organizador: one(organizador, {
    fields: [evento.id_organizador],
    references: [organizador.id_organizador],
  }),
  categoria_evento: one(categoria_evento, {
    fields: [evento.id_categoria_evento],
    references: [categoria_evento.id_categoria_evento],
  }),
  estado_evento: one(estado_evento, {
    fields: [evento.id_estado],
    references: [estado_evento.id_estado],
  }),
}));

export const insertEventoSchema = createInsertSchema(evento);
export const selectEventoSchema = createSelectSchema(evento);

export type Evento = z.infer<typeof selectEventoSchema>;
export type NewEvento = z.infer<typeof insertEventoSchema>;

--- /Users/moisesfig/Documents/Programacion/panorama-1/back-end/src/db/schema/historial_estado_notificacion.schema.ts ---
import {
  pgTable,
  serial,
  integer,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { notificaciones } from './notificaciones.schema';
import { estado_notificacion } from './estado_notificacion.schema';

export const historial_estado_notificacion = pgTable(
  'historial_estado_notificacion',
  {
    id_historial: serial('id_historial').primaryKey(),
    id_notificacion: integer('id_notificacion').references(
      () => notificaciones.id_notificacion
    ),
    id_estado_notificacion: integer('id_estado_notificacion').references(
      () => estado_notificacion.id_estado_notificacion
    ),
    fecha_cambio: timestamp('fecha_cambio').defaultNow().notNull(),
    observaciones: varchar('observaciones', { length: 255 }),
  }
);

export const insertHistorialEstadoNotificacionSchema = createInsertSchema(
  historial_estado_notificacion
);
export const selectHistorialEstadoNotificacionSchema = createSelectSchema(
  historial_estado_notificacion
);

export type HistorialEstadoNotificacion = z.infer<
  typeof selectHistorialEstadoNotificacionSchema
>;
export type NewHistorialEstadoNotificacion = z.infer<
  typeof insertHistorialEstadoNotificacionSchema
>;

--- /Users/moisesfig/Documents/Programacion/panorama-1/back-end/src/db/schema/historialEstadoAcreditacion.schema.ts ---
import {
  pgTable,
  serial,
  integer,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { organizador } from './organizador.schema';
import { estado_acreditacion } from './estadoAcreditacion.schema';

export const historial_estado_acreditacion = pgTable(
  'historial_estado_acreditacion',
  {
    id_historial: serial('id_historial').primaryKey(),
    id_organizador: integer('id_organizador').references(
      () => organizador.id_organizador
    ),
    id_estado_acreditacion: integer('id_estado_acreditacion').references(
      () => estado_acreditacion.id_estado_acreditacion
    ),
    fecha_cambio: timestamp('fecha_cambio').defaultNow().notNull(),
    observaciones: varchar('observaciones', { length: 255 }),
  }
);

export const insertHistorialEstadoAcreditacionSchema = createInsertSchema(
  historial_estado_acreditacion
);
export const selectHistorialEstadoAcreditacionSchema = createSelectSchema(
  historial_estado_acreditacion
);

export type HistorialEstadoAcreditacion = z.infer<
  typeof selectHistorialEstadoAcreditacionSchema
>;
export type NewHistorialEstadoAcreditacion = z.infer<
  typeof insertHistorialEstadoAcreditacionSchema
>;

--- /Users/moisesfig/Documents/Programacion/panorama-1/back-end/src/db/schema/index.ts ---
export * from './usuario.schema';
export * from './rolUsuario.schema';
export * from './organizador.schema';
export * from './redSocialOrganizador.schema';
export * from './evento.schema';
export * from './categoriaEvento.schema';
export * from './estadoEvento.schema';
export * from './notificaciones.schema';
export * from './estado_notificacion.schema';
export * from './historial_estado_notificacion.schema';
export * from './estadoAcreditacion.schema';
export * from './historialEstadoAcreditacion.schema';

--- /Users/moisesfig/Documents/Programacion/panorama-1/back-end/src/db/schema/notificaciones.schema.ts ---
import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { usuario } from './usuario.schema';
import { estado_notificacion } from './estado_notificacion.schema';

export const notificaciones = pgTable('notificaciones', {
  id_notificacion: serial('id_notificacion').primaryKey(),
  titulo: varchar('titulo', { length: 255 }).notNull(),
  mensaje: varchar('mensaje', { length: 255 }).notNull(),
  leida: boolean('leida').default(false),
  fecha_creacion: timestamp('fecha_creacion').defaultNow().notNull(),
  id_usuario: integer('id_usuario').references(() => usuario.id_usuario),
  id_estado_notificacion: integer('id_estado_notificacion').references(
    () => estado_notificacion.id_estado_notificacion
  ),
  fecha_lectura: timestamp('fecha_lectura'),
});

export const insertNotificacionesSchema = createInsertSchema(notificaciones);
export const selectNotificacionesSchema = createSelectSchema(notificaciones);

export type Notificaciones = z.infer<typeof selectNotificacionesSchema>;
export type NewNotificaciones = z.infer<typeof insertNotificacionesSchema>;

--- /Users/moisesfig/Documents/Programacion/panorama-1/back-end/src/db/schema/organizador.schema.ts ---
import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { usuario } from './usuario.schema';
import { red_social_organizador } from './redSocialOrganizador.schema';
import { estado_acreditacion } from './estadoAcreditacion.schema';

export const organizador = pgTable('organizador', {
  id_organizador: serial('id_organizador').primaryKey(),
  id_usuario: integer('id_usuario')
    .references(() => usuario.id_usuario)
    .notNull(),
  nombre_organizador: varchar('nombre_organizador', { length: 255 }).notNull(),
  descripcion: varchar('descripcion', { length: 255 }),
  website: varchar('website', { length: 255 }),
  logo_url: varchar('logo_url', { length: 255 }),
  id_estado_acreditacion: integer('id_estado_acreditacion').references(
    () => estado_acreditacion.id_estado_acreditacion
  ),
  fecha_creacion: timestamp('fecha_creacion').defaultNow().notNull(),
  fecha_actualizacion: timestamp('fecha_actualizacion').defaultNow().notNull(),
});

export const organizadorRelations = relations(organizador, ({ one, many }) => ({
  usuario: one(usuario, {
    fields: [organizador.id_usuario],
    references: [usuario.id_usuario],
  }),
  redes_sociales: many(red_social_organizador),
  estado_acreditacion: one(estado_acreditacion, {
    fields: [organizador.id_estado_acreditacion],
    references: [estado_acreditacion.id_estado_acreditacion],
  }),
}));

export const insertOrganizadorSchema = createInsertSchema(organizador);
export const selectOrganizadorSchema = createSelectSchema(organizador);

export type Organizador = z.infer<typeof selectOrganizadorSchema>;
export type NewOrganizador = z.infer<typeof insertOrganizadorSchema>;

--- /Users/moisesfig/Documents/Programacion/panorama-1/back-end/src/db/schema/redSocialOrganizador.schema.ts ---
import { pgTable, serial, varchar, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { organizador } from './organizador.schema';

export const red_social_organizador = pgTable('red_social_organizador', {
  id_red_social: serial('id_red_social').primaryKey(),
  id_organizador: integer('id_organizador')
    .references(() => organizador.id_organizador)
    .notNull(),
  nombre_red: varchar('nombre_red', { length: 255 }).notNull(),
  url: varchar('url', { length: 255 }).notNull(),
});

export const redSocialOrganizadorRelations = relations(
  red_social_organizador,
  ({ one }) => ({
    organizador: one(organizador, {
      fields: [red_social_organizador.id_organizador],
      references: [organizador.id_organizador],
    }),
  })
);

export const insertRedSocialOrganizadorSchema = createInsertSchema(
  red_social_organizador
);
export const selectRedSocialOrganizadorSchema = createSelectSchema(
  red_social_organizador
);

export type RedSocialOrganizador = z.infer<
  typeof selectRedSocialOrganizadorSchema
>;
export type NewRedSocialOrganizador = z.infer<
  typeof insertRedSocialOrganizadorSchema
>;

--- /Users/moisesfig/Documents/Programacion/panorama-1/back-end/src/db/schema/rolUsuario.schema.ts ---
import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const rol_usuario = pgTable('rol_usuario', {
  id_rol: serial('id_rol').primaryKey(),
  nombre_rol: varchar('nombre_rol', { length: 255 }).notNull(),
  descripcion: varchar('descripcion', { length: 255 }),
  fecha_creacion: timestamp('fecha_creacion').defaultNow().notNull(),
  fecha_actualizacion: timestamp('fecha_actualizacion').defaultNow().notNull(),
});

export const insertRolUsuarioSchema = createInsertSchema(rol_usuario);
export const selectRolUsuarioSchema = createSelectSchema(rol_usuario);

export type RolUsuario = z.infer<typeof selectRolUsuarioSchema>;
export type NewRolUsuario = z.infer<typeof insertRolUsuarioSchema>;

--- /Users/moisesfig/Documents/Programacion/panorama-1/back-end/src/db/schema/usuario.schema.ts ---
import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { rol_usuario } from './rolUsuario.schema';

export const usuario = pgTable('usuario', {
  id_usuario: serial('id_usuario').primaryKey(),
  nombre: varchar('nombre', { length: 255 }).notNull(),
  apellido: varchar('apellido', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  id_rol: integer('id_rol')
    .references(() => rol_usuario.id_rol)
    .notNull(),
  telefono: varchar('telefono', { length: 255 }),
  direccion: varchar('direccion', { length: 255 }),
  fecha_nacimiento: timestamp('fecha_nacimiento'),
  // TODO: Add the following fields to the table
  // genero: varchar('genero', { length: 255 }),
  // pais: varchar('pais', { length: 255 }),
  // ciudad: varchar('ciudad', { length: 255 }),
  // codigo_postal: varchar('codigo_postal', { length: 255 }),
  // foto_perfil_url: varchar('foto_perfil_url', { length: 255 }),
  // biografia: text('biografia'),
  // es_verificado: boolean('es_verificado').default(false),
  // fecha_verificacion: timestamp('fecha_verificacion'),
  // ultima_conexion: timestamp('ultima_conexion'),
  // es_activo: boolean('es_activo').default(true),
  // auth_provider: varchar('auth_provider', { length: 255 }),
  // auth_provider_id: varchar('auth_provider_id', { length: 255 }),
  // recordar_sesion_token: varchar('recordar_sesion_token', { length: 255 }),
  // fecha_creacion: timestamp('fecha_creacion').defaultNow().notNull(),
  // fecha_actualizacion: timestamp('fecha_actualizacion').defaultNow().notNull(),
});

export const usuarioRelations = relations(usuario, ({ one }) => ({
  rol_usuario: one(rol_usuario, {
    fields: [usuario.id_rol],
    references: [rol_usuario.id_rol],
  }),
}));

export const insertUsuarioSchema = createInsertSchema(usuario);
export const selectUsuarioSchema = createSelectSchema(usuario);

export type Usuario = z.infer<typeof selectUsuarioSchema>;
export type NewUsuario = z.infer<typeof insertUsuarioSchema>;
