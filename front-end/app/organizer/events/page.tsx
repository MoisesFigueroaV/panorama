"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { events } from "@/lib/data"

export default function OrganizerEventsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const eventsPerPage = 10

  // Simulamos eventos creados por el organizador
  const organizerEvents = events.map((event) => ({
    ...event,
    status: getRandomStatus(),
    sales: Math.floor(Math.random() * 500),
    revenue: Math.floor(Math.random() * 10000),
  }))

  // Filtramos los eventos según los criterios de búsqueda
  const filteredEvents = organizerEvents.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || event.status === selectedStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Calculamos el total de páginas
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage)

  // Obtenemos los eventos para la página actual
  const indexOfLastEvent = currentPage * eventsPerPage
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent)

  // Función para cambiar de página
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // Función para ir a la página anterior
  const goToPreviousPage = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))
  }

  // Función para ir a la página siguiente
  const goToNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))
  }

  // Función para manejar la selección de eventos
  const toggleEventSelection = (eventId: string) => {
    if (selectedEvents.includes(eventId)) {
      setSelectedEvents(selectedEvents.filter((id) => id !== eventId))
    } else {
      setSelectedEvents([...selectedEvents, eventId])
    }
  }

  // Función para seleccionar todos los eventos de la página actual
  const selectAllEvents = () => {
    if (selectedEvents.length === currentEvents.length) {
      setSelectedEvents([])
    } else {
      setSelectedEvents(currentEvents.map((event) => event.id))
    }
  }

  // Función para eliminar los eventos seleccionados
  const deleteSelectedEvents = () => {
    // En una aplicación real, aquí enviaríamos una petición al servidor
    console.log("Eliminando eventos:", selectedEvents)
    setSelectedEvents([])
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Eventos</h1>
          <p className="text-muted-foreground">Gestiona todos tus eventos desde un solo lugar.</p>
        </div>
        <Link href="/organizer/events/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Crear evento
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar eventos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="music">Música</SelectItem>
                <SelectItem value="sports">Deportes</SelectItem>
                <SelectItem value="arts">Arte y cultura</SelectItem>
                <SelectItem value="food">Gastronomía</SelectItem>
                <SelectItem value="technology">Tecnología</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="past">Pasado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-start">
          {selectedEvents.length > 0 && (
            <Button variant="destructive" size="sm" className="gap-1" onClick={deleteSelectedEvents}>
              <Trash2 className="h-4 w-4" />
              Eliminar ({selectedEvents.length})
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-4 w-4" />
                Exportar
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Exportar a Excel</DropdownMenuItem>
              <DropdownMenuItem>Exportar a CSV</DropdownMenuItem>
              <DropdownMenuItem>Exportar a PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedEvents.length === currentEvents.length && currentEvents.length > 0}
                    onCheckedChange={selectAllEvents}
                  />
                </TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ventas</TableHead>
                <TableHead>Ingresos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentEvents.length > 0 ? (
                currentEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedEvents.includes(event.id)}
                        onCheckedChange={() => toggleEventSelection(event.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground">{event.location}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getCategoryLabel(event.category)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeClass(event.status)}>{getStatusLabel(event.status)}</Badge>
                    </TableCell>
                    <TableCell>{event.sales} tickets</TableCell>
                    <TableCell>${event.revenue.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/events/${event.id}`}>Ver evento</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/organizer/events/${event.id}/edit`}>Editar</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">
                    No se encontraron eventos con los filtros seleccionados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Paginador */}
      {filteredEvents.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {indexOfFirstEvent + 1}-{Math.min(indexOfLastEvent, filteredEvents.length)} de{" "}
            {filteredEvents.length} eventos
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={goToPreviousPage} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <Button
                  key={number}
                  variant={currentPage === number ? "default" : "outline"}
                  size="icon"
                  className="w-8 h-8"
                  onClick={() => paginate(number)}
                >
                  {number}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={goToNextPage} disabled={currentPage === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Función para obtener un estado aleatorio
function getRandomStatus() {
  const statuses = ["active", "draft", "past", "cancelled"]
  return statuses[Math.floor(Math.random() * statuses.length)]
}

// Función para formatear la fecha
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

// Función para obtener la etiqueta de la categoría
function getCategoryLabel(category: string) {
  const categories: Record<string, string> = {
    music: "Música",
    sports: "Deportes",
    arts: "Arte y cultura",
    food: "Gastronomía",
    technology: "Tecnología",
  }
  return categories[category] || category
}

// Función para obtener la etiqueta del estado
function getStatusLabel(status: string) {
  const statuses: Record<string, string> = {
    active: "Activo",
    draft: "Borrador",
    past: "Pasado",
    cancelled: "Cancelado",
  }
  return statuses[status] || status
}

// Función para obtener la clase del badge según el estado
function getStatusBadgeClass(status: string) {
  const classes: Record<string, string> = {
    active: "bg-green-100 text-green-800 hover:bg-green-100",
    draft: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    past: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    cancelled: "bg-red-100 text-red-800 hover:bg-red-100",
  }
  return classes[status] || ""
}
