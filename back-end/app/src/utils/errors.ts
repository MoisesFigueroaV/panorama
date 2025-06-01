import { Elysia } from 'elysia';

export const errorPlugin = new Elysia()
  .onError(({ code, error, set }) => {
    console.error(`Error ${code}:`, error);
    
    switch (code) {
      case 'NOT_FOUND':
        set.status = 404;
        return { error: 'Recurso no encontrado' };
      case 'VALIDATION':
        set.status = 400;
        return { error: 'Datos inválidos', details: error.message };
      case 'INTERNAL_SERVER_ERROR':
        set.status = 500;
        return { error: 'Error interno del servidor' };
      default:
        set.status = 500;
        return { error: 'Error inesperado' };
    }
  }); 