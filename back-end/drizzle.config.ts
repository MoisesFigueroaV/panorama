import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' }); // Carga variables de entorno del .env

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env file');
}

export default {
  schema: './src/db/schema/index.ts', // Ruta a tu archivo principal de schemas
  out: './drizzle/migrations',       // Carpeta donde se guardarán las migraciones
  driver: 'pg',                      // Especifica que usas PostgreSQL
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
  verbose: true, // Muestra más información durante la ejecución de drizzle-kit
  strict: true,  // Modo estricto para la generación de schemas
} satisfies Config;