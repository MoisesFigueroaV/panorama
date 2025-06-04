// src/modules/usuario/usuario.routes.ts
import Elysia, { type Static, t, type Context, type Cookie, type StatusMap } from 'elysia'; // Importar Context
import {
  authMiddleware,
  requireAuth,
  type AppSession, // El tipo de session que viene del middleware
  // hasRole // Descomentar si se usa
} from '../../middleware/auth.middleware';
// import { SwaggerResponses } from '../../utils/swagger'; // Descomentar si se usa
import { CustomError, handleErrorLog } from '../../utils/errors';

import {
  registrarUsuarioService,
  loginUsuarioService,
  refreshTokenService,
  getUsuarioByIdService,
  updateUsuarioPerfilService,
} from './usuario.services';
import {
  registroUsuarioSchema,
  loginUsuarioSchema,
  loginResponseSchema,
  usuariosResponseSchema,
  updateUsuarioPerfilSchema,
  errorResponseSchema,
  refreshTokenSchema,
  accessTokenResponseSchema,
} from './usuario.types';

// Tipos para los payloads de los signers de JWT, deben ser consistentes
type SignerAccessPayload = { sub: string; rol?: number };
type SignerRefreshPayload = { sub: string };

// Tipo para el contexto enriquecido por authMiddleware
// Las propiedades `jwtAccess` y `jwtRefresh` también son añadidas por el plugin `jwt`
// y deberían estar disponibles en el contexto si `authMiddleware` se usa correctamente.
type AuthContext = Context & { 
    session: AppSession;
    jwtAccess: { sign: (payload: any) => Promise<string>; verify: (token: string) => Promise<any> };
    jwtRefresh: { sign: (payload: any) => Promise<string>; verify: (token: string) => Promise<any> };
};


export const usuarioRoutes = new Elysia({
  prefix: '/auth',
  detail: { tags: ['Autenticación'] },
})
.post(
    '/registro', // Confirmar que este es el endpoint correcto
    async ({ body, set }) => {
        console.log("ENTRO AL REGISTRO ")
      const usuario = await registrarUsuarioService(body);
      set.status = 201;
      console.log("USUARIO RESPONSE FINAL", usuario)
      return usuario;
    },
    {
      body: registroUsuarioSchema,
      response: {
        201: usuariosResponseSchema,
        400: errorResponseSchema,
        409: errorResponseSchema,
        500: errorResponseSchema,
      },
      detail: { summary: 'Registrar un nuevo usuario' },
    }
)
.post(
    '/login',
    async (context) => {
        const { body, set, jwtAccess, jwtRefresh } = context as Context & { jwtAccess: any; jwtRefresh: any };
        const { accessToken, refreshToken, usuario } = await loginUsuarioService(body as { correo: string; contrasena: string }, {
            access: (payload: SignerAccessPayload) => jwtAccess.sign(payload),
            refresh: (payload: SignerRefreshPayload) => jwtRefresh.sign(payload),
        });
        set.status = 200;
        return { accessToken, refreshToken, usuario };
    },
    {
      body: loginUsuarioSchema,
      response: { 200: loginResponseSchema, 400: errorResponseSchema, 401: errorResponseSchema, 500: errorResponseSchema },
      detail: { summary: 'Iniciar sesión de usuario' },
    }
)
.post(
    '/token/refresh',
    async (context) => {
        const { body, set, jwtAccess, jwtRefresh } = context as Context & { jwtAccess: any; jwtRefresh: any };
        try {
            const verifiedPayload = await jwtRefresh.verify((body as { refreshToken: string }).refreshToken);
            if (!verifiedPayload || typeof verifiedPayload.sub !== 'string') {
                throw new CustomError("Token de refresco inválido o expirado.", 401);
            }
            const { accessToken } = await refreshTokenService(
                { sub: verifiedPayload.sub },
                (payload: SignerAccessPayload) => jwtAccess.sign(payload)
            );
            set.status = 200;
            return { accessToken };
        } catch (error) {
            if (error instanceof CustomError) throw error;
            const errorTyped = error as Error;
            if (errorTyped.name === 'JWSSignFailed' || errorTyped.name === 'JWSInvalid' || errorTyped.message.includes('expired')) {
                 throw new CustomError("Token de refresco inválido o expirado.", 401);
            }
            handleErrorLog(error, 'ruta /token/refresh');
            throw new CustomError("Error al procesar el token de refresco.", 500);
        }
    },
    {
        body: refreshTokenSchema,
        response: { 200: accessTokenResponseSchema, 400: errorResponseSchema, 401: errorResponseSchema, 500: errorResponseSchema },
        detail: { summary: "Refrescar token de acceso" }
    }
);

export const userProfileRoutes = new Elysia({
    prefix: '/usuarios',
    detail: { tags: ['Usuarios'] }
})
.use(authMiddleware) // Aplicar middleware de autenticación
.get(
    '/yo',
    async (context) => {
        const session = (context as any).session as AppSession;
        const currentSession = requireAuth()(session);
        const usuario = await getUsuarioByIdService(currentSession.subAsNumber);
        return [usuario] as const;
    },
    {
        response: { 200: usuariosResponseSchema, 401: errorResponseSchema, 404: errorResponseSchema, 500: errorResponseSchema },
        detail: { summary: 'Obtener mi perfil de usuario', security: [{ bearerAuth: [] }] },
    }
)
.put(
    '/yo',
    async (context) => {
        const session = (context as any).session as AppSession;
        const currentSession = requireAuth()(session);
        const usuario = await updateUsuarioPerfilService(currentSession.subAsNumber, context.body as Static<typeof updateUsuarioPerfilSchema>);
        return [usuario] as const;
    },
    {
        body: updateUsuarioPerfilSchema,
        response: { 200: usuariosResponseSchema, 400: errorResponseSchema, 401: errorResponseSchema, 404: errorResponseSchema, 500: errorResponseSchema },
        detail: { summary: 'Actualizar mi perfil de usuario', security: [{ bearerAuth: [] }] },
    }
);