export interface LoginUsuarioPayload {
  correo: string;
  contrasena: string;
}

export interface RegistroUsuarioPayload {
  nombre_usuario: string;
  correo: string;
  contrasena: string;
  sexo?: string;
  fecha_nacimiento?: string;
}

export interface CreateOrganizadorPayload {
  nombre_organizacion: string;
  descripcion?: string;
  documento_acreditacion_url?: string;
} 