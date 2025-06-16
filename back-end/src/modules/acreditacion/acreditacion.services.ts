import { db } from '../../db/drizzle';
import { historialEstadoAcreditacionTable } from '../../db/schema/historialEstadoAcreditacion.schema';
import { eq } from 'drizzle-orm';

export async function obtenerHistorialAcreditacion(id_organizador: number) {
  const historial = await db.query.historialEstadoAcreditacionTable.findMany({
    where: eq(historialEstadoAcreditacionTable.id_organizador, id_organizador),
    orderBy: (row) => row.fecha_cambio
  });
  return historial;
}
