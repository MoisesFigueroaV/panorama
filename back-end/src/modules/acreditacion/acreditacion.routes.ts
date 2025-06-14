import { Elysia } from 'elysia';
import { obtenerHistorialAcreditacion } from './acreditacion.services';

export const acreditacion = new Elysia({ prefix: '/acreditacion' });

acreditacion.get('/historial/:id_organizador', async ({ params, set }) => {
  try {
    const historial = await obtenerHistorialAcreditacion(Number(params.id_organizador));
    return { historial };
  } catch {
    set.status = 500;
    return { error: 'Error al obtener historial' };
  }
});
