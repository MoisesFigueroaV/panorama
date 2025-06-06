// src/middleware/auth.middleware.ts
import Elysia, { type Static, t } from 'elysia';
import jwt from '@elysiajs/jwt';
import { CustomError } from '../utils/errors';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'tu-super-secreto-para-jwt-access-tokens-cambiame-ya';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'tu-super-secreto-para-jwt-refresh-tokens-cambiame-ya';

if (JWT_ACCESS_SECRET.startsWith('tu-super-secreto') && process.env.NODE_ENV === 'production') {
    console.warn('⚠️ ADVERTENCIA DE SEGURIDAD: JWT_ACCESS_SECRET no está configurado de forma segura para producción.');
}
if (JWT_REFRESH_SECRET.startsWith('tu-super-secreto') && process.env.NODE_ENV === 'production') {
    console.warn('⚠️ ADVERTENCIA DE SEGURIDAD: JWT_REFRESH_SECRET no está configurado de forma segura para producción.');
}

const jwtPayloadSchemaForPlugin = t.Object({
    sub: t.String(),
    rol: t.Optional(t.Numeric()),
});
export type JwtStoredPayload = Static<typeof jwtPayloadSchemaForPlugin>;

export type AppSession = (JwtStoredPayload & { subAsNumber: number }) | null;

export const authMiddleware = new Elysia({ name: 'auth-middleware-plugin' })
    .use(
        jwt({
            name: 'jwtAccess',
            secret: JWT_ACCESS_SECRET,
            schema: jwtPayloadSchemaForPlugin,
            exp: '15m',
        })
    )
    .use(
        jwt({
            name: 'jwtRefresh',
            secret: JWT_REFRESH_SECRET,
            schema: t.Object({ sub: t.String() }),
            exp: '7d',
        })
    )
    .derive({as: "scoped"},async ({ jwtAccess, request }) => {
        const authorizationHeader = request.headers.get('Authorization');
        let session: AppSession = null;

        if (authorizationHeader?.startsWith('Bearer ')) {
            const token = authorizationHeader.substring(7);
            try {
                const decodedOrFalse = await jwtAccess.verify(token);
                if (decodedOrFalse && typeof decodedOrFalse === 'object') {
                    const decodedPayload = decodedOrFalse as JwtStoredPayload;
                    const subNum = parseInt(decodedPayload.sub, 10);
                    if (!isNaN(subNum)) {
                        session = { ...decodedPayload, subAsNumber: subNum };
                    } else {
                        console.warn("auth.middleware: JWT 'sub' (" + decodedPayload.sub + ") no es un número válido.");
                    }
                }
            } catch (error) { 
                /* Token inválido, etc. session es null */ 
            }
        }
        
        return { session };
    });

export const requireAuth = () => (session: AppSession): NonNullable<AppSession> => {
    if (!session || typeof session.subAsNumber !== 'number') {
        throw new CustomError('Autenticación requerida.', 401);
    }
    return session;
};

export const hasRole = (allowedRoles: number[]) => (session: AppSession) => {
    const currentSession = requireAuth()(session);
    if (typeof currentSession.rol !== 'number' || !allowedRoles.includes(currentSession.rol)) {
        throw new CustomError('Acceso denegado.', 403);
    }
};