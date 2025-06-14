"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, PlusCircle, Settings, User, Users, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { AdminChart } from "@/components/admin/admin-chart"
import { AdminUserTable } from "@/components/admin/admin-user-table"
import { useAdminDashboard } from "@/lib/hooks/useAdminDashboard"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AdminDashboardPage() {
  const { kpis, users, organizers, isLoading, error } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertTitle>Error de Carga</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const pendingOrganizers = organizers.filter(
    org => org.estadoAcreditacionActual?.nombre_estado === 'Pendiente'
  );

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Panel de Administración</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Gestiona usuarios y eventos de la plataforma.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Link href="/admin/settings" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto gap-2">
              <Settings className="h-4 w-4" />
              Configuración
            </Button>
          </Link>
          <Link href="/admin/events/create" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto gap-2">
              <PlusCircle className="h-4 w-4" />
              Crear evento
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios totales</CardTitle>
            <User className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.totalUsuarios ?? 0}</div>
            <p className="text-xs text-muted-foreground">Usuarios registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizadores</CardTitle>
            <Users className="h-4 w-4 text-highlight" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.totalOrganizadores ?? 0}</div>
            <p className="text-xs text-muted-foreground">Organizadores registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes pendientes</CardTitle>
            <Calendar className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.solicitudesPendientes ?? 0}</div>
            <p className="text-xs text-muted-foreground">Por revisar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos activos</CardTitle>
            <Calendar className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.eventosActivos ?? 0}</div>
            <p className="text-xs text-muted-foreground">Eventos en curso</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Crecimiento de usuarios</CardTitle>
            <CardDescription>Nuevos registros en los últimos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px]">
              <AdminChart type="line" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Eventos por categoría</CardTitle>
            <CardDescription>Distribución de eventos por categoría</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px]">
              <AdminChart type="bar" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios recientes</CardTitle>
          <CardDescription>Lista de los últimos usuarios registrados en la plataforma</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <AdminUserTable users={users} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Organizadores pendientes</CardTitle>
            <CardDescription>Organizadores que requieren aprobación ({pendingOrganizers.length})</CardDescription>
          </div>
          <Link href="/admin/organizers" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">Ver todos</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {pendingOrganizers.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {pendingOrganizers.slice(0, 3).map((organizer) => (
                <Card key={organizer.id_organizador}>
                  <CardHeader>
                    <CardTitle className="text-base truncate">{organizer.nombre_organizacion}</CardTitle>
                    <CardDescription>{organizer.usuario.correo}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Contacto: {organizer.usuario.nombre_usuario}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center p-4">¡No hay solicitudes pendientes!</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}