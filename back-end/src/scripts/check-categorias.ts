import { db } from '../db/drizzle';
import { categoriaEventoTable } from '../db/schema/categoriaEvento.schema';
import { estadoEventoTable } from '../db/schema/estadoEvento.schema';

async function checkCategorias() {
  console.log('🔍 Verificando categorías existentes...');
  
  try {
    const categorias = await db.select().from(categoriaEventoTable);
    console.log('📋 Categorías encontradas:', categorias);
    
    const estados = await db.select().from(estadoEventoTable);
    console.log('📋 Estados encontrados:', estados);
    
    console.log('✅ Verificación completada');
  } catch (error) {
    console.error('❌ Error al verificar:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkCategorias().then(() => {
    console.log('🎉 Script completado');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Error:', error);
    process.exit(1);
  });
}

export { checkCategorias }; 