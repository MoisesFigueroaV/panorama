// src/modules/usuario/usuario.routes.ts
import Elysia, { type Static, t } from 'elysia';
import {
  authMiddleware, // <--- Cambiado de authPlugin
  requireAuth,
  type AppSession, // Importar AppSession para tipar session
  // hasRole
} from '../../middleware/auth.middleware';
// import { SwaggerResponses } from '../../utils/swagger'; // No se usa en este archivo por ahora
import { CustomError, handleErrorLog } from '../../utils/errors'; // Importar handleErrorLog

import {
  registrarUsuarioService,
  loginUsuarioService,
  refreshTokenService,
  getUsuarioByIdService,
  updateUsuarioPerfilService,
} from './usuario.services'; // Corregido a .service
import {
  registroUsuarioSchema,
  loginUsuarioSchema,
  loginResponseSchema,
  usuarioResponseSchema,
  updateUsuarioPerfilSchema,
  errorResponseSchema,
  refreshTokenSchema,
  accessTokenResponseSchema,
} from './usuario.types';
// import type { JwtPayload } from '../../middleware/auth.middleware'; // JwtPayload ahora es interno a auth.middleware

export const usuarioRoutes = new Elysia({
  prefix: '/auth',
  detail: { tags: ['Autenticación'] },
})
.use(authMiddleware) // Usar el middleware de autenticación
.post(
    '/registro',
    async ({ body, set }) => {
      const usuario = await registrarUsuarioService(body);
      set.status = 201;
      return usuario;
    },
    {
      body: registroUsuarioSchema,
      response: { /* ... sin cambios ... */ },
      detail: { /* ... sin cambios ... */ },
    }
)
.post(
    '/login',
    // `jwtAccess` y `jwtRefresh` vienen del contexto gracias a `authMiddleware`
    async ({ body, set, jwtAccess, jwtRefresh }) => {
      const { accessToken, refreshToken, usuario } = await loginUsuarioService(body, {
        // El payload para access y refresh ahora espera sub: string
        access: (payload: { sub: string; rol?: number }) => jwtAccess.sign(payload),
        refresh: (payload: { sub: string }) => jwtRefresh.sign(payload),
      });
      set.status = 200;
      return { accessToken, refreshToken, usuario };
    },
    {
      body: loginUsuarioSchema,
      response: { /* ... sin cambios ... */ },
      detail: { /* ... sin cambios ... */ },
    }
)
.post(
    '/token/refresh',
    async ({ body, set, jwtAccess, jwtRefresh }) => { // Añadido jwtRefresh al contexto
        try {
            // verifiedPayload.sub será string
            const verifiedPayload = await jwtRefresh.verify(body.refreshToken);
            if (!verifiedPayload || typeof verifiedPayload.sub !== 'string') {
                throw new CustomError("Token de refresco inválido o expirado.", 401);
            }
            const { accessToken } = await refreshTokenService(
                { sub: verifiedPayload.sub }, // sub ya es string
                (payload: { sub: string; rol?: number }) => jwtAccess.sign(payload) // payload.sub es string
            );
            set.status = 200;
            return { accessToken };
        } catch (error) {
            if (error instanceof CustomError) throw error;
            if ((error as Error).name === 'JWSSignFailed' || (error as Error).name === 'JWSInvalid' || (error as Error).message.includes('expired')) { // Ser más específico con errores de JWT
                 throw new CustomError("Token de refresco inválido o expirado.", 401);
            }
            handleErrorLog(error, 'ruta /token/refresh'); // Usar handleErrorLog importado
            throw new CustomError("Error al procesar el token de refresco.", 500);
        }
    },
    {
        body: refreshTokenSchema,
        response: { /* ... sin cambios ... */ },
        detail: { /* ... sin cambios ... */ },
    }
);

export const userProfileRoutes = new Elysia({
    prefix: '/usuarios',
    detail: { tags: ['Usuarios'] }
})
.use(authMiddleware) // Usar el middleware de autenticación
.get(
    '/yo',
    async ({ session }: { session: AppSession }) => { // Tipar explícitamente session como AppSession
        const currentSession = requireAuth()(session);
        return await getUsuarioByIdService(currentSession.subAsNumber); // Usar subAsNumber
    },
    {
        response: { /* ... sin cambios ... */ },
        detail: { /* ... sin cambios ... */ security: [{ bearerAuth: [] }] },
    }
)
.put(
    '/yo',
    async ({ session, body }: { session: AppSession, body: Static<typeof updateUsuarioPerfilSchema> }) => { // Tipar explícitamente
        const currentSession = requireAuth()(session);
        return await updateUsuarioPerfilService(currentSession.subAsNumber, body); // Usar subAsNumber
    },
    {
        body: updateUsuarioPerfilSchema,
        response: { /* ... sin cambios ... */ },
        detail: { /* ... sin cambios ... */ security: [{ bearerAuth: [] }] },
    }
);