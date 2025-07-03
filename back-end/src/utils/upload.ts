import { supabase, isSupabaseConfigured } from '../lib/supabase'

export async function saveImage(file: File, filename?: string, folder: string = 'Imagenes'): Promise<string> {
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
    console.log('📂 Ruta completa:', `${folder}/${finalFilename}`)
    
    // Subir archivo a Supabase Storage en el bucket 'eventos-media' dentro de la carpeta correspondiente
    const { data, error } = await supabase!.storage
      .from('eventos-media')
      .upload(`${folder}/${finalFilename}`, file, {
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
      .getPublicUrl(`${folder}/${finalFilename}`)

    console.log('🔗 URL pública generada:', urlData.publicUrl)
    return urlData.publicUrl
  } catch (error) {
    console.error('❌ Error en saveImage:', error)
    throw error
  }
}

/**
 * Construye la URL pública de un archivo en Supabase Storage.
 * Esta función es "idempotente": si ya recibe una URL completa, la devuelve sin cambios.
 * @param filePath La ruta del archivo o una URL completa.
 * @returns La URL pública completa y válida.
 */
export function getImageUrl(filePath: string): string {
  if (!filePath) {
    return ''; 
  }

  // Si la cadena ya empieza con 'http', asumimos que es una URL válida y la devolvemos tal cual.
  if (filePath.startsWith('http')) {
    return filePath;
  }
  
  if (!isSupabaseConfigured()) {
    console.warn('Supabase no está configurado, devolviendo URL de placeholder para imagen.');
    return 'https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?w=600&q=80';
  }

  const { data } = supabase!.storage
    .from('eventos-media')
    // CAMBIO TEMPORAL: quitamos la carpeta Imagenes/
    .getPublicUrl(`${filePath}`);
  
  return data.publicUrl;
}

export function getImagePath(filename: string): string {
  // Para Supabase, retornamos la URL pública
  return getImageUrl(filename)
} 