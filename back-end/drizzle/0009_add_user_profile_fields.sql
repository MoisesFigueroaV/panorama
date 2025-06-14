-- Agregar campos de perfil a la tabla usuario
ALTER TABLE usuario
ADD COLUMN biografia TEXT,
ADD COLUMN intereses TEXT[],
ADD COLUMN foto_perfil VARCHAR(250);

-- Comentarios para documentar los nuevos campos
COMMENT ON COLUMN usuario.biografia IS 'Biografía o descripción personal del usuario';
COMMENT ON COLUMN usuario.intereses IS 'Array de intereses o temas de interés del usuario';
COMMENT ON COLUMN usuario.foto_perfil IS 'URL de la foto de perfil del usuario'; 