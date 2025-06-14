// src/db/drizzle.ts
import { drizzle } from 'drizzle-orm/node-postgres'; 
import { Pool, type PoolConfig } from 'pg';       
import { sql } from 'drizzle-orm';               
import * as schema from './schema';               

// src/db/drizzle.ts
import * as allSchemas from './schema'; // Importa todos los schemas
// Importa las relaciones explícitamente si no están en allSchemas por defecto
import { usuarioTable, usuarioRelations } from './schema/usuario.schema';
import { organizadorTable, organizadorRelations } from './schema/organizador.schema';
import { rolUsuarioTable } from './schema/rolUsuario.schema';
import { estadoAcreditacionTable } from './schema/estadoAcreditacion.schema';
import { historialEstadoAcreditacionTable } from './schema/historialEstadoAcreditacion.schema';
import { eventoTable, eventoRelations } from './schema/evento.schema';
//import { adminRelations } from './schema/rolUsuario.schema';
// ...

const databaseUrl = process.env.DATABASE_URL;
const nodeEnv = process.env.NODE_ENV || 'development'; 
const isProduction = nodeEnv === 'production';

const enableDbLogger =
  process.env.DB_LOGGER === 'true' ||
  (!isProduction && process.env.DB_LOGGER !== 'false');

if (!databaseUrl) {
  console.error("🔴 FATAL ERROR: La variable de entorno DATABASE_URL no está definida.");
  console.error("   Asegúrate de que DATABASE_URL esté configurada con la cadena de conexión URI");
  console.error("   de tu base de datos Supabase PostgreSQL (desde Project Settings > Database > Connection string).");
  console.error("   Ejemplo: postgresql://postgres:[PASSWORD]@[HOST].supabase.co:5432/postgres");
  process.exit(1);
}

const poolConfig: PoolConfig = {
  connectionString: databaseUrl,
  max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX, 10) : (isProduction ? 10 : 5), 
  idleTimeoutMillis: process.env.DB_POOL_IDLE_TIMEOUT ? parseInt(process.env.DB_POOL_IDLE_TIMEOUT, 10) : (isProduction ? 10000 : 5000), 
  connectionTimeoutMillis: process.env.DB_POOL_CONNECTION_TIMEOUT ? parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT, 10) : 5000, 
};

const pool = new Pool(poolConfig);

pool.on('connect', (client) => {
  console.log(
    `🔗 Nuevo cliente PostgreSQL conectado al pool. (Total: ${pool.totalCount}, Inactivos: ${pool.idleCount}, Esperando: ${pool.waitingCount})`
  );
});

pool.on('error', (err, client) => {
  console.error('❌ Error inesperado en un cliente del pool de PostgreSQL:', err);
});

pool.on('remove', (client) => {
    console.log(
    `🔌 Cliente PostgreSQL desconectado del pool. (Total: ${pool.totalCount}, Inactivos: ${pool.idleCount}, Esperando: ${pool.waitingCount})`
  );
});

export const db = drizzle(pool, {
  schema: {
    ...schema,
    ...allSchemas, // Todos tus schemas de tabla
    usuarioRelations,    // Añade las relaciones de usuario
    organizadorRelations,
    eventoRelations
  },
  logger: enableDbLogger, 
});

console.log(`🔵 Drizzle ORM (Dreizzer) inicializado.`);
if (enableDbLogger) {
  console.log(`   🪵 Logger de Drizzle SQL: Activado`);
} else {
  console.log(`   🪵 Logger de Drizzle SQL: Desactivado (Producción o DB_LOGGER=false)`);
}
console.log(`   🏦 Configuración del Pool: Max Clientes=${poolConfig.max}, Timeout Inactivo=${poolConfig.idleTimeoutMillis}ms`);

async function verifyDatabaseConnection() {
  if (nodeEnv === 'test' || process.env.DRIZZLE_KIT_RUNNING === 'true') {
    return;
  }

  try {
    const result = await db.execute(sql`SELECT NOW() as current_time;`);
    console.log('✅ Conexión con la base de datos Supabase PostgreSQL verificada exitosamente.');
  } catch (error) {
    console.error('🔴 Error CRÍTICO al verificar la conexión inicial con la base de datos Supabase PostgreSQL:');
    console.error(error);

  }
}

verifyDatabaseConnection();