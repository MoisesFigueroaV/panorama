import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, Filter, Plus, Search, SlidersHorizontal } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { events } from "@/lib/data"
import { AdminEventCard } from "@/components/admin/admin-event-card"

export default function EventsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
          <p className="text-muted-foreground">Gestiona los eventos de la plataforma</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Buscar eventos..." className="pl-8 w-full md:w-[250px] lg:w-[300px]" />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex gap-1">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Filtros</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem>Todos los eventos</DropdownMenuItem>
                <DropdownMenuItem>Eventos activos</DropdownMenuItem>
                <DropdownMenuItem>Eventos pendientes</DropdownMenuItem>
                <DropdownMenuItem>Eventos pasados</DropdownMenuItem>
                <DropdownMenuItem>Eventos reportados</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nuevo evento</span>
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div>
              <CardTitle>Lista de eventos</CardTitle>
              <CardDescription>Total: {events.length} eventos registrados</CardDescription>
            </div>
            <Button variant="outline" className="w-full sm:w-auto gap-1">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all" className="w-full">
            <div className="border-b px-4 md:px-6">
              <TabsList className="w-full justify-start -mb-px">
                <TabsTrigger
                  value="all"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#f47c6c]"
                >
                  Todos
                </TabsTrigger>
                <TabsTrigger
                  value="active"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#f47c6c]"
                >
                  Activos
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#f47c6c]"
                >
                  Pendientes
                </TabsTrigger>
                <TabsTrigger
                  value="past"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#f47c6c]"
                >
                  Pasados
                </TabsTrigger>
                <TabsTrigger
                  value="reported"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#f47c6c]"
                >
                  Reportados
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="m-0">
              <div className="grid gap-4 p-4 md:p-6 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <AdminEventCard
                    key={event.id}
                    event={event}
                    status={
                      event.id % 5 === 0
                        ? "reported"
                        : event.id % 3 === 0
                          ? "pending"
                          : event.id % 2 === 0
                            ? "past"
                            : "active"
                    }
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="active" className="m-0">
              <div className="grid gap-4 p-4 md:p-6 md:grid-cols-2 lg:grid-cols-3">
                {events
                  .filter((e) => e.id % 2 !== 0 && e.id % 3 !== 0)
                  .map((event) => (
                    <AdminEventCard key={event.id} event={event} status="active" />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="m-0">
              <div className="grid gap-4 p-4 md:p-6 md:grid-cols-2 lg:grid-cols-3">
                {events
                  .filter((e) => e.id % 3 === 0)
                  .map((event) => (
                    <AdminEventCard key={event.id} event={event} status="pending" />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="past" className="m-0">
              <div className="grid gap-4 p-4 md:p-6 md:grid-cols-2 lg:grid-cols-3">
                {events
                  .filter((e) => e.id % 2 === 0)
                  .map((event) => (
                    <AdminEventCard key={event.id} event={event} status="past" />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="reported" className="m-0">
              <div className="grid gap-4 p-4 md:p-6 md:grid-cols-2 lg:grid-cols-3">
                {events
                  .filter((e) => e.id % 5 === 0)
                  .map((event) => (
                    <AdminEventCard key={event.id} event={event} status="reported" />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
