// src/index.ts
import Elysia, { t } from 'elysia';
import { swagger } from '@elysiajs/swagger';
//import { scalar } from '@elysiajs/scalar'; // Asegúrate de que este paquete esté instalado si lo usas
import { cors } from '@elysiajs/cors';
import { errorPlugin } from './utils/errors';
import { authMiddleware } from './middleware/auth.middleware';
import * as dotenv from 'dotenv';

// --- IMPORTA TUS MÓDULOS DE RUTAS AQUÍ ---
import { rolUsuarioRoutes } from './modules/rolUsuario/rolUsuario.routes';
import { usuarioRoutes, userProfileRoutes } from './modules/usuario/usuario.routes';
import { organizadorRoutes, adminOrganizadorRoutes } from './modules/organizador/organizador.routes';
// ... y cualquier otro módulo que hayas creado (ej. eventoRoutes)

// Cargar variables de entorno al inicio
dotenv.config();

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
const apiVersion = 'v1';
const port = parseInt(process.env.PORT || "3000"); // Asegurarse que port es número

const app = new Elysia()
  .use(swagger({
    path: '/api-docs',
    documentation: {
      info: {
        title: 'API de Eventos con Elysia y Dreizzer',
        version: '0.1.0', // Inicia con una versión temprana
        description: `Backend para la aplicación de gestión de eventos.
        \nUtiliza Bearer Tokens (JWT) para la autenticación en rutas protegidas.`,
      },
      tags: [ // Tags para agrupar tus endpoints en la UI
        { name: 'General', description: 'Endpoints de estado de la API' },
        { name: 'Autenticación', description: 'Endpoints para registro e inicio de sesión' },
        { name: 'Roles de Usuario', description: 'Gestión de roles de usuario' },
        { name: 'Usuarios', description: 'Gestión de perfiles de usuario' },
        { name: 'Organizadores', description: 'Gestión de perfiles de organizadores de eventos' },
        { name: 'Admin - Organizadores', description: 'Administración de organizadores de eventos' },
        // Añade más tags a medida que crees módulos
      ],
      servers: [ // URLs donde tu API está disponible
        { url: `http://localhost:${port}`, description: 'Servidor Local (sin prefijo /api/v1)' },
        { url: `http://localhost:${port}/api/${apiVersion}`, description: 'Servidor Local con API v1' },
        // { url: 'https://tu-api-en-produccion.com', description: 'Servidor de Producción' } // Ejemplo para producción
      ],
      components: { // Definiciones de seguridad
        securitySchemes: {
          bearerAuth: { // Nombre que le das a tu esquema de seguridad
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT', // Informativo
            description: 'Autenticación con Token JWT. Ingresa el token como: Bearer {token}',
          }
        }
      }
    },
  }))
  // Descomenta y configura Scalar si lo tienes instalado y quieres usarlo
  // .use(scalar({
  //   path: '/scalar-docs',
  //   spec: {
  //     url: '/api-docs/json', // Usualmente donde Swagger expone el JSON
  //   }
  // }))
  .use(cors({
    origin: frontendUrl, // Permite solicitudes desde tu frontend Next.js
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflight: true,
  }))
  .use(errorPlugin) // Registra tu manejador de errores global
  .use(authMiddleware)  // Registra el middleware de autenticación globalmente

  // Ruta raíz de bienvenida
  .get('/', () => ({
      message: '¡API de Eventos con Elysia y Dreizzer está operativa!',
      documentation: {
          swagger: '/api-docs',
          // scalar: '/scalar-docs' // Descomenta si usas Scalar
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

  // --- SECCIÓN DE REGISTRO DE MÓDULOS DE RUTAS ---
  .group(`/api/${apiVersion}`, (api) => // Crea el prefijo /api/v1 para todos los módulos registrados aquí
    api
      .use(rolUsuarioRoutes)        // ej. /api/v1/roles-usuario
      .use(usuarioRoutes)           // ej. /api/v1/auth (para registro, login, refresh)
      .use(userProfileRoutes)       // ej. /api/v1/usuarios (para /yo - perfil)
      .use(organizadorRoutes)       // ej. /api/v1/organizadores
      .use(adminOrganizadorRoutes)  // ej. /api/v1/admin/organizadores
      // .use(eventoRoutes)         // Cuando crees el módulo de eventos
  )
  // --- FIN DE SECCIÓN DE REGISTRO ---

  .listen(port); // .listen() debe ser lo último

// --- MENSAJES DE CONSOLA AL INICIAR (VERSIÓN DETALLADA) ---
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
  // Descomenta la siguiente línea si tienes Scalar configurado y funcionando:
  // console.log(`✨ Docs (Scalar UI):  ${scalarUrl}`);
  console.log(`--------------------------------------------------------------`);
  console.log(`🔗 Frontend (Next.js) esperado en: ${frontendUrl}`);
  console.log(`   (Asegúrate de que CORS esté configurado para esta URL)`);
  console.log(`\n🦊 ¡Listo para las peticiones!`);

} else {
  console.log(
    `🦊 Aplicación Elysia (utilizando Dreizzer ORM) configurada para correr en el puerto ${port}. Servidor no iniciado inmediatamente.`
  );
}

export type App = typeof app; // Para inferencia de tipos si usas Eden Treaty