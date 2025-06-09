import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, PlusCircle, Settings, User, Users } from "lucide-react"
import Link from "next/link"
import { events } from "@/lib/data"
import { AdminEventCard } from "@/components/admin/admin-event-card"
import { AdminChart } from "@/components/admin/admin-chart"
import { AdminUserTable } from "@/components/admin/admin-user-table"

export default function AdminDashboardPage() {
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

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>

      <div className="grid gap-4 sm:gap-6">
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios recientes</CardTitle>
          <CardDescription>Lista de los últimos usuarios registrados en la plataforma</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <AdminUserTable />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Eventos destacados</CardTitle>
            <CardDescription>Eventos que requieren atención o aprobación</CardDescription>
          </div>
          <Link href="/admin/events" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">Ver todos</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="pending" className="flex-1 sm:flex-none">Pendientes</TabsTrigger>
              <TabsTrigger value="featured" className="flex-1 sm:flex-none">Destacados</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="space-y-4">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {events.slice(0, 3).map((event) => (
                  <AdminEventCard key={event.id} event={event} status="pending" />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="featured" className="space-y-4">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
