const { syncSupabaseToMocks } = require('./sync-supabase-to-mocks');
const fs = require('fs');
const path = require('path');

async function testSync() {
  console.log('🧪 Iniciando prueba de sincronización...');
  
  try {
    // Ejecutar sincronización
    await syncSupabaseToMocks();
    
    // Verificar que los archivos se crearon
    const files = [
      '../mocks/eventos.json',
      '../mocks/organizadores.json', 
      '../mocks/categorias.json'
    ];
    
    console.log('\n📋 Verificando archivos generados:');
    
    for (const file of files) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`✅ ${path.basename(file)}: ${content.length || 0} registros (${(stats.size / 1024).toFixed(1)}KB)`);
      } else {
        console.log(`❌ ${path.basename(file)}: No encontrado`);
      }
    }
    
    // Verificar directorio de imágenes
    const imagesDir = path.join(__dirname, '../public/images');
    if (fs.existsSync(imagesDir)) {
      const images = fs.readdirSync(imagesDir);
      console.log(`✅ Directorio de imágenes: ${images.length} archivos`);
    } else {
      console.log('❌ Directorio de imágenes: No encontrado');
    }
    
    console.log('\n🎉 Prueba completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testSync();
}

module.exports = { testSync }; 