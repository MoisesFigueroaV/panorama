# Event Platform - Guía Técnica Detallada

Bienvenido a la documentación técnica integral de Event Platform, un sistema de gestión y promoción de eventos. Este documento cubre la arquitectura general, el stack tecnológico, y crucialmente, cómo el frontend Next.js interactúa con la API del backend Elysia.

## 🏗️ Arquitectura General del Proyecto

El proyecto está dividido en dos componentes principales que se comunican a través de una API RESTful:

1. **Frontend (`/front-end`):**
   * Construido con **Next.js 14+ (App Router)** para una experiencia de usuario moderna y renderizado híbrido.
   * Escrito en **TypeScript** para un desarrollo robusto y tipado.
   * Interfaz de usuario desarrollada con **Tailwind CSS** y componentes de **shadcn/ui** (que utiliza Radix UI internamente).
   * Gestión de formularios con **React Hook Form** y validación usando **Zod**.
   * (Opcional) Gestión de estado global con **React Context, Zustand, o Redux**.
   * (Opcional) Autenticación del lado del cliente gestionada a través de llamadas a la API y almacenamiento de tokens.

2. **Backend (`/back-end/app/`):**
   * Desarrollado con **Elysia.js**, un framework web rápido y tipado para Bun.
   * Utiliza **Bun** como runtime de JavaScript y gestor de paquetes.
   * Interactúa con la base de datos usando **Drizzle ORM** para consultas type-safe a PostgreSQL.
   * Valida los datos de entrada con **Zod** (a través de los schemas `t` de Elysia).
   * Documenta su API automáticamente usando **Swagger UI** y **Scalar UI**.
   * Configuración de **CORS** para permitir peticiones desde el frontend.
   * Manejo de errores centralizado y middleware para autenticación (JWT).

3. **Base de Datos:**
   * **PostgreSQL** alojada en **Supabase**.
   * Las migraciones de schema de base de datos se gestionan con **Drizzle Kit**.

---

## 🚀 Guía de Inicio Rápido

### Prerrequisitos

* Node.js (para pnpm y herramientas del ecosistema frontend)
* pnpm (para el frontend)
* Bun (para el backend)
* Git

### Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/MoisesFigueroaDeveloper/panorama.git
   cd panorama
   ```

2. **Configurar Variables de Entorno:**
   Crea los archivos `.env` necesarios y configúralos según las plantillas o instrucciones.

   * **Backend (`/back-end/app/.env`):**
     ```env
     # Cadena de conexión URI de tu base de datos PostgreSQL en Supabase
     DATABASE_URL="postgresql://postgres:[TU_CONTRASEÑA]@[TU_HOST_SUPABASE].supabase.co:5432/postgres"
     # O si usas el Connection Pooler (recomendado para prod, puerto 6543):
     # DATABASE_URL="postgresql://postgres.[TU_ID_PROYECTO]:[TU_CONTRASEÑA_POOLER]@[TU_HOST_SUPABASE_POOLER].supabase.co:6543/postgres?pgbouncer=true"

     PORT=3000 # Puerto para el backend Elysia
     FRONTEND_URL="http://localhost:3001" # URL de tu frontend Next.js para CORS
     NODE_ENV=development # development, production, test

     # Secretos para JWT (¡USA VALORES FUERTES Y ÚNICOS EN PRODUCCIÓN!)
     JWT_ACCESS_SECRET="tu-secreto-fuerte-para-tokens-de-acceso-cambiame"
     JWT_REFRESH_SECRET="tu-otro-secreto-fuerte-para-tokens-de-refresco-cambiame"

     # Opcional: Para activar/desactivar el logger de Drizzle SQL
     # DB_LOGGER=true
     ```

   * **Frontend (`/front-end/.env.local`):**
     ```env
     NEXT_PUBLIC_API_URL="http://localhost:3000/api/v1" # URL base de tu API backend Elysia
     # ...otras variables públicas de Next.js que puedas necesitar...
     ```

3. **Instalar Dependencias:**

   * **Backend:**
     ```bash
     cd back-end/app
     bun install
     ```

   * **Frontend:**
     ```bash
     cd ../../front-end # Vuelve a la raíz y luego a front-end
     pnpm install
     ```

4. **Preparar Base de Datos (Backend):**
   Asegúrate de estar en la carpeta `/back-end/app/`.
   * Si es la primera vez o hay cambios en los schemas de Drizzle:
     ```bash
     bun run db:generate  # Genera archivos de migración SQL
     bun run db:migrate   # Aplica las migraciones a tu base de datos Supabase
     ```

5. **Iniciar Servidores de Desarrollo:**

   * **Backend (en una terminal, desde `/back-end/app/`):**
     ```bash
     bun run dev
     ```
     Deberías ver logs indicando que el servidor Elysia está corriendo (ej. en `http://localhost:3000`).

   * **Frontend (en otra terminal, desde `/front-end/`):**
     ```bash
     pnpm dev
     ```
     Deberías poder acceder a tu aplicación Next.js (ej. en `http://localhost:3001`).

---

## 📖 Documentación de la API del Backend (Elysia)

La API del backend es autodescriptiva y se puede explorar interactivamente a través de:

* **Swagger UI:** `http://localhost:3000/api-docs`
* **Scalar UI:** `http://localhost:3000/scalar-docs` (si el paquete `@elysiajs/scalar` está instalado y configurado)

Estas interfaces te mostrarán:
* Todos los endpoints disponibles.
* Los métodos HTTP (GET, POST, PUT, DELETE) para cada endpoint.
* Parámetros de ruta y query.
* Schemas para los cuerpos de solicitud (payloads).
* Schemas para las posibles respuestas y sus códigos de estado.
* Información sobre autenticación (si un endpoint la requiere).
* La posibilidad de "Probar" los endpoints directamente.

**URL Base de la API (en desarrollo):** `http://localhost:3000/api/v1`

---

## 🔄 Interacción Frontend (Next.js) ↔️ Backend (Elysia)

El frontend consume la API expuesta por el backend para todas las operaciones de datos y lógica de negocio.

### Principios de Comunicación

* **Protocolo:** HTTP(S).
* **Formato de Datos:** JSON para cuerpos de solicitud y respuesta.
* **API como Contrato:** El frontend se basa en la especificación OpenAPI (visible en Swagger/Scalar) para saber cómo interactuar con el backend.

### Variables de Entorno Clave en el Frontend

En `/front-end/.env.local`:
```env
NEXT_PUBLIC_API_URL="http://localhost:3000/api/v1"
```

### Ejemplos de Consumo de API desde Next.js

#### 1. Obtener Datos (Ej: Lista de Roles - GET /api/v1/roles-usuario)

**Desde un Componente de Servidor de Next.js (App Router):**
```typescript
// Ejemplo: /front-end/app/admin/roles/page.tsx
type RolUsuario = {
  id_rol: number;
  nombre_rol: string;
};

async function fetchRolesDesdeBackend(): Promise<RolUsuario[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.error("Error: NEXT_PUBLIC_API_URL no está definido.");
    return [];
  }

  try {
    const response = await fetch(`${apiUrl}/roles-usuario`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 3600 }, // Opcional: revalidar cada hora
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status} al obtener roles`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en fetchRolesDesdeBackend:", error);
    return [];
  }
}

export default async function AdminRolesPage() {
  const roles = await fetchRolesDesdeBackend();

  return (
    <div>
      <h1>Gestión de Roles</h1>
      {roles.length > 0 ? (
        <ul>
          {roles.map(rol => <li key={rol.id_rol}>{rol.nombre_rol}</li>)}
        </ul>
      ) : (
        <p>No se encontraron roles.</p>
      )}
    </div>
  );
}
```

**Desde un Componente de Cliente de Next.js:**
```typescript
// Ejemplo: /front-end/components/RolesDropdown.tsx
'use client';
import { useState, useEffect } from 'react';

type RolUsuario = { id_rol: number; nombre_rol: string; };

export function RolesDropdown({ onChange }: { onChange: (rolId: string) => void }) {
  const [roles, setRoles] = useState<RolUsuario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${apiUrl}/roles-usuario`)
      .then(res => res.json())
      .then((data: RolUsuario[]) => {
        setRoles(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando roles dropdown:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Cargando roles...</p>;

  return (
    <select onChange={(e) => onChange(e.target.value)}>
      <option value="">Selecciona un rol</option>
      {roles.map(rol => (
        <option key={rol.id_rol} value={String(rol.id_rol)}>{rol.nombre_rol}</option>
      ))}
    </select>
  );
}
```

#### 2. Enviar Datos (Ej: Registrar Usuario - POST /api/v1/auth/registro)

```typescript
// Ejemplo: /front-end/services/auth.service.ts

// Tipo para el payload que espera el backend
interface RegistroPayload {
  nombre_usuario: string;
  correo: string;
  contrasena: string;
  sexo?: 'M' | 'F' | 'O' | null;
  fecha_nacimiento?: string | null; // YYYY-MM-DD
}

// Tipo para la respuesta del backend
interface UsuarioRegistrado {
  id_usuario: number;
  nombre_usuario: string;
  correo: string;
  fecha_registro: string;
  sexo: string | null;
  fecha_nacimiento: string | null;
  id_rol: number | null;
}

export async function registrarNuevoUsuario(data: RegistroPayload): Promise<UsuarioRegistrado> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetch(`${apiUrl}/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData.error || responseData.message || `Error ${response.status} al registrar`);
  }
  return responseData;
}
```

### Uso en un formulario React Hook Form:

```typescript
// Ejemplo en un componente de formulario de registro
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schema Zod para el formulario frontend
const formSchema = z.object({
  nombre_usuario: z.string().min(3, "Nombre muy corto"),
  correo: z.string().email("Correo inválido"),
  contrasena: z.string().min(8, "Contraseña debe tener al menos 8 caracteres"),
});

type FormValues = z.infer<typeof formSchema>;

export function RegistroForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const usuarioCreado = await registrarNuevoUsuario(data);
      console.log('Usuario registrado:', usuarioCreado);
      // Redirigir a login o dashboard
    } catch (error) {
      console.error('Error de registro:', error);
      // Mostrar error al usuario
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="nombre_usuario">Nombre:</label>
        <input id="nombre_usuario" {...register("nombre_usuario")} />
        {errors.nombre_usuario && <p style={{color: 'red'}}>{errors.nombre_usuario.message}</p>}
      </div>
      <div>
        <label htmlFor="correo">Correo:</label>
        <input id="correo" type="email" {...register("correo")} />
        {errors.correo && <p style={{color: 'red'}}>{errors.correo.message}</p>}
      </div>
      <div>
        <label htmlFor="contrasena">Contraseña:</label>
        <input id="contrasena" type="password" {...register("contrasena")} />
        {errors.contrasena && <p style={{color: 'red'}}>{errors.contrasena.message}</p>}
      </div>
      <button type="submit">Registrarse</button>
    </form>
  );
}
```

## 🔐 Autenticación con JWT

### 1. Login
El frontend envía correo y contrasena a POST /api/v1/auth/login.
El backend Elysia valida las credenciales y devuelve accessToken y refreshToken.

### 2. Almacenamiento de Tokens (Frontend)
* **accessToken**: Se guarda en memoria (estado de React Context, Zustand, Redux).
* **refreshToken**: Se puede guardar en:
  * Cookie HttpOnly, Secure, SameSite=Strict (más seguro)
  * localStorage (menos seguro pero más simple)

### 3. Envío de accessToken en Peticiones Protegidas
```typescript
// services/apiClient.ts
function obtenerAccessToken(): string | null {
  return localStorage.getItem('accessToken_demo'); // Ejemplo simple
}

async function fetchProtegido(endpoint: string, options: RequestInit = {}) {
  const token = obtenerAccessToken();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!token) {
    throw new Error("No autenticado");
  }

  const response = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    // Lógica para refrescar token
    console.error("Token expirado o inválido");
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${response.status}`);
  }
  return response.json();
}
```

### 4. Refrescar accessToken
1. Si una llamada devuelve 401, el frontend llama a POST /api/v1/auth/token/refresh
2. El backend devuelve un nuevo accessToken
3. El frontend actualiza su token en memoria
4. Se reintenta la petición original

### 5. Logout
* Eliminar tokens del almacenamiento
* Redirigir a login
* Opcional: Llamar a endpoint de logout en backend

## 🛠️ Estructura de Código

### Backend (`/back-end/app/src/`):
```
- db/: Configuración de Drizzle y schemas
- modules/: Lógica por entidad
  * .types.ts: Schemas Zod/Elysia
  * .service.ts: Lógica de negocio
  * .routes.ts: Endpoints HTTP
- middleware/: Middlewares (auth, etc.)
- utils/: Utilidades
- index.ts: Punto de entrada
```

### Frontend (`/front-end/`):
```
- app/: Rutas y páginas (App Router)
- components/: Componentes UI
- services/: Funciones para API
- hooks/: Hooks personalizados
- contexts/: Gestión de estado
- types/: Tipos TypeScript
``` 