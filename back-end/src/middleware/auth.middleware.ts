import { Elysia } from 'elysia';
import { CustomError } from '../utils/errors';

// Define una interfaz para la sesión si la adjuntas al contexto
export interface AuthSession {
  userId: number;
  userRol?: number; // id_rol del usuario
  // ...otros datos de sesión que necesites
}

// Placeholder para tu middleware de autenticación (ej. usando JWT)
export const authMiddleware = new Elysia({ name: 'auth-middleware' })
  .derive(async (context): Promise<{ session?: AuthSession }> => {
    const authorizationHeader = context.request.headers.get('Authorization');

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      // Podrías lanzar un error aquí si la autenticación es estrictamente requerida
      // o simplemente no establecer la sesión.
      // Para este ejemplo, no establecemos sesión y dejamos que las rutas decidan.
      return {};
    }

    const token = authorizationHeader.substring(7); // Remove "Bearer "

    try {
      // TODO: Implementa la lógica de validación de tu token JWT aquí
      // Ejemplo: const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      // if (!decoded || typeof decoded.userId !== 'number') {
      //   throw new CustomError('Token inválido o expirado', 401);
      // }
      //
      // Por ahora, simularemos una sesión decodificada:
      const simulatedDecodedPayload = { userId: 1, userRol: 1 }; // Simulación

      return {
        session: {
          userId: simulatedDecodedPayload.userId,
          userRol: simulatedDecodedPayload.userRol,
        },
      };
    } catch (error) {
      // Si el token es inválido o ha expirado
      // Puedes lanzar un CustomError o simplemente no retornar sesión.
      // console.error("Error de autenticación:", error);
      // throw new CustomError('Autenticación fallida', 401); // Lanza si la ruta SIEMPRE requiere auth
      return {}; // No establece sesión si el token es inválido
    }
  })
  // Helper para requerir autenticación en una ruta específica
  .macro(({ onBeforeHandle }) => ({
    requireAuth(handler: (context: any) => any) { // 'any' para simplificar, tipar mejor en prod
      onBeforeHandle(async (context) => {
        if (!context.session?.userId) {
          throw new CustomError('Se requiere autenticación', 401);
        }
        return handler(context);
      });
    }
  }));

// Helper de Elysia para comprobar roles (ejemplo)
export const hasRole = (allowedRoles: number[]) => (context: { session?: AuthSession }) => {
  if (!context.session?.userRol || !allowedRoles.includes(context.session.userRol)) {
    throw new CustomError('Acceso denegado: Rol no autorizado', 403);
  }
  return true; // O no retornar nada si es un guard
};