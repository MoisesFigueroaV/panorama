export type Organizer = {
  id_organizador: number;
  nombre_organizacion: string;
  descripcion: string | null;
  documento_acreditacion: string | null;
  acreditado: boolean;
  ubicacion: string | null;
  anio_fundacion: number | null;
  sitio_web: string | null;
  imagen_portada: string | null;
  logo_organizacion: string | null;
  usuario: {
    id_usuario: number;
    nombre_usuario: string;
    correo: string;
    fecha_registro: Date;
    id_rol: number;
  };
  estadoAcreditacionActual: {
    id_estado_acreditacion: number;
    nombre_estado: string;
    descripcion: string | null;
  } | null;
}; 