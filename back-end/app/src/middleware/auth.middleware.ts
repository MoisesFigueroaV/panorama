// src/middleware/auth.middleware.ts
import Elysia, { type Static, t } from 'elysia';
import jwt from '@elysiajs/jwt';
import { CustomError } from '../utils/errors';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmbGdyc2RramR5eWV1dGFmYWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMDMwOTUsImV4cCI6MjA2MDU3OTA5NX0.RWcm3SE_qg7LanbmOS_TNhOW_wK4OJ-D9CD5ZCZqeFs';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmbGdyc2RramR5eWV1dGFmYWNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTAwMzA5NSwiZXhwIjoyMDYwNTc5MDk1fQ.pXZD5VlgnMHb0OXhRQr5pekm31ylf9WI399_9g_N9Ik';

// Advertencias de producción (sin cambios)
// ...

// Define el schema del payload que esperas en tu JWT
const jwtPayloadSchema = t.Object({
    sub: t.String(), // <--- CAMBIO #1: sub AHORA ES STRING
    rol: t.Optional(t.Numeric()),
});
export type JwtPayload = Static<typeof jwtPayloadSchema>;

// Para conveniencia, creamos un tipo para la sesión que tendrá sub como número
export type AppSession = (JwtPayload & { subAsNumber: number }) | null;


export const authMiddleware = new Elysia({ name: 'auth-plugin' }) // Renombrado a authMiddleware como lo usas
    .use(
        jwt({
            name: 'jwtAccess',
            secret: JWT_ACCESS_SECRET,
            schema: jwtPayloadSchema, // Valida contra sub: string
            exp: '15m',
        })
    )
    .use(
        jwt({
            name: 'jwtRefresh',
            secret: JWT_REFRESH_SECRET,
            schema: t.Object({ sub: t.String() }), // <--- CAMBIO #2: sub AHORA ES STRING para refresh
            exp: '7d',
        })
    )
    .derive(async (context): Promise<{ session: AppSession }> => { // Tipo de retorno es AppSession
        const { jwtAccess, request } = context;
        const authorizationHeader = request.headers.get('Authorization');
        let session: AppSession = null;

        if (authorizationHeader?.startsWith('Bearer ')) {
            const token = authorizationHeader.substring(7);
            try {
                const decoded = await jwtAccess.verify(token); // decoded.sub será string
                if (decoded && typeof decoded.sub === 'string') {
                    // Intentar parsear 'sub' a número
                    const subNum = parseInt(decoded.sub, 10);
                    if (!isNaN(subNum)) { // Asegurar que la conversión fue exitosa
                        session = {
                            ...decoded, // decoded ya es JwtPayload (sub: string, rol?: number)
                            subAsNumber: subNum, // Añadir la versión numérica
                        };
                    } else {
                        console.warn("JWT 'sub' no es un número válido después de parsear:", decoded.sub);
                    }
                }
            } catch (error) {
                // Token inválido, etc. session permanece null
            }
        }
        return { session }; // Retorna el tipo AppSession
    });

// Guard de Autenticación
export const requireAuth = () => (session: AppSession): NonNullable<AppSession> => { // Espera y devuelve AppSession
    if (!session || !session.subAsNumber) { // Verifica subAsNumber
        throw new CustomError('Autenticación requerida. Token no proporcionado o inválido.', 401);
    }
    return session; // session ya es NonNullable<AppSession>
};

// Guard de Roles
export const hasRole = (allowedRoles: number[]) => (session: AppSession) => { // Espera AppSession
    const currentSession = requireAuth()(session); // requireAuth devuelve NonNullable<AppSession>
    if (!currentSession.rol || !allowedRoles.includes(currentSession.rol)) {
        throw new CustomError('Acceso denegado. No tienes los permisos necesarios.', 403);
    }
    // No es necesario devolver nada si es un guard que solo lanza errores
};