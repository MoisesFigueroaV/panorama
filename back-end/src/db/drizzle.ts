import { drizzle } from 'drizzle-orm/node-postgres'; // Para PostgreSQL con Node.js/Bun
import { Pool, type PoolConfig } from 'pg';       // Driver de PostgreSQL
import { sql } from 'drizzle-orm';
import * as schema from './schema';               // Importa todos tus schemas de Drizzle

// --- Carga de Variables de Entorno ---
const databaseUrl = process.env.DATABASE_URL;
const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const enableDbLogger = process.env.DB_LOGGER === 'true' || (!isProduction && process.env.DB_LOGGER !== 'false');

if (!databaseUrl) {
  console.error("🔴 FATAL ERROR: La variable de entorno DATABASE_URL no está definida.");
  console.error("   Asegúrate de que DATABASE_URL esté configurada con la cadena de conexión URI de tu base de datos Supabase PostgreSQL.");
  console.error("   Ejemplo: postgresql://postgres:[PASSWORD]@[HOST].supabase.co:5432/postgres");
  process.exit(1);
}

// --- Configuración del Pool de Conexiones para PostgreSQL ---
const poolConfig: PoolConfig = {
  connectionString: databaseUrl,
  // Supabase y la mayoría de los proveedores de DB en la nube requieren SSL.
  // El driver 'pg' generalmente maneja SSL automáticamente si la URL lo especifica (sslmode=require).
  // Para mayor control o si hay problemas con certificados autofirmados en desarrollo local (no aplica a Supabase generalmente):
  // ssl: isProduction ? { rejectUnauthorized: true } : { rejectUnauthorized: false },
  // Valores recomendados para el pool:
  max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX) : 10, // Máximo de clientes en el pool
  idleTimeoutMillis: process.env.DB_POOL_IDLE_TIMEOUT ? parseInt(process.env.DB_POOL_IDLE_TIMEOUT) : 30000, // Tiempo que un cliente puede estar inactivo
  connectionTimeoutMillis: process.env.DB_POOL_CONNECTION_TIMEOUT ? parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT) : 2000, // Tiempo para establecer una conexión
};

const pool = new Pool(poolConfig);

pool.on('connect', (client) => {
  console.log(`🔗 Nuevo cliente conectado al pool de PostgreSQL. Clientes totales: ${pool.totalCount}, Inactivos: ${pool.idleCount}, Esperando: ${pool.waitingCount}`);
  // Podrías configurar parámetros de sesión aquí si es necesario, ej: client.query('SET TIME ZONE "UTC";')
});

pool.on('error', (err, client) => {
  console.error('❌ Error inesperado en un cliente del pool de PostgreSQL:', err);
  // Considera si debes terminar la aplicación en errores graves del pool,
  // o si el pool puede recuperarse. `pg` intenta ser resiliente.
});

// --- Inicialización de Drizzle ORM (Dreizzer) ---
export const db = drizzle(pool, {
  schema, // Todos tus schemas de tabla importados
  logger: enableDbLogger, // Activa logs de Drizzle si enableDbLogger es true (útil en desarrollo)
});

console.log(`🔵 Drizzle ORM (Dreizzer) inicializado y conectado a PostgreSQL (Supabase).`);
console.log(`   Modo Logger de Drizzle: ${enableDbLogger ? 'Activado' : 'Desactivado'}`);
console.log(`   Configuración del Pool: Max Clientes=${poolConfig.max}, Timeout Inactivo=${poolConfig.idleTimeoutMillis}ms`);


// --- Prueba de Conexión Opcional al Iniciar ---
async function verifyDatabaseConnection() {
  if (nodeEnv === 'test') return; // No ejecutar durante tests si la DB es mockeada

  try {
    // `sql` de 'drizzle-orm' para una query simple
    await db.execute(sql`SELECT NOW() as current_time;`);
    console.log('✅ Conexión con la base de datos Supabase verificada exitosamente.');
  } catch (error) {
    console.error('🔴 Error crítico al verificar la conexión inicial con la base de datos Supabase:', error);
    // Podrías decidir terminar la aplicación si la conexión inicial falla en producción.
    // process.exit(1);
  }
}

verifyDatabaseConnection();