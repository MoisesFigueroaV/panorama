const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Cargar variables de entorno desde .env.local
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log('✅ Archivo .env.local cargado correctamente');
} else {
  console.warn('⚠️ Archivo .env.local no encontrado, usando variables de entorno del sistema');
  require('dotenv').config();
}

// Configuración de Supabase

// Usar siempre la anon key y limpiar la URL de barra final
function cleanUrl(url) {
  if (!url) return '';
  return url.endsWith('/') ? url.slice(0, -1) : url;
}
const supabaseUrl = cleanUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://bflgrsdkjdyyeutafacc.supabase.co');
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ Error: Falta la variable NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('   Asegúrate de tener NEXT_PUBLIC_SUPABASE_ANON_KEY en tu .env.local');
  console.error('');
  console.error('   Ejemplo de .env.local:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL=https://bflgrsdkjdyyeutafacc.supabase.co');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui');
  process.exit(1);
}

console.log('🔍 Configuración Supabase:');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);
console.log(`   Key completa: ${supabaseKey}`);
console.log('');

// Verificar que la key no sea un placeholder
if (supabaseKey.includes('tu-anon-key') || supabaseKey.includes('REAL_KEY_HERE') || supabaseKey.length < 100) {
  console.error('❌ Error: La API key parece ser un placeholder o no es válida');
  console.error('   Asegúrate de usar la anon key real de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Función para probar la conexión
async function testConnection() {
  try {
    console.log('🔍 Probando conexión con Supabase...');
    
    // Intentar una consulta simple
    const { data, error } = await supabase
      .from('categoria_evento')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Error de conexión:', error);
      return false;
    }
    
    console.log('✅ Conexión exitosa con Supabase');
    return true;
  } catch (error) {
    console.error('❌ Error al probar conexión:', error);
    return false;
  }
}

// Rutas de archivos
const MOCKS_DIR = path.join(__dirname, '../mocks');
// Cambiar la ruta de IMAGES_DIR para que sea /public/mocks/images
const IMAGES_DIR = path.join(__dirname, '../public/mocks/images');
const EVENTOS_FILE = path.join(MOCKS_DIR, 'eventos.json');
const ORGANIZADORES_FILE = path.join(MOCKS_DIR, 'organizadores.json');
const CATEGORIAS_FILE = path.join(MOCKS_DIR, 'categorias.json');
// NUEVO: rutas para los nuevos mocks
const ESTADOS_EVENTO_FILE = path.join(MOCKS_DIR, 'estados_evento.json');
const USUARIOS_FILE = path.join(MOCKS_DIR, 'usuarios.json');
const ROLES_FILE = path.join(MOCKS_DIR, 'roles.json');
const NOTIFICACIONES_FILE = path.join(MOCKS_DIR, 'notificaciones.json');
const HISTORIAL_ACREDITACION_FILE = path.join(MOCKS_DIR, 'historial_acreditacion.json');
const HISTORIAL_ESTADO_NOTIFICACION_FILE = path.join(MOCKS_DIR, 'historial_estado_notificacion.json');

// Crear directorios si no existen
function ensureDirectories() {
  if (!fs.existsSync(MOCKS_DIR)) {
    fs.mkdirSync(MOCKS_DIR, { recursive: true });
  }
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }
}

// Limpiar la carpeta de imágenes antes de sincronizar
function cleanImagesDir() {
  if (fs.existsSync(IMAGES_DIR)) {
    fs.readdirSync(IMAGES_DIR).forEach(file => {
      fs.unlinkSync(path.join(IMAGES_DIR, file));
    });
  } else {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }
}

// Refuerzo: si la descarga falla, siempre poner /placeholder.svg y guardar la original
async function downloadImage(imageUrl, filename) {
  try {
    if (!imageUrl || imageUrl === 'null' || imageUrl === null || imageUrl === undefined || imageUrl === '') return { local: '/placeholder.svg', original: '' };
    // Si es una URL externa (http/https)
    if (imageUrl.startsWith('http')) {
      const mod = imageUrl.startsWith('https') ? require('https') : require('http');
      const localPath = path.join(IMAGES_DIR, filename);
      return new Promise((resolve) => {
        mod.get(imageUrl, (response) => {
          if (response.statusCode !== 200) {
            console.warn(`⚠️ No se pudo descargar imagen externa: ${imageUrl}`);
            return resolve({ local: '/placeholder.svg', original: imageUrl });
          }
          const file = fs.createWriteStream(localPath);
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve({ local: `/mocks/images/${filename}`, original: imageUrl });
          });
        }).on('error', () => {
          resolve({ local: '/placeholder.svg', original: imageUrl });
        });
      });
    }
    // Si es una ruta de Supabase Storage
    const { data, error } = await supabase.storage
      .from('eventos-media')
      .download(imageUrl);
    if (error) {
      console.error(`❌ Error al descargar imagen de storage ${imageUrl}:`, error);
      return { local: '/placeholder.svg', original: imageUrl };
    }
    const localPath = path.join(IMAGES_DIR, filename);
    fs.writeFileSync(localPath, Buffer.from(await data.arrayBuffer()));
    return { local: `/mocks/images/${filename}`, original: imageUrl };
  } catch (error) {
    console.error(`❌ Error procesando imagen ${imageUrl}:`, error);
    return { local: '/placeholder.svg', original: imageUrl };
  }
}

// Mejorar fetchEventosFromSupabase para usar los nombres de relación correctos y traer todos los campos relevantes
async function fetchEventosFromSupabase() {
  try {
    console.log('🔍 Obteniendo eventos de Supabase...');
    const { data: eventos, error } = await supabase
      .from('evento')
      .select(`
        *,
        estado_evento:fk_estado_evento(*),
        categoria_evento:evento_id_categoria_fkey(*),
        organizador:evento_id_organizador_fkey(*)
      `)
      .order('fecha_registro', { ascending: false });
    if (error) throw error;
    console.log(`✅ ${eventos.length} eventos obtenidos de Supabase`);
    return eventos;
  } catch (error) {
    console.error('❌ Error al obtener eventos:', error);
    return [];
  }
}

// Obtener organizadores de Supabase
async function fetchOrganizadoresFromSupabase() {
  try {
    console.log('🔍 Obteniendo organizadores de Supabase...');
    
    const { data: organizadores, error } = await supabase
      .from('organizador')
      .select('*')
      .order('nombre_organizacion');

    if (error) {
      throw error;
    }

    console.log(`✅ ${organizadores.length} organizadores obtenidos de Supabase`);
    return organizadores;
  } catch (error) {
    console.error('❌ Error al obtener organizadores:', error);
    return [];
  }
}

// Obtener categorías de Supabase
async function fetchCategoriasFromSupabase() {
  try {
    console.log('🔍 Obteniendo categorías de Supabase...');
    
    const { data: categorias, error } = await supabase
      .from('categoria_evento')
      .select('*')
      .order('nombre_categoria');

    if (error) {
      throw error;
    }

    console.log(`✅ ${categorias.length} categorías obtenidas de Supabase`);
    return categorias;
  } catch (error) {
    console.error('❌ Error al obtener categorías:', error);
    return [];
  }
}

// Refuerzo: guardar campo *_original en eventos y organizadores
async function processEventos(eventos) {
  const processedEventos = [];
  for (const evento of eventos) {
    // Imagen del evento
    let imagenLocal = evento.imagen;
    let imagenOriginal = '';
    if (evento.imagen) {
      const ext = path.extname(evento.imagen).split('?')[0] || '.jpg';
      const filename = `evento_${evento.id_evento}${ext}`;
      const imgRes = await downloadImage(evento.imagen, filename);
      imagenLocal = imgRes.local;
      imagenOriginal = imgRes.original;
    }
    // Logo del organizador
    let logoLocal = evento.organizador?.logo_organizacion;
    let logoOriginal = '';
    if (evento.organizador?.logo_organizacion) {
      const ext = path.extname(evento.organizador.logo_organizacion).split('?')[0] || '.jpg';
      const filename = `org_logo_${evento.organizador.id_organizador}${ext}`;
      const logoRes = await downloadImage(evento.organizador.logo_organizacion, filename);
      logoLocal = logoRes.local;
      logoOriginal = logoRes.original;
    }
    // Imagen portada del organizador
    let portadaLocal = evento.organizador?.imagen_portada;
    let portadaOriginal = '';
    if (evento.organizador?.imagen_portada) {
      const ext = path.extname(evento.organizador.imagen_portada).split('?')[0] || '.jpg';
      const filename = `org_portada_${evento.organizador.id_organizador}${ext}`;
      const portadaRes = await downloadImage(evento.organizador.imagen_portada, filename);
      portadaLocal = portadaRes.local;
      portadaOriginal = portadaRes.original;
    }
    processedEventos.push({
      ...evento,
      imagen: imagenLocal || '',
      imagen_original: imagenOriginal || '',
      organizador: {
        ...evento.organizador,
        logo_organizacion: logoLocal || '',
        logo_organizacion_original: logoOriginal || '',
        imagen_portada: portadaLocal || '',
        imagen_portada_original: portadaOriginal || ''
      }
    });
  }
  return processedEventos;
}

async function processOrganizadores(organizadores) {
  const processedOrganizadores = [];
  for (const organizador of organizadores) {
    // Logo
    let logoLocal = organizador.logo_organizacion;
    let logoOriginal = '';
    if (organizador.logo_organizacion) {
      const ext = path.extname(organizador.logo_organizacion).split('?')[0] || '.jpg';
      const filename = `org_logo_${organizador.id_organizador}${ext}`;
      const logoRes = await downloadImage(organizador.logo_organizacion, filename);
      logoLocal = logoRes.local;
      logoOriginal = logoRes.original;
    }
    // Imagen portada
    let portadaLocal = organizador.imagen_portada;
    let portadaOriginal = '';
    if (organizador.imagen_portada) {
      const ext = path.extname(organizador.imagen_portada).split('?')[0] || '.jpg';
      const filename = `org_portada_${organizador.id_organizador}${ext}`;
      const portadaRes = await downloadImage(organizador.imagen_portada, filename);
      portadaLocal = portadaRes.local;
      portadaOriginal = portadaRes.original;
    }
    processedOrganizadores.push({
      ...organizador,
      logo_organizacion: logoLocal || '',
      logo_organizacion_original: logoOriginal || '',
      imagen_portada: portadaLocal || '',
      imagen_portada_original: portadaOriginal || ''
    });
  }
  return processedOrganizadores;
}

// NUEVO: funciones para sincronizar entidades adicionales
async function fetchEstadosEvento() {
  const { data, error } = await supabase.from('estado_evento').select('*');
  if (error) { console.error('Error estados_evento:', error); return []; }
  return data;
}

async function fetchUsuarios() {
  const { data, error } = await supabase.from('usuario').select('*');
  if (error) { console.error('Error usuarios:', error); return []; }
  // Eliminar contraseñas y datos sensibles
  return data.map(u => { delete u.contrasena; return u; });
}

async function fetchRoles() {
  const { data, error } = await supabase.from('rol_usuario').select('*');
  if (error) { console.error('Error roles:', error); return []; }
  return data;
}

async function fetchNotificaciones() {
  const { data, error } = await supabase.from('notificacion').select('*');
  if (error) { console.error('Error notificaciones:', error); return []; }
  return data;
}

async function fetchHistorialAcreditacion() {
  const { data, error } = await supabase.from('historial_estado_acreditacion').select('*');
  if (error) { console.error('Error historial_acreditacion:', error); return []; }
  return data;
}

async function fetchHistorialEstadoNotificacion() {
  const { data, error } = await supabase.from('historial_estado_notificacion').select('*');
  if (error) { console.error('Error historial_estado_notificacion:', error); return []; }
  return data;
}

// Función principal
async function syncSupabaseToMocks() {
  try {
    console.log('🚀 Iniciando sincronización de Supabase a mocks locales...');
    
    // Probar conexión primero
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.error('❌ No se pudo conectar con Supabase. Verifica tu API key.');
      process.exit(1);
    }
    
    ensureDirectories();
    cleanImagesDir();

    // Obtener datos de Supabase
    const [eventos, organizadores, categorias, estadosEvento, usuarios, roles, notificaciones, historialAcreditacion, historialEstadoNotificacion] = await Promise.all([
      fetchEventosFromSupabase(),
      fetchOrganizadoresFromSupabase(),
      fetchCategoriasFromSupabase(),
      fetchEstadosEvento(),
      fetchUsuarios(),
      fetchRoles(),
      fetchNotificaciones(),
      fetchHistorialAcreditacion(),
      fetchHistorialEstadoNotificacion()
    ]);

    // Procesar eventos y descargar imágenes
    console.log('📸 Procesando eventos y descargando imágenes...');
    const processedEventos = await processEventos(eventos);

    // Procesar organizadores y descargar logos/portadas
    console.log('📸 Procesando organizadores y descargando logos/portadas...');
    const processedOrganizadores = await processOrganizadores(organizadores);

    // Guardar archivos JSON
    console.log('💾 Guardando archivos JSON...');
    
    fs.writeFileSync(EVENTOS_FILE, JSON.stringify(processedEventos, null, 2));
    console.log(`✅ Eventos guardados en: ${EVENTOS_FILE}`);

    fs.writeFileSync(ORGANIZADORES_FILE, JSON.stringify(processedOrganizadores, null, 2));
    console.log(`✅ Organizadores guardados en: ${ORGANIZADORES_FILE}`);

    fs.writeFileSync(CATEGORIAS_FILE, JSON.stringify(categorias, null, 2));
    console.log(`✅ Categorías guardadas en: ${CATEGORIAS_FILE}`);

    fs.writeFileSync(ESTADOS_EVENTO_FILE, JSON.stringify(estadosEvento, null, 2));
    console.log(`✅ Estados de evento guardados en: ${ESTADOS_EVENTO_FILE}`);

    fs.writeFileSync(USUARIOS_FILE, JSON.stringify(usuarios, null, 2));
    console.log(`✅ Usuarios guardados en: ${USUARIOS_FILE}`);

    fs.writeFileSync(ROLES_FILE, JSON.stringify(roles, null, 2));
    console.log(`✅ Roles guardados en: ${ROLES_FILE}`);

    fs.writeFileSync(NOTIFICACIONES_FILE, JSON.stringify(notificaciones, null, 2));
    console.log(`✅ Notificaciones guardadas en: ${NOTIFICACIONES_FILE}`);

    fs.writeFileSync(HISTORIAL_ACREDITACION_FILE, JSON.stringify(historialAcreditacion, null, 2));
    console.log(`✅ Historial de acreditación guardado en: ${HISTORIAL_ACREDITACION_FILE}`);

    fs.writeFileSync(HISTORIAL_ESTADO_NOTIFICACION_FILE, JSON.stringify(historialEstadoNotificacion, null, 2));
    console.log(`✅ Historial de estado de notificaciones guardado en: ${HISTORIAL_ESTADO_NOTIFICACION_FILE}`);

    console.log('🎉 Sincronización completada exitosamente!');
    console.log(`📊 Resumen:`);
    console.log(`   - ${processedEventos.length} eventos sincronizados`);
    console.log(`   - ${processedOrganizadores.length} organizadores sincronizados`);
    console.log(`   - ${categorias.length} categorías sincronizadas`);
    console.log(`   - ${estadosEvento.length} estados de evento sincronizados`);
    console.log(`   - ${usuarios.length} usuarios sincronizados`);
    console.log(`   - ${roles.length} roles sincronizados`);
    console.log(`   - ${notificaciones.length} notificaciones sincronizadas`);
    console.log(`   - ${historialAcreditacion.length} historial de acreditación sincronizados`);
    console.log(`   - ${historialEstadoNotificacion.length} historial de estado de notificaciones sincronizados`);
    console.log(`   - Imágenes guardadas en: ${IMAGES_DIR}`);

  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
    process.exit(1);
  }
}

// Helper para sincronización inversa (subir cambios locales al backend)
async function syncLocalChangesToServer() {
  console.log('🔄 Sincronizando cambios locales pendientes al servidor...');
  // Leer archivos de cambios pendientes (simulación: localStorage o archivos JSON como pending_users.json, pending_events.json, etc.)
  // Aquí solo estructura, la lógica real de subida debe usar la API REST del backend
  const pendingFiles = [
    { file: 'pending_users.json', table: 'usuario' },
    { file: 'pending_events.json', table: 'evento' },
    { file: 'pending_organizadores.json', table: 'organizador' },
    // Agrega más según tus entidades
  ];
  for (const { file, table } of pendingFiles) {
    const filePath = path.join(MOCKS_DIR, file);
    if (fs.existsSync(filePath)) {
      const items = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (Array.isArray(items) && items.length > 0) {
        console.log(`⏫ Subiendo ${items.length} cambios pendientes a la tabla ${table}...`);
        for (const item of items) {
          // Aquí deberías usar la API REST del backend para crear el registro
          // Ejemplo con Supabase:
          const { error } = await supabase.from(table).insert([item]);
          if (error) {
            console.error(`❌ Error al subir a ${table}:`, error);
          } else {
            console.log(`✅ Subido a ${table}:`, item.id || item.email || '[sin id]');
          }
        }
        // Limpiar el archivo de pendientes tras sincronizar
        fs.writeFileSync(filePath, '[]');
      }
    }
  }
  console.log('✅ Sincronización inversa completada.');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  syncSupabaseToMocks();
}

// Exportar la función para poder llamarla desde CLI o desde el frontend si se requiere
module.exports = { syncSupabaseToMocks, syncLocalChangesToServer }; 