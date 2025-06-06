CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "rol_usuario" (
	"id_rol" serial PRIMARY KEY NOT NULL,
	"nombre_rol" varchar(50) NOT NULL,
	CONSTRAINT "rol_usuario_nombre_rol_unique" UNIQUE("nombre_rol")
);
--> statement-breakpoint
CREATE TABLE "usuario" (
	"id_usuario" serial PRIMARY KEY NOT NULL,
	"id_rol" integer,
	"correo" varchar(150) NOT NULL,
	"nombre_usuario" varchar(100) NOT NULL,
	"contrasena" varchar(100) NOT NULL,
	"fecha_registro" date DEFAULT CURRENT_DATE NOT NULL,
	"sexo" char(1),
	"fecha_nacimiento" date,
	CONSTRAINT "usuario_correo_unique" UNIQUE("correo")
);
--> statement-breakpoint
CREATE TABLE "organizador" (
	"id_organizador" serial PRIMARY KEY NOT NULL,
	"id_usuario" integer,
	"nombre_organizacion" varchar(150) NOT NULL,
	"descripcion" varchar(500),
	"documento_acreditacion" varchar(250),
	"acreditado" boolean DEFAULT false,
	CONSTRAINT "organizador_id_usuario_unique" UNIQUE("id_usuario")
);
--> statement-breakpoint
CREATE TABLE "eventos" (
	"id_evento" serial PRIMARY KEY NOT NULL,
	"id_organizador" integer NOT NULL,
	"titulo" text NOT NULL,
	"descripcion" text,
	"fecha_inicio" timestamp NOT NULL,
	"fecha_fin" timestamp NOT NULL,
	"imagen_url" text,
	"ubicacion" text NOT NULL,
	"capacidad" integer NOT NULL,
	"categorias" text NOT NULL,
	"creado_en" timestamp DEFAULT now(),
	"actualizado_en" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_id_rol_rol_usuario_id_rol_fk" FOREIGN KEY ("id_rol") REFERENCES "public"."rol_usuario"("id_rol") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizador" ADD CONSTRAINT "organizador_id_usuario_usuario_id_usuario_fk" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuario"("id_usuario") ON DELETE no action ON UPDATE no action;