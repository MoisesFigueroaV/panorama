

-- =======================
-- DATOS DE PRUEBA COMPLETOS Y EXTENDIDOS
-- =======================

-- 1. Roles
INSERT INTO rol_usuario (id_rol, nombre_rol) VALUES 
(1, 'Administrador'),
(2, 'Organizador'),
(3, 'Usuario');

-- 2. Usuarios
INSERT INTO usuario (id_usuario, id_rol, correo, nombre_usuario, contrasena, sexo, fecha_nacimiento) VALUES
(1, 1, 'admin@panorama.cl', 'Admin Panorama', 'admin123', 'M', '1980-01-01'),
(2, 2, 'eventos@ucsc.cl', 'Eventos UCSC', 'ucscclave', 'F', '1985-06-22'),
(3, 2, 'cultura@concepcion.cl', 'Cultura Muni', 'muni2024', 'F', '1975-03-15'),
(4, 3, 'camila.espinoza@mail.cl', 'Camila Espinoza', 'camila2024', 'F', '2000-07-15'),
(5, 3, 'matias.rivera@mail.cl', 'Matías Rivera', 'matiaspass', 'M', '1998-04-10'),
(6, 3, 'jorge.soto@mail.cl', 'Jorge Soto', 'jorge2024', 'M', '1995-08-12'),
(7, 3, 'sofia.vidal@mail.cl', 'Sofía Vidal', 'sofia2024', 'F', '2002-02-27'),
(8, 2, 'ufro.cultura@mail.cl', 'Cultura UFRO', 'ufroclave', 'M', '1983-09-10');

-- 3. Estados y categorías
INSERT INTO estado_evento (id_estado_evento, nombre_estado, descripcion) VALUES
(1, 'Borrador', 'No publicado'),
(2, 'Publicado', 'Visible'),
(3, 'Finalizado', 'Ya ocurrió');

INSERT INTO estado_notificacion (id_estado_notificacion, nombre_estado, descripcion) VALUES
(1, 'No Leída', 'Pendiente'),
(2, 'Leída', 'Visto');

INSERT INTO estado_denuncia (id_estado_denuncia, nombre_estado, descripcion) VALUES
(1, 'Recibida', 'Recibida por el sistema'),
(2, 'En revisión', 'Analizando contenido'),
(3, 'Resuelta', 'Finalizado');

INSERT INTO estado_acreditacion (id_estado_acreditacion, nombre_estado, descripcion) VALUES
(1, 'Pendiente', 'Documentación en revisión'),
(2, 'Aprobada', 'Autorizado para publicar');

INSERT INTO categoria_evento (id_categoria, nombre_categoria) VALUES
(1, 'Música'),
(2, 'Educación'),
(3, 'Cultura'),
(4, 'Tecnología'),
(5, 'Deporte');

-- 4. Organizadores
INSERT INTO organizador (id_organizador, id_usuario, nombre_organizacion, descripcion, documento_acreditacion, acreditado) VALUES
(1, 2, 'Universidad Católica de la Santísima Concepción', 'Organizador de ferias y charlas universitarias.', 'ucsc_doc.pdf', true),
(2, 3, 'Municipalidad de Concepción', 'Eventos artísticos y culturales para la comunidad.', 'muni_doc.pdf', true),
(3, 8, 'Universidad de La Frontera', 'Organiza charlas de cultura digital y ciudadanía.', 'ufro_doc.pdf', true);

-- 5. Eventos
INSERT INTO evento (id_evento, id_organizador, id_categoria, titulo, descripcion, fecha_inicio, fecha_fin, ubicacion, latitud, longitud, imagen, capacidad) VALUES
(1, 1, 2, 'Feria Vocacional UCSC 2025', 'Feria para orientar a estudiantes secundarios sobre carreras.', '2025-06-05', '2025-06-05', 'Campus San Andrés, UCSC', -36.8201, -73.0444, 'feria_vocacional.jpg', 500),
(2, 2, 1, 'Festival de Jazz en Plaza Independencia', 'Evento musical gratuito con bandas locales.', '2025-06-12', '2025-06-12', 'Plaza Independencia, Concepción', -36.8278, -73.0518, 'festival_jazz.jpg', 1000),
(3, 3, 4, 'Foro de Ciudadanía Digital', 'Foro universitario sobre derechos digitales.', '2025-06-20', '2025-06-20', 'Campus Andrés Bello, Temuco', -38.7359, -72.5904, 'foro_ciudadano.jpg', 300),
(4, 2, 5, 'Maratón Nocturna Conce 2025', 'Evento deportivo nocturno por las calles de Concepción.', '2025-07-01', '2025-07-01', 'Parque Ecuador, Concepción', -36.8251, -73.0442, 'maraton_nocturna.jpg', 1500),
(5, 1, 3, 'Expo Arte UCSC', 'Exposición de arte estudiantil en galería universitaria.', '2025-07-05', '2025-07-06', 'Sala de Arte UCSC', -36.8192, -73.0458, 'expo_arte.jpg', 200);

-- 6. Calificaciones
INSERT INTO calificacion_evento (id_calificacion, id_usuario, id_evento, puntuacion, comentario, fecha) VALUES
(1, 4, 1, 5, 'Muy informativa y bien organizada.', '2025-06-05'),
(2, 5, 2, 4, 'Excelente ambiente y música, pero faltó sombra.', '2025-06-12'),
(3, 6, 2, 3, 'Estuvo bien, pero faltó seguridad.', '2025-06-12'),
(4, 7, 3, 4, 'Me gustó la discusión sobre privacidad.', '2025-06-20'),
(5, 4, 4, 5, 'Una experiencia inolvidable en la maratón.', '2025-07-01'),
(6, 7, 5, 5, 'Gran exposición de arte local.', '2025-07-06');

-- 7. Denuncias
INSERT INTO denuncia (id_denuncia, id_denunciante, id_denunciado, id_evento, motivo, fecha_denuncia, fecha_revision) VALUES
(1, 4, 3, 2, 'Contenido no coincidía con lo publicado.', '2025-06-13', NULL),
(2, 5, 2, 1, 'No se respetó el aforo permitido.', '2025-06-06', '2025-06-07'),
(3, 7, 3, 2, 'Uso indebido de imagen sin consentimiento.', '2025-06-13', NULL);

-- 8. Notificaciones
INSERT INTO notificacion (id_notificacion, id_usuario, mensaje, fecha_envio) VALUES
(1, 4, 'Gracias por participar en el evento.', '2025-06-06'),
(2, 5, 'Tu comentario ha sido registrado.', '2025-06-12'),
(3, 6, 'Se ha actualizado el horario del evento.', '2025-06-10'),
(4, 7, 'Tu denuncia está siendo revisada.', '2025-06-14'),
(5, 5, 'Gracias por calificar el evento.', '2025-07-01');

-- 9. Seguimientos
INSERT INTO seguimiento_organizacion (id_seguimiento, id_usuario, id_organizador, fecha_seguimiento) VALUES
(1, 4, 1, '2025-05-20'),
(2, 5, 2, '2025-05-21'),
(3, 6, 2, '2025-06-01'),
(4, 7, 3, '2025-06-15'),
(5, 5, 3, '2025-06-17');
