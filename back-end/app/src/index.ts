// src/index.ts
import Elysia, { t } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { errorPlugin } from './utils/errors';
import { authMiddleware } from './middleware/auth.middleware';
import * as dotenv from 'dotenv';

import { rolUsuarioRoutes } from './modules/rolUsuario/rolUsuario.routes';
import { usuarioRoutes, userProfileRoutes } from './modules/usuario/usuario.routes';
import { organizadorRoutes, adminOrganizadorRoutes } from './modules/organizador/organizador.routes';

dotenv.config();

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
const apiVersion = 'v1';
const port = parseInt(process.env.PORT || "3000"); 

const app = new Elysia()
  .use(swagger({
    path: '/api-docs',
    documentation: {
      info: {
        title: 'API de Eventos con Elysia y Dreizzer',
        version: '0.1.0', 
        description: `Backend para la aplicación de gestión de eventos.
        \nUtiliza Bearer Tokens (JWT) para la autenticación en rutas protegidas.`,
      },
      tags: [ 
        { name: 'General', description: 'Endpoints de estado de la API' },
        { name: 'Autenticación', description: 'Endpoints para registro e inicio de sesión' },
        { name: 'Roles de Usuario', description: 'Gestión de roles de usuario' },
        { name: 'Usuarios', description: 'Gestión de perfiles de usuario' },
        { name: 'Organizadores', description: 'Gestión de perfiles de organizadores de eventos' },
        { name: 'Admin - Organizadores', description: 'Administración de organizadores de eventos' },
      ],
      servers: [ 
        { url: `http://localhost:${port}`, description: 'Servidor Local (sin prefijo /api/v1)' },
        { url: `http://localhost:${port}/api/${apiVersion}`, description: 'Servidor Local con API v1' },
      ],
      components: { 
        securitySchemes: {
          bearerAuth: { 
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT', 
            description: 'Autenticación con Token JWT. Ingresa el token como: Bearer {token}',
          }
        }
      }
    },
  }))

  .use(cors({
    origin: frontendUrl, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflight: true,
  }))
  .use(errorPlugin) 
  .use(authMiddleware) 

  .get('/', () => ({
      message: '¡API de Eventos con Elysia y Dreizzer está operativa!',
      documentation: {
          swagger: '/api-docs',
      },
      api_version: apiVersion,
      status: 'OK',
      environment: process.env.NODE_ENV || 'development'
    }), {
    detail: {
      tags: ['General'],
      summary: "Verificar estado de la API",
    }
  })

  .group(`/api/${apiVersion}`, (api) => 
    api
      .use(rolUsuarioRoutes)        // ej. /api/v1/roles-usuario
      .use(usuarioRoutes)           // ej. /api/v1/auth (para registro, login, refresh)
      .use(userProfileRoutes)       // ej. /api/v1/usuarios (para /yo - perfil)
      .use(organizadorRoutes)       // ej. /api/v1/organizadores
      .use(adminOrganizadorRoutes)  // ej. /api/v1/admin/organizadores
  )

  .listen(port); 

if (app.server) {
  const protocol = (process.env.NODE_ENV === 'production' && !process.env.FORCE_HTTP_LOCAL) ? 'https' : 'http';
  
  let displayHostname = app.server.hostname;
  if (displayHostname === '0.0.0.0' || displayHostname === '::') {
    displayHostname = 'localhost';
  }

  const localUrl = `${protocol}://${displayHostname}:${port}`;
  const apiBaseUrl = `${localUrl}/api/${apiVersion}`;
  const swaggerUrl = `${localUrl}/api-docs`;
  const scalarUrl = `${localUrl}/scalar-docs`;

  console.log(`\n🚀 Servidor Elysia (con Dreizzer ORM) iniciado!`);
  console.log(`      Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`      Local: ${localUrl}`);
  console.log(`   API Base: ${apiBaseUrl}`);
  console.log(`--------------------------------------------------------------`);
  console.log(`📖 Docs (Swagger UI): ${swaggerUrl}`);
  console.log(`--------------------------------------------------------------`);
  console.log(`🔗 Frontend (Next.js) esperado en: ${frontendUrl}`);
  console.log(`   (Asegúrate de que CORS esté configurado para esta URL)`);
  console.log(`\n🦊 ¡Listo para las peticiones!`);

} else {
  console.log(
    `🦊 Aplicación Elysia (utilizando Dreizzer ORM) configurada para correr en el puerto ${port}. Servidor no iniciado inmediatamente.`
  );
}

export type App = typeof app; 