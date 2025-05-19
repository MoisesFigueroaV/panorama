# Event Platform - Backend

Este es el backend de la plataforma de eventos, desarrollado usando Hono con Bun como runtime.

## Instalación

1. Asegúrate de tener Bun instalado:
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. Instala las dependencias:
   ```bash
   bun install
   ```

## Estructura del Proyecto

```
back-end/
├── src/
│   ├── routes/     # Rutas de la aplicación
│   └── utils/      # Utilidades y helpers
└── config/         # Configuración del proyecto
```

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Desarrollo

Para iniciar el servidor en modo desarrollo:
```bash
bun run dev
```

## Producción

Para iniciar el servidor en producción:
```bash
bun run start
```

## Tecnologías Utilizadas

- Hono (Framework)
- Bun (Runtime)
- Supabase (Base de datos PostgreSQL)
- dotenv (Variables de entorno)
