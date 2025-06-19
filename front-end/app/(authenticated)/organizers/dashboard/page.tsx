"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, PlusCircle, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { OrganizerChart } from "@/components/organizer/organizer-chart"
import { useOrganizerStats } from "@/lib/hooks/useOrganizerStats"

export default function OrganizerDashboardPage() {
  const { stats, loading, error } = useOrganizerStats();

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard de Organizador</h1>
            <p className="text-muted-foreground">
              Gestiona tus eventos y revisa las estadísticas.
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard de Organizador</h1>
            <p className="text-muted-foreground">
              Gestiona tus eventos y revisa las estadísticas.
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-500">Error al cargar estadísticas: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Organizador</h1>
          <p className="text-muted-foreground">
            Gestiona tus eventos y revisa las estadísticas.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/organizers/dashboard/events">
            <Button variant="outline" className="w-full sm:w-auto gap-2">
              <Calendar className="h-4 w-4" />
              Ver mis eventos
            </Button>
          </Link>
          <Link href="/organizers/dashboard/events/create">
            <Button className="w-full sm:w-auto gap-2">
              <PlusCircle className="h-4 w-4" />
              Crear evento
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos activos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.eventosActivos || 0}</div>
            <p className="text-xs text-muted-foreground">Eventos publicados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.eventosPendientes || 0}</div>
            <p className="text-xs text-muted-foreground">En borrador</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de eventos</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.eventosTotales || 0}</div>
            <p className="text-xs text-muted-foreground">Todos tus eventos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Eventos por categoría</CardTitle>
            <CardDescription>Distribución de tus eventos por categoría</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <OrganizerChart type="bar" data={{ eventosPorCategoria: stats?.eventosPorCategoria }} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
