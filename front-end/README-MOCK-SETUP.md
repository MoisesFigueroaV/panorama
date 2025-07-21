# 🚀 Configuración del Entorno de Desarrollo con Mocks

Este documento te guía para configurar y usar el entorno de desarrollo con mocks para evitar errores 404 y problemas de autenticación.

## 📋 Prerrequisitos

1. **Node.js** instalado (versión 16 o superior)
2. **json-server** instalado globalmente:
   ```bash
   npm install -g json-server
   ```

## 🔧 Configuración Inicial

### 1. Sincronizar datos desde Supabase

Ejecuta el script para traer datos reales de Supabase y generar los mocks:

```bash
npm run sync-mocks
```

Este comando:
- ✅ Conecta con tu base de datos Supabase
- ✅ Descarga eventos, organizadores, categorías, usuarios, etc.
- ✅ Genera notificaciones por defecto para el usuario 63
- ✅ Descarga y procesa imágenes
- ✅ Crea archivos JSON en la carpeta `mocks/`

### 2. Iniciar el Mock Server

Tienes dos opciones:

**Opción A: Script personalizado (recomendado)**
```bash
npm run mock-server
```

**Opción B: Comando directo**
```bash
npm run mock
```

### 3. Configuración completa de una vez

Para hacer todo en un solo comando:
```bash
npm run setup-dev
```

## 🌐 Rutas Disponibles

El mock server responde en `http://localhost:3000` con las siguientes rutas:

### Notificaciones
- `GET /notificaciones/usuario/63` - Notificaciones del usuario 63
- `GET /notificaciones` - Todas las notificaciones

### Dashboard
- `GET /api/v1/eventos/dashboard-stats` - Estadísticas del dashboard
- `GET /admin/dashboard/kpis` - KPIs de administración

### Datos principales
- `GET /eventos` - Lista de eventos
- `GET /organizadores` - Lista de organizadores
- `GET /categorias` - Lista de categorías
- `GET /usuarios` - Lista de usuarios
- `GET /roles` - Lista de roles

## 🔍 Solución de Problemas

### Error 404 en notificaciones
Si ves errores 404 en `/notificaciones/usuario/63`:

1. Verifica que el archivo `mocks/notificaciones.json` existe
2. Asegúrate de que contiene notificaciones para el usuario 63
3. Ejecuta `npm run sync-mocks` para regenerar los datos

### Error 401 (Unauthorized)
Si ves errores 401:

1. El mock server no valida tokens, así que estos errores no deberían aparecer
2. Si persisten, verifica que el frontend esté apuntando a `http://localhost:3000`
3. Revisa la configuración en `lib/api/apiClient.ts`

### Error de parseo JSON
Si ves errores de "Unexpected token":

1. Los interceptores en `apiClient.ts` ahora manejan respuestas no-JSON
2. Verifica que el mock server esté corriendo en el puerto 3000
3. Asegúrate de que los archivos JSON en `mocks/` sean válidos

## 📁 Estructura de Archivos

```
front-end/
├── mocks/
│   ├── eventos.json
│   ├── organizadores.json
│   ├── categorias.json
│   ├── notificaciones.json
│   ├── usuarios.json
│   ├── roles.json
│   ├── dashboard-stats.json
│   └── dashboard-kpis.json
├── routes.json
├── start-mock-server.js
└── scripts/
    └── sync-supabase-to-mocks.js
```

## 🔄 Actualización de Datos

Para actualizar los mocks con datos frescos de Supabase:

```bash
npm run sync-mocks
```

Esto regenerará todos los archivos JSON con los datos más recientes.

## 🛑 Detener el Mock Server

Presiona `Ctrl+C` en la terminal donde está corriendo el mock server.

## 📝 Notas Importantes

- El mock server corre en el puerto **3000**
- El frontend Next.js corre en el puerto **3001**
- Los mocks incluyen notificaciones por defecto para el usuario 63
- Todas las respuestas de error ahora son JSON válido
- El manejo de errores en el frontend es más robusto

## 🆘 Soporte

Si encuentras problemas:

1. Verifica que json-server esté instalado globalmente
2. Asegúrate de que las variables de entorno de Supabase estén configuradas
3. Revisa los logs en la consola para identificar errores específicos
4. Ejecuta `npm run sync-mocks` para regenerar los datos si es necesario 