-- Agregar campos de contacto a la tabla usuario de forma simple
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS ubicacion VARCHAR(100);

-- Comentarios para documentar los nuevos campos
COMMENT ON COLUMN usuario.telefono IS 'Número de teléfono del usuario en formato +56 9 XXXX XXXX';
COMMENT ON COLUMN usuario.ubicacion IS 'Ubicación o ciudad del usuario'; 