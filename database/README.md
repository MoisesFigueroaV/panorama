
# 🎟️ Event Platform

Plataforma de gestión, publicación y seguimiento de eventos culturales y sociales, construida con Supabase, Next.js, Hono y Bun.

---

## 📁 Estructura General del Proyecto

```
panorama/
├── front-end/     # Aplicación web (Next.js 15 + Tailwind CSS)
├── back-end/      # API backend (Hono + Bun)
└── database/      # Scripts de base de datos y configuración
```

---

## 🔐 Conexión a la Base de Datos Supabase

El sistema utiliza una base de datos PostgreSQL alojada en Supabase. Para conectarte correctamente, necesitas definir las siguientes variables de entorno.

### 🔑 Variables necesarias

| Variable                         | Descripción                                | Uso                  |
|----------------------------------|--------------------------------------------|----------------------|
| `NEXT_PUBLIC_SUPABASE_URL`       | URL del proyecto Supabase                  | Frontend y backend   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | API Key pública (lectura)                  | Solo frontend        |
| `SUPABASE_SERVICE_ROLE_KEY`      | API Key con privilegios elevados           | Solo backend         |

Obtenlas en: **Supabase → Project Settings → API**

---

## ⚙️ Configuración del Entorno

### 🖥️ Frontend (`front-end/`)

#### 1. Crear archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<tu-url>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### ⚙️ Backend (`back-end/`)

#### 1. Crear archivo `.env`:

```env
PORT=3000
SUPABASE_URL=https://<tu-url>.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... # No debe ir en frontend
```

## 🧱 Base de Datos Supabase

### 📦 Archivos

- `database/init.sql`: estructura de la base de datos (tablas, claves, constraints)
- `database/data_prueba_completo_panorama.sql`: datos de prueba realistas
- `database/README.md`: instrucciones técnicas y operativas