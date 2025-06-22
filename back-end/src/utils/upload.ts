import { supabase, isSupabaseConfigured } from '../lib/supabase'

export async function saveImage(file: File, filename?: string): Promise<string> {
  try {
    if (!isSupabaseConfigured()) {
      // Versión temporal: devolver una URL de placeholder
      console.log('⚠️ Supabase Storage no está configurado. Usando URL de placeholder.')
      return 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop'
    }

    console.log('🚀 Subiendo imagen a Supabase Storage...')

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const finalFilename = filename || `${timestamp}_${originalName}`
    
    console.log('📁 Nombre del archivo:', finalFilename)
    console.log('📂 Ruta completa: Imagenes/' + finalFilename)
    
    // Subir archivo a Supabase Storage en el bucket 'eventos-media' dentro de la carpeta 'Imagenes'
    const { data, error } = await supabase!.storage
      .from('eventos-media')
      .upload(`Imagenes/${finalFilename}`, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('❌ Error al subir imagen a Supabase:', error)
      console.error('❌ Detalle completo del error:', JSON.stringify(error, null, 2))
      throw new Error(`Error al subir imagen: ${error.message}`)
    }

    console.log('✅ Archivo subido exitosamente:', data)

    // Obtener URL pública de la imagen
    const { data: urlData } = supabase!.storage
      .from('eventos-media')
      .getPublicUrl(`Imagenes/${finalFilename}`)

    console.log('🔗 URL pública generada:', urlData.publicUrl)
    return urlData.publicUrl
  } catch (error) {
    console.error('❌ Error en saveImage:', error)
    throw error
  }
}

export function getImageUrl(filename: string): string {
  if (!isSupabaseConfigured()) {
    // Versión temporal: devolver una URL de placeholder
    return 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop'
  }

  const { data } = supabase!.storage
    .from('eventos-media')
    .getPublicUrl(`Imagenes/${filename}`)
  
  return data.publicUrl
}

export function getImagePath(filename: string): string {
  // Para Supabase, retornamos la URL pública
  return getImageUrl(filename)
} 