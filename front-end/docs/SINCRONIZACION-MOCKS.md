# 🔄 Sincronización de Supabase a Mocks Locales

Este sistema permite sincronizar automáticamente los datos de Supabase (eventos, organizadores, categorías e imágenes) con archivos JSON locales para desarrollo offline.

## 🚀 Características

- ✅ **Sincronización automática** de eventos, organizadores y categorías
- ✅ **Descarga automática** de imágenes desde Supabase Storage
- ✅ **Modo híbrido** que permite alternar entre datos locales y remotos
- ✅ **Fallback automático** a datos locales si falla la conexión
- ✅ **Interfaz visual** para cambiar entre modos de datos

## 📋 Requisitos Previos

1. **Variables de entorno configuradas** en `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   ```

2. **Dependencias instaladas**:
   ```bash
   npm install @supabase/supabase-js
   ```

## 🔧 Uso

### 1. Sincronizar Datos

Para sincronizar todos los datos de Supabase a mocks locales:

```bash
cd front-end
npm run sync-mocks
```

Este comando:
- Descarga todos los eventos de Supabase
- Descarga todos los organizadores
- Descarga todas las categorías
- Descarga todas las imágenes y las guarda en `/public/images/`
- Actualiza las URLs en los mocks para que apunten a las imágenes locales
- Guarda todo en los archivos JSON correspondientes

### 2. Usar en el Código

#### Hook Básico
```tsx
import { useDataMode } from '@/lib/hooks/useLocalData';

function MyComponent() {
  const { isLocalMode, toggleMode } = useDataMode();
  
  return (
    <div>
      <p>Modo actual: {isLocalMode ? 'Local' : 'Supabase'}</p>
      <button onClick={toggleMode}>Cambiar modo</button>
    </div>
  );
}
```

#### Hook Específico para Eventos
```tsx
import { useEventosData } from '@/lib/hooks/useLocalData';

function EventosList() {
  const { data: eventos, loading, error } = useEventosData();
  
  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {eventos?.map(evento => (
        <div key={evento.id_evento}>{evento.titulo}</div>
      ))}
    </div>
  );
}
```

#### Componente de Control
```tsx
import { DataModeToggle } from '@/components/ui/data-mode-toggle';

function Header() {
  return (
    <header>
      <DataModeToggle />
    </header>
  );
}
```

### 3. Configuración Automática

Para que la aplicación use automáticamente datos locales cuando no hay conexión:

```env
# En .env.local
NEXT_PUBLIC_USE_LOCAL_DATA=true
```

## 📁 Estructura de Archivos

Después de la sincronización, tendrás:

```
front-end/
├── mocks/
│   ├── eventos.json          # Eventos sincronizados
│   ├── organizadores.json    # Organizadores sincronizados
│   └── categorias.json       # Categorías sincronizadas
├── public/
│   └── images/               # Imágenes descargadas
│       ├── evento_1_1234567890.jpg
│       ├── organizador_1_logo_1234567890.jpg
│       └── ...
└── scripts/
    └── sync-supabase-to-mocks.js  # Script de sincronización
```

## 🔄 Flujo de Datos

### Modo Local (Offline)
1. Los datos se cargan desde archivos JSON locales
2. Las imágenes se sirven desde `/public/images/`
3. No se requiere conexión a internet

### Modo Supabase (Online)
1. Los datos se cargan desde Supabase
2. Las imágenes se sirven desde Supabase Storage
3. Requiere conexión a internet

### Fallback Automático
Si estás en modo Supabase pero falla la conexión:
1. Automáticamente cambia a datos locales
2. Muestra una advertencia en consola
3. La aplicación sigue funcionando normalmente

## 🛠️ Personalización

### Agregar Nuevos Tipos de Datos

Para sincronizar nuevos tipos de datos, edita `sync-supabase-to-mocks.js`:

```javascript
// Agregar nueva función de fetch
async function fetchNuevosDatosFromSupabase() {
  const { data, error } = await supabase
    .from('nueva_tabla')
    .select('*');
  
  if (error) throw error;
  return data;
}

// Agregar procesamiento
async function processNuevosDatos(datos) {
  // Lógica de procesamiento
  return datosProcesados;
}

// Agregar a la función principal
const nuevosDatos = await fetchNuevosDatosFromSupabase();
const processedNuevosDatos = await processNuevosDatos(nuevosDatos);
fs.writeFileSync(NUEVOS_DATOS_FILE, JSON.stringify(processedNuevosDatos, null, 2));
```

### Modificar el Comportamiento de Imágenes

Para cambiar cómo se manejan las imágenes:

```javascript
// En downloadImage()
const localPath = path.join(IMAGES_DIR, filename);
// Cambiar la lógica de guardado aquí
```

## 🚨 Solución de Problemas

### Error: "Faltan las variables de entorno"
- Verifica que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén en tu `.env.local`

### Error: "No se pueden descargar imágenes"
- Verifica que el bucket `eventos-media` exista en Supabase
- Verifica que las políticas de acceso permitan lectura pública

### Los datos no se actualizan
- Ejecuta `npm run sync-mocks` para forzar una nueva sincronización
- Verifica que los archivos JSON se hayan actualizado

### Problemas de rendimiento
- Las imágenes grandes pueden tardar en descargarse
- Considera comprimir las imágenes antes de subirlas a Supabase

## 📝 Notas Importantes

1. **Las imágenes se guardan localmente** para evitar dependencias de red
2. **Los datos se sincronizan manualmente** - ejecuta el script cuando necesites actualizar
3. **El modo se guarda en localStorage** - persiste entre sesiones
4. **El fallback es automático** - no necesitas manejar errores de red manualmente

## 🔮 Próximas Mejoras

- [ ] Sincronización automática programada
- [ ] Compresión automática de imágenes
- [ ] Sincronización incremental (solo cambios)
- [ ] Interfaz web para gestionar sincronización
- [ ] Backup automático de mocks 