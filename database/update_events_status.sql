-- Script para actualizar el estado de eventos a "Publicado"
-- Esto permitirá que los KPIs muestren eventos activos

-- Actualizar algunos eventos a estado "Publicado" (id_estado_evento = 2)
UPDATE evento 
SET id_estado_evento = 2 
WHERE id_evento IN (1, 2, 3, 4, 5);

-- Verificar que se actualizaron correctamente
SELECT 
    e.id_evento,
    e.titulo,
    es.nombre_estado
FROM evento e
LEFT JOIN estado_evento es ON e.id_estado_evento = es.id_estado_evento
ORDER BY e.id_evento; 