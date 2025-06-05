import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, PlusCircle, Users } from "lucide-react"
import Link from "next/link"
import { OrganizerChart } from "@/components/organizer/organizer-chart"

export default function OrganizerDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Organizador</h1>
          <p className="text-muted-foreground">
            Gestiona tus eventos y revisa las estadísticas de asistencia y ventas.
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
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">+2 desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asistentes totales</CardTitle>
            <Users className="h-4 w-4 text-highlight" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground">+10% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos creados</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+3 desde el mes pasado</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Asistencia a eventos</CardTitle>
            <CardDescription>Asistencia a tus eventos en los últimos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <OrganizerChart type="line" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Eventos por categoría</CardTitle>
            <CardDescription>Distribución de tus eventos por categoría</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <OrganizerChart type="bar" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
