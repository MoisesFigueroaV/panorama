-- FUNCIÓN DEL TRIGGER
CREATE OR REPLACE FUNCTION notificar_cambio_estado_evento()
RETURNS TRIGGER AS $$
DECLARE
  nuevo_estado TEXT;
  mensaje TEXT;
BEGIN
  IF NEW.id_estado_evento IS DISTINCT FROM OLD.id_estado_evento THEN
    mensaje := 'El estado de tu evento "' || NEW.titulo || '" ha cambiado.';
    INSERT INTO notificacion (id_usuario, id_evento, mensaje, fecha_envio)
    VALUES (NEW.id_organizador, NEW.id_evento, mensaje, NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER
DROP TRIGGER IF EXISTS trigger_notificar_cambio_estado_evento ON evento;

CREATE TRIGGER trigger_notificar_cambio_estado_evento
AFTER UPDATE ON evento
FOR EACH ROW
EXECUTE FUNCTION notificar_cambio_estado_evento();
