import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import auth from './routes/auth';

// Bun automatically loads environment variables from .env files

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Rutas
app.route('/api/auth', auth);

// Ruta de prueba
app.get('/', (c) => c.text('¡Bienvenido al backend de Event Platform!'));

// Exportar la aplicación
export default app;
