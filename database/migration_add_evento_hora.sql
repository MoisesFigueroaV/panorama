-- Migración para agregar campos de hora a la tabla evento
-- Ejecutar después de init_panorama.sql

-- Agregar campos de hora a la tabla evento
ALTER TABLE evento 
ADD COLUMN hora_inicio TIME,
ADD COLUMN hora_fin TIME;

-- Actualizar eventos existentes con horas por defecto
UPDATE evento 
SET 
    hora_inicio = '09:00:00',
    hora_fin = '18:00:00'
WHERE hora_inicio IS NULL OR hora_fin IS NULL;

-- Hacer los campos obligatorios después de actualizar datos existentes
ALTER TABLE evento 
ALTER COLUMN hora_inicio SET NOT NULL,
ALTER COLUMN hora_fin SET NOT NULL;

-- Agregar comentarios para documentar los campos
COMMENT ON COLUMN evento.hora_inicio IS 'Hora de inicio del evento (formato HH:MM:SS)';
COMMENT ON COLUMN evento.hora_fin IS 'Hora de fin del evento (formato HH:MM:SS)'; 