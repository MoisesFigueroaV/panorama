// src/index.ts
import Elysia, { t } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { errorPlugin } from './utils/errors';
import * as dotenv from 'dotenv';

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
        description: 'Backend para la aplicación de gestión de eventos.',
      },
      tags: [
        { name: 'General', description: 'Endpoints de estado de la API' },
        // Añadiremos más tags a medida que creemos módulos
      ],
    },
  }))
  .use(cors({
    origin: frontendUrl, // Permite solicitudes desde tu frontend Next.js
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflight: true,
  }))
  .use(errorPlugin) // Registra tu manejador de errores global

  // Ruta raíz de bienvenida
  .get('/', () => ({
      message: '¡API de Eventos con Elysia y Dreizzer está operativa!',
      documentation: {
          swagger: '/api-docs'
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

  .listen(port);

if (app.server) {
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const hostname = app.server.hostname === '0.0.0.0' || app.server.hostname === '::' ? 'localhost' : app.server.hostname;

  console.log(`\n🚀 Servidor Elysia (con Dreizzer ORM) iniciado!`);
  console.log(`      Local: ${protocol}://${hostname}:${port}`);
  console.log(`--------------------------------------------------------------`);
  console.log(`📖 Docs (Swagger UI): ${protocol}://${hostname}:${port}/api-docs`);
  console.log(`--------------------------------------------------------------`);
  console.log(`🔗 Frontend (Next.js) esperado en: ${frontendUrl}`);
}

export type App = typeof app; // Para inferencia de tipos si usas Eden Treaty