CREATE OR REPLACE FUNCTION notificar_cambio_estado_evento()
RETURNS TRIGGER AS $$
DECLARE
    nombre TEXT;
BEGIN
    IF NEW.id_estado_evento IS DISTINCT FROM OLD.id_estado_evento THEN
        -- Obtener nombre del nuevo estado
        SELECT nombre_estado INTO nombre
        FROM estado_evento 
        WHERE id_estado_evento = NEW.id_estado_evento;
        
        -- Insertar notificación básica (sin id_evento)
        INSERT INTO notificacion (id_usuario, mensaje, fecha_envio)
        VALUES (
            NEW.id_organizador,
            'Estado actualizado: "' || NEW.titulo || '" ahora está "' || nombre || '"',
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;