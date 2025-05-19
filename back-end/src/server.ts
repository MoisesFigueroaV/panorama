import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import dotenv from 'dotenv';

dotenv.config();

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Ruta de prueba
app.get('/', (c) => c.text('¡Bienvenido al backend de Event Platform!'));

// Exportar la aplicación
export default app;
