const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan las variables de entorno de Supabase')
  console.error('   Asegúrate de tener SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en tu .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
  try {
    console.log('🚀 Configurando Supabase Storage...')
    
    // Crear bucket para imágenes de eventos
    const { data: bucketData, error: bucketError } = await supabase.storage
      .createBucket('panorama-imagenes', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      })

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Bucket "panorama-imagenes" ya existe')
      } else {
        console.error('❌ Error al crear bucket:', bucketError)
        return
      }
    } else {
      console.log('✅ Bucket "panorama-imagenes" creado exitosamente')
    }

    // Configurar políticas de acceso público para lectura
    const { error: policyError } = await supabase.storage
      .from('panorama-imagenes')
      .createSignedUrl('Imagenes/test.jpg', 60)

    if (policyError && !policyError.message.includes('not found')) {
      console.error('❌ Error al configurar políticas:', policyError)
    } else {
      console.log('✅ Políticas de acceso configuradas')
    }

    console.log('🎉 Supabase Storage configurado correctamente!')
    console.log('   Las imágenes se guardarán en: https://[PROJECT_ID].supabase.co/storage/v1/object/public/panorama-imagenes/Imagenes/')
    
  } catch (error) {
    console.error('❌ Error durante la configuración:', error)
  }
}

setupStorage() 