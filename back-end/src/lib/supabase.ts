import { createClient } from '@supabase/supabase-js'

// Usar las variables que están disponibles en el .env
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// VALIDACIÓN CRÍTICA: El backend SIEMPRE debe usar la clave de servicio.
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
  console.error('!!! FATAL: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben   !!!')
  console.error('!!! estar definidas en el archivo .env del backend.         !!!')
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
}

console.log('🔍 Configuración Supabase para Backend:', {
  hasUrl: !!supabaseUrl,
  hasServiceKey: !!supabaseServiceKey,
  urlLength: supabaseUrl?.length || 0,
  keyLength: supabaseServiceKey?.length || 0,
})

// Hacer la configuración opcional para que el servidor pueda iniciar, pero con logs claros.
export const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Función para verificar si Supabase está configurado
export function isSupabaseConfigured() {
  const configured = !!supabase
  if (!configured) {
    console.warn('⚠️ ADVERTENCIA: El cliente de Supabase no está configurado. Las operaciones de Storage fallarán.')
  }
  return configured
} 