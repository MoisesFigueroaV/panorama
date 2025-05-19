# Event Platform

Sistema de gestión y promoción de eventos con múltiples roles de usuario.

## Estructura del Proyecto

El proyecto está organizado en dos partes principales:

1. **Frontend** (`/front-end`):
   - Aplicación web con Next.js 15
   - Sistema de autenticación con NextAuth.js
   - UI moderna con Radix UI y Tailwind CSS
   - Panel de administración completo
   - Sistema de eventos y organizadores

2. **Backend** (`/back-end`):
   - API REST con Hono y Bun
   - Base de datos SupabaseBD(PostgresQL)
   - Servicios y lógica de negocio
   - Middleware y rutas organizadas

## Roles de Usuario

- **Visitante**: Puede ver eventos, organizadores y registrarse
- **Usuario**: Puede guardar eventos favoritos y gestionar su perfil
- **Organizador**: Puede crear y gestionar eventos
- **Administrador**: Tiene acceso completo al sistema

## Estructura de Ramas

1. **main**: Rama principal con los cambios principales
2. **production**: Rama de producción (antes de main)
3. **test**: Rama para pruebas
4. **Desarrolladores**:
   - `JavierVega`: Rama de desarrollo de Javier
   - `ZenonJara`: Rama de desarrollo de Zenón
   - `MoisesFigueroa`: Rama de desarrollo de Moisés

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/MoisesFigueroaDeveloper/panorama.git
cd panorama
```

2. Instalar dependencias del frontend:
```bash
cd front-end
pnpm install
```

3. Iniciar el servidor de desarrollo:
```bash
# Backend
cd back-end
bun run dev

# Frontend
cd front-end
pnpm dev
```

## Flujo de Trabajo

1. Los desarrolladores trabajan en sus ramas personales
2. Se realizan pruebas en la rama `test`
3. Los cambios aprobados se fusionan a `production`
4. Los cambios finales se fusionan a `main`

## Tecnologías

- Frontend: Next.js 15, TypeScript, Tailwind CSS, Radix UI
- Frontend: Next.js 15, TypeScript, Tailwind CSS, Radix UI
- Backend: Hono + Bun
- Base de datos: Supabase (PostgreSQL)
- Autenticación: JWT
- API: RESTful

## Contribuciones

1. Crear una rama desde la rama correspondiente
2. Implementar los cambios
3. Realizar pruebas en la rama `test`
4. Crear Pull Request a `production`
5. Aprobar y fusionar a `main`
