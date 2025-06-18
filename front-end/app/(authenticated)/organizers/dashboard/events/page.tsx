"use client"

import { useState, useEffect } from "react"
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
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import { getCategoriaNombre } from "@/lib/evento-constants"
import { toast } from "sonner"

interface Evento {
  id_evento: number
  titulo: string
  descripcion?: string
  fecha_inicio: string
  fecha_fin: string
  ubicacion?: string
  capacidad: number
  id_categoria: number
  id_estado_evento?: number
  fecha_registro?: string
  imagen?: string
  latitud?: number
  longitud?: number
}

export default function OrganizerEventsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedEvents, setSelectedEvents] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [eventos, setEventos] = useState<Evento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const eventsPerPage = 10
  const { accessToken } = useAuth()

  // Cargar eventos del organizador
  useEffect(() => {
    const loadEventos = async () => {
      if (!accessToken) return
      
      try {
        setIsLoading(true)
        const data = await api.eventos.getMisEventos(accessToken)
        setEventos(data)
      } catch (error: any) {
        console.error('Error al cargar eventos:', error)
        toast.error(error.message || "Error al cargar eventos")
      } finally {
        setIsLoading(false)
      }
    }

    loadEventos()
  }, [accessToken])

  // Filtramos los eventos según los criterios de búsqueda
  const filteredEvents = eventos.filter((evento) => {
    const matchesSearch =
      evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evento.descripcion && evento.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || evento.id_categoria.toString() === selectedCategory
    const matchesStatus = selectedStatus === "all" || evento.id_estado_evento?.toString() === selectedStatus

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
  const toggleEventSelection = (eventId: number) => {
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
      setSelectedEvents(currentEvents.map((evento) => evento.id_evento))
    }
  }

  // Función para eliminar los eventos seleccionados
  const deleteSelectedEvents = () => {
    // En una aplicación real, aquí enviaríamos una petición al servidor
    console.log("Eliminando eventos:", selectedEvents)
    toast.info("Funcionalidad de eliminación en desarrollo")
    setSelectedEvents([])
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando eventos...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Eventos</h1>
          <p className="text-muted-foreground">Gestiona todos tus eventos desde un solo lugar.</p>
        </div>
        <Link href="/organizers/dashboard/events/create">
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
                <SelectItem value="1">Música</SelectItem>
                <SelectItem value="2">Arte y Cultura</SelectItem>
                <SelectItem value="3">Gastronomía</SelectItem>
                <SelectItem value="4">Deportes</SelectItem>
                <SelectItem value="5">Tecnología</SelectItem>
                <SelectItem value="6">Educación</SelectItem>
                <SelectItem value="7">Negocios</SelectItem>
                <SelectItem value="8">Otro</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="1">Borrador</SelectItem>
                <SelectItem value="2">Publicado</SelectItem>
                <SelectItem value="3">Cancelado</SelectItem>
                <SelectItem value="4">Finalizado</SelectItem>
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
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedEvents.length === currentEvents.length && currentEvents.length > 0}
                    onCheckedChange={selectAllEvents}
                  />
                </TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Capacidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    {eventos.length === 0 ? (
                      <div className="space-y-2">
                        <p className="text-muted-foreground">No tienes eventos creados</p>
                        <Link href="/organizers/dashboard/events/create">
                          <Button size="sm">Crear tu primer evento</Button>
                        </Link>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No se encontraron eventos con los filtros aplicados</p>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                currentEvents.map((evento) => (
                  <TableRow key={evento.id_evento}>
                    <TableCell>
                      <Checkbox
                        checked={selectedEvents.includes(evento.id_evento)}
                        onCheckedChange={() => toggleEventSelection(evento.id_evento)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{evento.titulo}</p>
                        {evento.descripcion && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {evento.descripcion}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getCategoriaNombre(evento.id_categoria)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {formatDate(evento.fecha_inicio)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(evento.fecha_fin)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {evento.ubicacion ? (
                        <p className="text-sm">{evento.ubicacion}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">No especificada</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{evento.capacidad}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeClass(evento.id_estado_evento || 1)}>
                        {getStatusLabel(evento.id_estado_evento || 1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {indexOfFirstEvent + 1} a {Math.min(indexOfLastEvent, filteredEvents.length)} de{" "}
            {filteredEvents.length} eventos
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => paginate(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function getStatusLabel(estadoId: number) {
  const estados = {
    1: "Borrador",
    2: "Publicado",
    3: "Cancelado",
    4: "Finalizado"
  }
  return estados[estadoId as keyof typeof estados] || "Desconocido"
}

function getStatusBadgeClass(estadoId: number) {
  const clases = {
    1: "bg-gray-100 text-gray-800",
    2: "bg-green-100 text-green-800",
    3: "bg-red-100 text-red-800",
    4: "bg-blue-100 text-blue-800"
  }
  return clases[estadoId as keyof typeof clases] || "bg-gray-100 text-gray-800"
}
