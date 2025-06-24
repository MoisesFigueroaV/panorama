import { t } from 'elysia';

export const historialEstadoAcreditacionSchema = t.Object({
  id_historial_acreditacion: t.Integer(),
  id_organizador: t.Integer(),
  id_estado_acreditacion: t.Integer(),
  fecha_cambio: t.String(),
  id_admin_responsable: t.Nullable(t.Integer()),
  notas_cambio: t.Nullable(t.String())
});

export const historialAcreditacionResponseSchema = t.Array(historialEstadoAcreditacionSchema);
