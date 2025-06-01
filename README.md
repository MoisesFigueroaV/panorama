# Event Platform

Sistema de gestión y promoción de eventos con múltiples roles de usuario, construido con tecnologías modernas y escalables.

## 🏗️ Arquitectura del Proyecto

El proyecto está organizado en dos partes principales:

1. **Frontend** (`/front-end`):
   - Next.js 15 con App Router
   - TypeScript para tipo seguro
   - UI moderna con Radix UI y Tailwind CSS
   - Autenticación con NextAuth.js
   - Estado global con React Context
   - Validación de formularios con Zod
   - Componentes UI con shadcn/ui

2. **Backend** (`/back-end`):
   - Elysia.js (Framework web rápido y tipado)
   - Bun como runtime y gestor de paquetes
   - Drizzle ORM para PostgreSQL
   - Validación de datos con Zod
   - Documentación API con Swagger
   - CORS configurado para seguridad
   - Middleware para manejo de errores

3. **Base de Datos**:
   - PostgreSQL en Supabase
   - Migraciones con Drizzle Kit
   - Pool de conexiones optimizado
   - Esquemas tipados con TypeScript

## 👥 Roles de Usuario

- **Visitante**: Puede ver eventos, organizadores y registrarse
- **Usuario**: Puede guardar eventos favoritos y gestionar su perfil
- **Organizador**: Puede crear y gestionar eventos
- **Administrador**: Tiene acceso completo al sistema

## 🌿 Estructura de Ramas

1. **main**: Rama principal con los cambios principales
2. **production**: Rama de producción (antes de main)
3. **test**: Rama para pruebas
4. **Desarrolladores**:
   - `JavierVega`: Rama de desarrollo de Javier
   - `ZenonJara`: Rama de desarrollo de Zenón
   - `MoisesFigueroa`: Rama de desarrollo de Moisés

## 🚀 Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/MoisesFigueroaDeveloper/panorama.git
cd panorama
```

2. Instalar dependencias:
```bash
# Frontend
cd front-end
pnpm install

# Backend
cd ../back-end/app
bun install
```

3. Configurar variables de entorno:
```bash
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key_anonima
NEXT_PUBLIC_API_URL=http://localhost:3000

# Backend (.env)
PORT=3000
DATABASE_URL=tu_url_postgres
SUPABASE_SERVICE_ROLE_KEY=tu_key_servicio
FRONTEND_URL=http://localhost:3001
```

4. Iniciar servidores de desarrollo:
```bash
# Backend
cd back-end/app
bun run dev

# Frontend
cd front-end
pnpm dev
```

## 🔄 Flujo de Trabajo

1. Los desarrolladores trabajan en sus ramas personales
2. Se realizan pruebas en la rama `test`
3. Los cambios aprobados se fusionan a `production`
4. Los cambios finales se fusionan a `main`

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 15
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **UI**: Radix UI + shadcn/ui
- **Formularios**: React Hook Form + Zod
- **Estado**: React Context
- **Autenticación**: NextAuth.js
- **Base de Datos**: Supabase (Cliente)

### Backend
- **Framework**: Elysia.js
- **Runtime**: Bun
- **ORM**: Drizzle
- **Validación**: Zod
- **Documentación**: Swagger
- **Base de Datos**: PostgreSQL (Supabase)
- **Autenticación**: JWT

## 📚 Documentación

- API: `http://localhost:3000/api-docs` (Swagger UI)
- Base de Datos: Ver `/database/README.md`
- Frontend: Ver `/front-end/README.md`
- Backend: Ver `/back-end/app/README.md`

## 🤝 Contribuciones

1. Crear una rama desde la rama correspondiente
2. Implementar los cambios
3. Realizar pruebas en la rama `test`
4. Crear Pull Request a `production`
5. Aprobar y fusionar a `main`
