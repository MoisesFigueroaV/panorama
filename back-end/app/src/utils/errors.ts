import { Elysia } from 'elysia';

export class CustomError extends Error {
  constructor(
    message: string,
    public status: number = 500
  ) {
    super(message);
    this.name = 'CustomError';
  }
}

export const handleErrorLog = (error: unknown, context: string): void => {
  console.error(`[${context}] Error:`, error instanceof Error ? error.message : error);
  if (error instanceof Error && error.stack) {
    console.error(`Stack trace:`, error.stack);
  }
};

export const errorPlugin = new Elysia()
  .onError(({ code, error, set }) => {
    console.error(`Error ${code}:`, error);
    
    if (error instanceof CustomError) {
      set.status = error.status;
      return { error: error.message };
    }
    
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