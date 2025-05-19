import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Flag, PlusCircle, Settings, User, Users } from "lucide-react"
import Link from "next/link"
import { events } from "@/lib/data"
import { AdminEventCard } from "@/components/admin/admin-event-card"
import { AdminChart } from "@/components/admin/admin-chart"
import { AdminUserTable } from "@/components/admin/admin-user-table"

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestiona usuarios, eventos y configuraciones de la plataforma.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/admin/settings">
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Configuración
            </Button>
          </Link>
          <Link href="/admin/events/create">
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Crear evento
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios totales</CardTitle>
            <User className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,845</div>
            <p className="text-xs text-muted-foreground">+180 desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos activos</CardTitle>
            <Calendar className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <p className="text-xs text-muted-foreground">+32 desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizadores</CardTitle>
            <Users className="h-4 w-4 text-highlight" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84</div>
            <p className="text-xs text-muted-foreground">+12 desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reportes pendientes</CardTitle>
            <Flag className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">-3 desde la semana pasada</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Crecimiento de usuarios</CardTitle>
            <CardDescription>Nuevos registros en los últimos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
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
            <div className="h-[300px]">
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
        <CardContent>
          <AdminUserTable />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Eventos destacados</CardTitle>
            <CardDescription>Eventos que requieren atención o aprobación</CardDescription>
          </div>
          <Link href="/admin/events">
            <Button variant="outline">Ver todos</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending">Pendientes</TabsTrigger>
              <TabsTrigger value="reported">Reportados</TabsTrigger>
              <TabsTrigger value="featured">Destacados</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {events.slice(0, 3).map((event) => (
                  <AdminEventCard key={event.id} event={event} status="pending" />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="reported" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {events.slice(3, 4).map((event) => (
                  <AdminEventCard key={event.id} event={event} status="reported" />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="featured" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {events.slice(4, 7).map((event) => (
                  <AdminEventCard key={event.id} event={event} status="featured" />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
