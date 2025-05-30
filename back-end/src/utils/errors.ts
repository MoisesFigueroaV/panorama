import { Elysia, type Context } from "elysia";

// Error personalizado para un mejor manejo de errores HTTP
export class CustomError extends Error {
  constructor(message: string, public readonly status: number, public readonly details?: any) {
    super(message);
    this.name = 'CustomError';
    // Asegura que el prototipo se establezca correctamente para instanceof
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

// Función helper para loguear errores (puedes expandirla con un logger más sofisticado)
export const handleError = (error: unknown, contextInfo: string | Context): string => {
  let contextMessage = "en un contexto desconocido";
  if (typeof contextInfo === 'string') {
    contextMessage = `en ${contextInfo}`;
  } else if (contextInfo && contextInfo.request) {
    contextMessage = `procesando ${contextInfo.request.method} ${contextInfo.request.url}`;
  }

  if (error instanceof CustomError) {
    console.error(`🔴 CustomError ${contextMessage}: [${error.status}] ${error.message}`, error.details || '');
    return error.message;
  } else if (error instanceof Error) {
    console.error(`🔴 Error ${contextMessage}: ${error.message}`, error.stack);
    return error.message;
  } else {
    console.error(`🔴 Error desconocido ${contextMessage}:`, error);
    return 'Error desconocido';
  }
};

// Plugin de Elysia para manejar errores globalmente
export const errorPlugin = new Elysia({ name: 'error-handler' })
  .onError(({ code, error, set, path, request }) => {
    const context = `ruta ${request.method} ${path}`;
    handleError(error, context); // Loguea el error con contexto

    if (error instanceof CustomError) {
      set.status = error.status;
      return { error: error.message, details: error.details };
    }

    switch (code) {
      case 'VALIDATION':
        set.status = 400;
        return { error: "Error de validación", details: (error as any).message || error.message };
      case 'NOT_FOUND':
        set.status = 404;
        return { error: "Ruta no encontrada" };
      case 'PARSE':
        set.status = 400;
        return { error: "Error de parseo en la solicitud" };
      case 'INTERNAL_SERVER_ERROR':
      default:
        set.status = 500;
        return { error: "Error interno del servidor" };
    }
  });