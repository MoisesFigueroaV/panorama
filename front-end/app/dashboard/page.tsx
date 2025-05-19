import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Star, Ticket, Users } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { events } from "@/lib/data"
import { UserEventCard } from "@/components/dashboard/user-event-card"

export default function DashboardPage() {
  // Simulamos eventos guardados y tickets comprados
  const savedEvents = events.slice(0, 3)
  const upcomingEvents = events.slice(3, 5)

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido de vuelta. Aquí puedes ver tus eventos guardados y próximos.
          </p>
        </div>
        <Link href="/events">
          <Button>Explorar eventos</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos guardados</CardTitle>
            <Star className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{savedEvents.length}</div>
            <p className="text-xs text-muted-foreground">+2 desde la última semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets comprados</CardTitle>
            <Ticket className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+3 desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos asistidos</CardTitle>
            <Users className="h-4 w-4 text-highlight" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+4 desde el año pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo evento</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-md font-bold truncate">Festival de Jazz</div>
            <p className="text-xs text-muted-foreground">En 3 días</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Próximos eventos</TabsTrigger>
          <TabsTrigger value="saved">Eventos guardados</TabsTrigger>
          <TabsTrigger value="past">Eventos pasados</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <UserEventCard key={event.id} event={event} type="upcoming" />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="saved" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {savedEvents.map((event) => (
              <UserEventCard key={event.id} event={event} type="saved" />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="past" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.slice(5, 8).map((event) => (
              <UserEventCard key={event.id} event={event} type="past" />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Eventos recomendados para ti</CardTitle>
            <CardDescription>Basado en tus intereses y eventos pasados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {events.slice(0, 3).map((event) => (
              <div key={event.id} className="flex items-start space-x-4">
                <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                  <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium leading-none">{event.title}</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-3 w-3" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-3 w-3" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
            <CardDescription>Tus últimas interacciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Compraste 2 entradas para Festival de Jazz</p>
                  <p className="text-sm text-muted-foreground">Hace 2 días</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-accent"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Guardaste Exposición de Arte Contemporáneo</p>
                  <p className="text-sm text-muted-foreground">Hace 3 días</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-highlight"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Asististe a Maratón de Santiago 2025</p>
                  <p className="text-sm text-muted-foreground">Hace 1 semana</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
