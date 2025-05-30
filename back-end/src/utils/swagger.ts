import { type TSchema } from 'elysia';

interface SwaggerResponseOptions {
  description?: string;
  examples?: Record<string, any>;
}

// Helper para generar estructuras de respuesta estándar para Swagger/OpenAPI
export const SwaggerResponses = (
  schema: TSchema | (() => TSchema),
  successCode: number = 200,
  successOptions?: SwaggerResponseOptions
) => {
  const baseResponses: Record<string, any> = {
    [successCode]: {
      description: successOptions?.description || 'Respuesta exitosa',
      content: {
        'application/json': {
          schema: typeof schema === 'function' ? schema() : schema,
          ...(successOptions?.examples && { examples: successOptions.examples }),
        },
      },
    },
    400: { description: 'Solicitud incorrecta (ej. error de validación)' },
    401: { description: 'No autorizado (ej. token faltante o inválido)' },
    403: { description: 'Prohibido (ej. permisos insuficientes)' },
    404: { description: 'Recurso no encontrado' },
    500: { description: 'Error interno del servidor' },
  };
  return baseResponses;
};

export const SwaggerIdParam = (description: string = "Identificador único del recurso") => ({
    type: 'integer', // o 'string' si usas UUIDs
    description,
    format: 'int64', // para numérico
    example: 1
});