# 🗄️ Configuración de Supabase Storage

## 📋 Requisitos Previos

1. **Proyecto Supabase creado**
2. **Service Role Key** (no la anon key)
3. **Variables de entorno configuradas**

## 🔧 Configuración

### 1. Variables de Entorno

Agrega estas variables a tu archivo `.env` del backend:

```env
# Supabase Storage
SUPABASE_URL=https://[PROJECT_ID].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]
```

### 2. Obtener las Credenciales

1. Ve a tu proyecto Supabase
2. **Settings > API**
3. Copia:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Crear el Bucket

Ejecuta el script de configuración:

```bash
cd back-end
node scripts/setup-storage.js
```

O crea manualmente en Supabase Dashboard:

1. **Storage > New Bucket**
2. Nombre: `panorama-imagenes`
3. **Public bucket** ✅
4. **File size limit**: 5MB
5. **Allowed MIME types**: `image/jpeg, image/png, image/gif, image/webp`

### 4. Crear la Carpeta

1. Dentro del bucket `panorama-imagenes`, crea una carpeta llamada `Imagenes`
2. Las imágenes se guardarán en: `panorama-imagenes/Imagenes/`

### 5. Políticas de Acceso

En Supabase Dashboard > Storage > Policies:

```sql
-- Política para lectura pública
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'panorama-imagenes');

-- Política para subida autenticada
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'panorama-imagenes' 
  AND auth.role() = 'authenticated'
);
```

## ✅ Verificación

Una vez configurado:

1. Las imágenes se subirán a: `https://[PROJECT_ID].supabase.co/storage/v1/object/public/panorama-imagenes/Imagenes/`
2. URLs públicas automáticas
3. Sin necesidad de servidor local para archivos
4. Escalable y confiable

## 🚀 Ventajas

- ✅ **Sin almacenamiento local**
- ✅ **URLs públicas automáticas**
- ✅ **Escalable**
- ✅ **CDN incluido**
- ✅ **Backup automático** 