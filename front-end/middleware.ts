import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // NOTA: Protección de autenticación desactivada temporalmente para desarrollo
  // Restaurar antes de pasar a producción

  // Permitir acceso a todas las rutas sin autenticación para visualización durante desarrollo
  return NextResponse.next()

  /* CÓDIGO ORIGINAL - DESCOMENTAR ANTES DE PRODUCCIÓN
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    const isAuthenticated = !!token
    const isAdmin = token?.role === "admin"
    const isOrganizer = token?.role === "organizer" || isAdmin
    const path = request.nextUrl.pathname

    // Permitir acceso público a los perfiles de organizadores
    if (path.startsWith("/organizers/")) {
      return NextResponse.next()
    }

    // Redirigir a login si no está autenticado
    if (
      !isAuthenticated &&
      (path.startsWith("/dashboard") || path.startsWith("/organizer") || path.startsWith("/admin"))
    ) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Verificar permisos para área de organizador
    if (path === "/organizer" && !isOrganizer) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Verificar permisos para área de administrador
    if (path.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  } catch (error) {
    console.error("Middleware error:", error)
  }

  return NextResponse.next()
  */
}

export const config = {
  matcher: ["/dashboard/:path*", "/organizer/:path*", "/admin/:path*", "/organizers/:path*"],
}
