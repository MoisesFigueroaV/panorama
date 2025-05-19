# Event Platform

Plataforma de gestión y promoción de eventos con múltiples roles de usuario.

## Estructura del Proyecto

El proyecto sigue una arquitectura modular y escalable:

- `/app`: Rutas y páginas (Next.js App Router)
- `/components`: Componentes de UI reutilizables
  - `/admin`: Componentes específicos para administradores
  - `/dashboard`: Componentes del dashboard
  - `/organizer`: Componentes para organizadores
  - `/public`: Componentes para páginas públicas
  - `/ui`: Componentes UI básicos (botones, inputs, etc.)
- `/hooks`: Custom hooks
- `/services`: Servicios de API y lógica de datos
- `/store`: Estado global (Context, Redux, etc.)
- `/types`: Definiciones de TypeScript
- `/utils`: Funciones de utilidad pequeñas
- `/constants`: Valores constantes
- `/styles`: Estilos globales y variables

## Roles de Usuario

- **Visitante**: Puede ver eventos, organizadores y registrarse
- **Usuario**: Puede guardar eventos favoritos y gestionar su perfil
- **Organizador**: Puede crear y gestionar eventos
- **Administrador**: Gestión completa de la plataforma

## Tecnologías

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- NextAuth.js

## Desarrollo

\`\`\`bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start
\`\`\`

## Convenciones de Código

- Nombres de archivos en kebab-case
- Componentes en PascalCase
- Hooks prefijados con `use`
- Servicios sufijados con `-service`
- Tipos prefijados con mayúscula
