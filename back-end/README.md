# Backend de Event Platform

API REST moderna y tipada construida con Elysia.js, Bun y Drizzle ORM.

## 🏗️ Arquitectura

```
back-end/app/
├── src/
│   ├── db/              # Configuración de base de datos y esquemas
│   │   ├── schema/      # Esquemas de Drizzle
│   │   └── drizzle.ts   # Configuración de Drizzle ORM
│   ├── modules/         # Módulos de la aplicación
│   │   ├── auth/        # Autenticación y autorización
│   │   ├── users/       # Gestión de usuarios
│   │   └── events/      # Gestión de eventos
│   ├── utils/           # Utilidades y helpers
│   │   ├── errors.ts    # Manejo de errores
│   │   └── validations.ts # Esquemas Zod
│   └── index.ts         # Punto de entrada
├── drizzle/            # Migraciones de base de datos
└── tests/             # Tests unitarios y de integración
```

## 🛠️ Stack Tecnológico

- **Framework**: Elysia.js
  - Framework web rápido y tipado
  - Soporte nativo para TypeScript
  - Middleware integrado
  - Validación de tipos en tiempo de compilación

- **Runtime**: Bun
  - Runtime JavaScript ultra rápido
  - Gestor de paquetes integrado
  - Soporte nativo para TypeScript
  - Hot reload en desarrollo

- **Base de Datos**: 
  - PostgreSQL (Supabase)
  - Drizzle ORM para consultas tipadas
  - Migraciones con Drizzle Kit
  - Pool de conexiones optimizado

- **Validación**: Zod
  - Validación de esquemas
  - Inferencia de tipos TypeScript
  - Mensajes de error personalizables

- **Documentación**: Swagger
  - UI interactiva en `/api-docs`
  - Documentación automática de endpoints
  - Pruebas de API integradas

## 🚀 Desarrollo

1. Instalar dependencias:
```bash
bun install
```

2. Configurar variables de entorno:
```env
PORT=3000
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST].supabase.co:5432/postgres
SUPABASE_SERVICE_ROLE_KEY=tu_key_servicio
FRONTEND_URL=http://localhost:3001
DB_LOGGER=true
```

3. Iniciar servidor de desarrollo:
```bash
bun run dev
```

4. Ejecutar migraciones:
```bash
bunx drizzle-kit push:pg
```

## 📚 Documentación API

La documentación completa de la API está disponible en:
```
http://localhost:3000/api-docs
```

## 🔒 Seguridad

- CORS configurado para el frontend
- Validación de datos con Zod
- Autenticación JWT
- Manejo seguro de errores
- Variables de entorno protegidas

## 🧪 Testing

```bash
# Ejecutar tests
bun test

# Ejecutar tests con coverage
bun test --coverage
```

## 📦 Scripts Disponibles

- `bun run dev`: Inicia el servidor en modo desarrollo
- `bun run build`: Compila el proyecto
- `bun run start`: Inicia el servidor en producción
- `bunx drizzle-kit push:pg`: Ejecuta migraciones
- `bunx drizzle-kit generate`: Genera nuevas migraciones

## 🤝 Contribución

1. Seguir las convenciones de código
2. Documentar nuevos endpoints
3. Incluir tests para nuevas funcionalidades
4. Actualizar la documentación Swagger
5. Verificar tipos TypeScript