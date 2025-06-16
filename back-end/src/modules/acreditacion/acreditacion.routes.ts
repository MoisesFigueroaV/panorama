import { Elysia, t } from 'elysia';
import { obtenerHistorialAcreditacion } from './acreditacion.services';
import { historialAcreditacionResponseSchema } from './acreditacion.types';
import { CustomError } from '../../utils/errors';

export const acreditacion = new Elysia({ prefix: '/acreditacion', detail: { tags: ['Acreditación'] } });

acreditacion.get(
  '/historial/:id_organizador',
  async ({ params }) => {
    const id = Number(params.id_organizador);
    if (isNaN(id)) {
      throw new CustomError('ID de organizador inválido', 400);
    }

    const historial = await obtenerHistorialAcreditacion(id);
    return { historial };
  },
  {
    params: t.Object({ id_organizador: t.String() }),
    response: { 200: t.Object({ historial: historialAcreditacionResponseSchema }) },
    detail: { summary: 'Obtener historial de acreditación', tags: ['Acreditación'] }
  }
);
