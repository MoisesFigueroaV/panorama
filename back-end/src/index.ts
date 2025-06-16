// src/index.ts
import Elysia, { t } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { errorPlugin } from './utils/errors';
import { authMiddleware } from './middleware/auth.middleware';
import * as dotenv from 'dotenv';

// ====================================================================
// IMPORTACIÓN DE TODOS LOS MÓDULOS DE RUTAS
// ====================================================================

import { rolUsuarioRoutes } from './modules/rolUsuario/rolUsuario.routes';
import { usuarioRoutes, userProfileRoutes } from './modules/usuario/usuario.routes';
import {
  authOrganizadorRoutes,
  organizadorUsuarioRoutes,
  publicOrganizadorRoutes
} from './modules/organizador/organizador.routes';
import { eventoRoutes } from './modules/evento/evento.routes';
import { adminRoutes } from './modules/admin/admin.routes';

// Cargar variables de entorno
dotenv.config();

// ====================================================================
// CONFIGURACIÓN DE LA APLICACIÓN
// ====================================================================
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
const apiVersion = 'v1';
const port = parseInt(process.env.PORT || "3000");

const app = new Elysia()
  // 1. Configuración de Swagger para la documentación de la API
  .use(swagger({
    path: '/api-docs',
    documentation: {
      info: {
        title: 'API de Eventos con Elysia y Dreizzer',
        version: '0.1.0',
        description: `Backend para la aplicación de gestión de eventos.\nUtiliza Bearer Tokens (JWT) para la autenticación en rutas protegidas.`,
      },
      tags: [
        { name: 'General', description: 'Endpoints de estado de la API' },
        { name: 'Autenticación', description: 'Endpoints para registro e inicio de sesión' },
        { name: 'Roles de Usuario', description: 'Gestión de roles de usuario' },
        { name: 'Usuarios', description: 'Gestión de perfiles de usuario' },
        { name: 'Organizadores', description: 'Gestión de perfiles de organizadores de eventos' },
        { name: 'Admin', description: 'Operaciones de administración (KPIs, gestión de usuarios, organizadores, etc.)' },
        { name: 'Eventos', description: 'Gestión de eventos, incluyendo creación, actualización y consulta' },
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

  // 2. Configuración de CORS para permitir peticiones desde el frontend
  .use(cors({
    origin: frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflight: true,
  }))

  // 3. Plugins de Elysia para manejo de errores y autenticación
  .use(errorPlugin)
  .use(authMiddleware)

  // 4. Ruta raíz para verificar que la API está funcionando
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

  // ====================================================================
  // AGRUPACIÓN Y REGISTRO DE TODAS LAS RUTAS DE LA API
  // ====================================================================
  .group(`/api/${apiVersion}`, (api) =>
    api
      .use(rolUsuarioRoutes)
      .use(usuarioRoutes)
      .use(userProfileRoutes)
      .use(authOrganizadorRoutes)
      .use(organizadorUsuarioRoutes)
      .use(publicOrganizadorRoutes)
      .use(adminRoutes)
      .use(eventoRoutes)
  )

  // Iniciar el servidor
  .listen(port);

// ====================================================================
// "TERMINAL DECORADA" - MENSAJE DE INICIO DEL SERVIDOR
// ====================================================================
if (app.server) {
  const protocol = (process.env.NODE_ENV === 'production' && !process.env.FORCE_HTTP_LOCAL)
    ? 'https'
    : 'http';

  let displayHostname = app.server.hostname;
  if (displayHostname === '0.0.0.0' || displayHostname === '::') {
    displayHostname = 'localhost';
  }

  const localUrl = `${protocol}://${displayHostname}:${port}`;
  const apiBaseUrl = `${localUrl}/api/${apiVersion}`;
  const swaggerUrl = `${localUrl}/api-docs`;

  const colors = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    magenta: "\x1b[35m",
  };

  console.log(`\n${colors.bold}${colors.magenta}🚀 Servidor Elysia (con Dreizzer ORM) iniciado!${colors.reset}`);
  console.log(`\n  ${colors.yellow}Entorno:${colors.reset}       ${process.env.NODE_ENV || 'development'}`);
  console.log(`  ${colors.yellow}URL Local:${colors.reset}       ${localUrl}`);
  console.log(`  ${colors.yellow}Base de la API:${colors.reset}  ${apiBaseUrl}`);

  console.log(`\n${colors.cyan}--------------------------------------------------------------${colors.reset}`);
  console.log(`  📖 ${colors.bold}Documentación API (Swagger UI):${colors.reset} ${swaggerUrl}`);
  console.log(`${colors.cyan}--------------------------------------------------------------${colors.reset}`);

  console.log(`\n  🔗 ${colors.bold}Frontend (Next.js) esperado en:${colors.reset} ${frontendUrl}`);
  console.log(`     (Asegúrate de que CORS esté configurado para esta URL)`);

  console.log(`\n${colors.green}${colors.bold}🦊 ¡Listo para recibir peticiones!${colors.reset}\n`);

} else {
  console.log(
    `🦊 Aplicación Elysia (utilizando Dreizzer ORM) configurada para correr en el puerto ${port}.`
  );
}

// Exportar el tipo de la app para el cliente de pruebas (si lo usas)
export type App = typeof app;
