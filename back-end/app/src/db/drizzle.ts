// src/db/drizzle.ts
import { drizzle } from 'drizzle-orm/node-postgres'; // Adaptador de Drizzle para node-postgres
import { Pool, type PoolConfig } from 'pg';       // Driver nativo de PostgreSQL para Node.js
import { sql } from 'drizzle-orm';                // Para ejecutar SQL crudo si es necesario
import * as schema from './schema';               // Importará todos tus schemas de Drizzle (ej. rolUsuario.schema, etc.)

// --- Carga de Variables de Entorno ---
const databaseUrl = process.env.DATABASE_URL;
const nodeEnv = process.env.NODE_ENV || 'development'; // 'development', 'production', 'test'
const isProduction = nodeEnv === 'production';

// Determinar si se activa el logger de Drizzle
// Se activa si DB_LOGGER=true, o si no estamos en producción Y DB_LOGGER no es explícitamente 'false'
const enableDbLogger =
  process.env.DB_LOGGER === 'true' ||
  (!isProduction && process.env.DB_LOGGER !== 'false');

if (!databaseUrl) {
  console.error("🔴 FATAL ERROR: La variable de entorno DATABASE_URL no está definida.");
  console.error("   Asegúrate de que DATABASE_URL esté configurada con la cadena de conexión URI");
  console.error("   de tu base de datos Supabase PostgreSQL (desde Project Settings > Database > Connection string).");
  console.error("   Ejemplo: postgresql://postgres:[PASSWORD]@[HOST].supabase.co:5432/postgres");
  process.exit(1); // Termina la aplicación si no hay URL de DB, es crítico.
}

// --- Configuración del Pool de Conexiones para PostgreSQL ---
const poolConfig: PoolConfig = {
  connectionString: databaseUrl,
  // Valores recomendados para el pool (puedes ajustarlos según tus necesidades y el plan de Supabase)
  max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX, 10) : (isProduction ? 10 : 5), // Máximo de clientes en el pool
  idleTimeoutMillis: process.env.DB_POOL_IDLE_TIMEOUT ? parseInt(process.env.DB_POOL_IDLE_TIMEOUT, 10) : (isProduction ? 10000 : 5000), // Tiempo que un cliente puede estar inactivo antes de cerrarse
  connectionTimeoutMillis: process.env.DB_POOL_CONNECTION_TIMEOUT ? parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT, 10) : 5000, // Tiempo para establecer una conexión
  // Supabase requiere SSL. El driver 'pg' generalmente lo maneja automáticamente si la URL lo especifica (sslmode=require).
  // Si tienes problemas de certificados (muy raro con Supabase, más común con DBs locales autofirmadas), podrías necesitar:
  // ssl: isProduction ? { rejectUnauthorized: true } : { rejectUnauthorized: false }, // ¡Cuidado con rejectUnauthorized: false en producción!
};

const pool = new Pool(poolConfig);

// --- Eventos del Pool (Opcional, para logging y depuración) ---
pool.on('connect', (client) => {
  console.log(
    `🔗 Nuevo cliente PostgreSQL conectado al pool. (Total: ${pool.totalCount}, Inactivos: ${pool.idleCount}, Esperando: ${pool.waitingCount})`
  );
  // Podrías configurar parámetros de sesión por defecto aquí si fuera necesario:
  // client.query('SET TIME ZONE "UTC";');
});

pool.on('error', (err, client) => {
  console.error('❌ Error inesperado en un cliente del pool de PostgreSQL:', err);
  // Considera estrategias de reconexión o terminación de la app si los errores son persistentes.
  // El pool `pg` intenta ser resiliente.
});

pool.on('remove', (client) => {
    console.log(
    `🔌 Cliente PostgreSQL desconectado del pool. (Total: ${pool.totalCount}, Inactivos: ${pool.idleCount}, Esperando: ${pool.waitingCount})`
  );
});


// --- Inicialización de Drizzle ORM (Dreizzer) ---
// Aquí es donde Drizzle se "conecta" con tu base de datos a través del pool
// y se entera de tus tablas a través del objeto `schema`.
export const db = drizzle(pool, {
  schema, // Todos tus schemas de tabla definidos en ./schema/index.ts
  logger: enableDbLogger, // Activa logs de Drizzle SQL si es true (muy útil en desarrollo)
});

console.log(`🔵 Drizzle ORM (Dreizzer) inicializado.`);
if (enableDbLogger) {
  console.log(`   🪵 Logger de Drizzle SQL: Activado`);
} else {
  console.log(`   🪵 Logger de Drizzle SQL: Desactivado (Producción o DB_LOGGER=false)`);
}
console.log(`   🏦 Configuración del Pool: Max Clientes=${poolConfig.max}, Timeout Inactivo=${poolConfig.idleTimeoutMillis}ms`);


// --- Prueba de Conexión Opcional al Iniciar la Aplicación ---
// Esto ayuda a detectar problemas de conexión con la DB rápidamente.
async function verifyDatabaseConnection() {
  // No ejecutar esta prueba durante los tests unitarios/integración si la DB es mockeada
  // o si este archivo es importado por drizzle-kit (que no necesita una conexión de app).
  if (nodeEnv === 'test' || process.env.DRIZZLE_KIT_RUNNING === 'true') {
    return;
  }

  try {
    // `sql` de 'drizzle-orm' para una query de prueba simple y segura
    const result = await db.execute(sql`SELECT NOW() as current_time;`);
    // console.log('Resultado de prueba de conexión:', result); // Descomentar para ver el resultado
    console.log('✅ Conexión con la base de datos Supabase PostgreSQL verificada exitosamente.');
  } catch (error) {
    console.error('🔴 Error CRÍTICO al verificar la conexión inicial con la base de datos Supabase PostgreSQL:');
    console.error(error);
    // En producción, podrías considerar terminar la aplicación si la DB no está disponible al inicio.
    // process.exit(1);
  }
}

// Ejecutar la verificación de conexión
verifyDatabaseConnection();