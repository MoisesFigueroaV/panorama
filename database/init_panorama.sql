
-- =======================
-- TABLAS MAESTRAS
-- =======================

CREATE TABLE rol_usuario (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    id_rol INT REFERENCES rol_usuario(id_rol),
    correo VARCHAR(150) UNIQUE NOT NULL,
    nombre_usuario VARCHAR(100) NOT NULL,
    contrasena VARCHAR(100) NOT NULL,
    fecha_registro DATE DEFAULT CURRENT_DATE,
    sexo CHAR(1),
    fecha_nacimiento DATE
);

CREATE TABLE categoria_evento (
    id_categoria SERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE estado_evento (
    id_estado_evento SERIAL PRIMARY KEY,
    nombre_estado VARCHAR(50) UNIQUE NOT NULL,
    descripcion VARCHAR(20)
);

CREATE TABLE estado_notificacion (
    id_estado_notificacion SERIAL PRIMARY KEY,
    nombre_estado VARCHAR(50) UNIQUE NOT NULL,
    descripcion VARCHAR(100)
);

CREATE TABLE estado_denuncia (
    id_estado_denuncia SERIAL PRIMARY KEY,
    nombre_estado VARCHAR(50) UNIQUE NOT NULL,
    descripcion VARCHAR(100)
);

CREATE TABLE estado_acreditacion (
    id_estado_acreditacion SERIAL PRIMARY KEY,
    nombre_estado VARCHAR(50) UNIQUE NOT NULL,
    descripcion VARCHAR(100)
);

-- =======================
-- TABLAS PRINCIPALES
-- =======================

CREATE TABLE organizador (
    id_organizador SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuario(id_usuario),
    nombre_organizacion VARCHAR(150) NOT NULL,
    descripcion VARCHAR(500),
    documento_acreditacion VARCHAR(250),
    acreditado BOOLEAN
);

CREATE TABLE evento (
    id_evento SERIAL PRIMARY KEY,
    id_organizador INT REFERENCES organizador(id_organizador),
    id_categoria INT REFERENCES categoria_evento(id_categoria),
    titulo VARCHAR(150) NOT NULL,
    descripcion VARCHAR(1000),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    fecha_registro DATE DEFAULT CURRENT_DATE,
    ubicacion VARCHAR(250),
    latitud NUMERIC(9,6),
    longitud NUMERIC(9,6),
    imagen VARCHAR(250),
    capacidad INT NOT NULL
);

CREATE TABLE seguimiento_organizacion (
    id_seguimiento SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuario(id_usuario),
    id_organizador INT REFERENCES organizador(id_organizador),
    fecha_seguimiento DATE NOT NULL
);

CREATE TABLE notificacion (
    id_notificacion SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuario(id_usuario),
    mensaje VARCHAR(500) NOT NULL,
    fecha_envio DATE NOT NULL
);

CREATE TABLE calificacion_evento (
    id_calificacion SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuario(id_usuario),
    id_evento INT REFERENCES evento(id_evento),
    puntuacion INT,
    comentario VARCHAR(1000),
    fecha DATE NOT NULL
);

CREATE TABLE denuncia (
    id_denuncia SERIAL PRIMARY KEY,
    id_denunciante INT REFERENCES usuario(id_usuario),
    id_denunciado INT REFERENCES usuario(id_usuario),
    id_evento INT REFERENCES evento(id_evento),
    motivo VARCHAR(500) NOT NULL,
    fecha_denuncia DATE NOT NULL,
    fecha_revision DATE
);

-- =======================
-- TABLAS DE HISTORIAL
-- =======================

CREATE TABLE historial_estado_evento (
    id_evento INT REFERENCES evento(id_evento),
    id_estado_evento INT REFERENCES estado_evento(id_estado_evento),
    fecha_cambio DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (id_evento, id_estado_evento)
);

CREATE TABLE historial_estado_denuncia (
    id_denuncia INT REFERENCES denuncia(id_denuncia),
    id_estado_denuncia INT REFERENCES estado_denuncia(id_estado_denuncia),
    fecha_cambio DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (id_denuncia, id_estado_denuncia)
);

CREATE TABLE historial_estado_acreditacion (
    id_organizador INT REFERENCES organizador(id_organizador),
    id_estado_acreditacion INT REFERENCES estado_acreditacion(id_estado_acreditacion),
    fecha_cambio DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (id_organizador, id_estado_acreditacion)
);

CREATE TABLE historial_estado_notificacion (
    id_notificacion INT REFERENCES notificacion(id_notificacion),
    id_estado_notificacion INT REFERENCES estado_notificacion(id_estado_notificacion),
    fecha_cambio DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (id_notificacion, id_estado_notificacion)
);
