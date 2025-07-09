// Tipos para el módulo de calificaciones

export interface CrearCalificacionPayload {
  id_evento: number;
  puntuacion: number; // 1 a 5
  comentario?: string;
}

export interface CalificacionEventoResponse {
  id_calificacion: number;
  puntuacion: number;
  comentario: string;
  fecha: string;
  id_usuario: number;
  nombre_usuario: string;
}

export interface PromedioCalificacionesOrganizadorResponse {
  promedio: string | null;
  total: number;
  comentarios: CalificacionEventoResponse[];
} 