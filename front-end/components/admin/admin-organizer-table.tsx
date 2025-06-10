"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, UserCheck, UserX, Search, Calendar, MapPin } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

// Datos de ejemplo
const mockOrganizers = [
  {
    id: "1",
    name: "Producciones Urbanas",
    email: "contacto@produccionesurbanas.com",
    status: "active" as const,
    eventsCount: 12,
    rating: 4.8,
    location: "Santiago, Chile",
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    name: "Galería Central",
    email: "info@galeriacentral.com",
    status: "active" as const,
    eventsCount: 8,
    rating: 4.5,
    location: "Valparaíso, Chile",
    createdAt: "2024-02-01"
  },
  {
    id: "3",
    name: "Deportes Unidos",
    email: "eventos@deportesunidos.com",
    status: "suspended" as const,
    eventsCount: 15,
    rating: 4.2,
    location: "Concepción, Chile",
    createdAt: "2024-01-20"
  },
  {
    id: "4",
    name: "TechHub",
    email: "info@techhub.com",
    status: "pending" as const,
    eventsCount: 6,
    rating: 4.0,
    location: "Antofagasta, Chile",
    createdAt: "2024-02-15"
  },
  {
    id: "5",
    name: "Sabores del Mundo",
    email: "contacto@saboresdelmundo.com",
    status: "active" as const,
    eventsCount: 9,
    rating: 4.7,
    location: "La Serena, Chile",
    createdAt: "2024-01-10"
  }
]

interface Organizer {
  id: string
  name: string
  email: string
  status: "active" | "suspended" | "pending"
  eventsCount: number
  rating: number
  location: string
  createdAt: string
}

export function AdminOrganizerTable() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filtrar organizadores
  const filteredOrganizers = mockOrganizers.filter(organizer => {
    const matchesSearch = searchTerm === "" || 
      organizer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      organizer.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || organizer.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Paginación
  const totalPages = Math.ceil(filteredOrganizers.length / itemsPerPage)
  const paginatedOrganizers = filteredOrganizers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const updateOrganizerStatus = (organizerId: string, newStatus: "active" | "suspended") => {
    toast({
      title: "Estado actualizado",
      description: `Organizador ${newStatus === 'active' ? 'activado' : 'suspendido'} correctamente`
    })
  }

  return (
    <div className="space-y-4">
      {/* Filtros y búsqueda */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar organizadores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="suspended">Suspendidos</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Organizador</TableHead>
                <TableHead className="min-w-[120px]">Estado</TableHead>
                <TableHead className="min-w-[120px]">Eventos</TableHead>
                <TableHead className="min-w-[120px]">Calificación</TableHead>
                <TableHead className="min-w-[150px]">Ubicación</TableHead>
                <TableHead className="min-w-[120px]">Fecha de registro</TableHead>
                <TableHead className="w-[100px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrganizers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No se encontraron organizadores
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrganizers.map((organizer) => (
                  <TableRow key={organizer.id}>
                    <TableCell className="font-medium">
                      <div className="min-w-[180px]">
                        <div className="truncate">{organizer.name}</div>
                        <div className="text-sm text-muted-foreground truncate">{organizer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {organizer.status === "active" ? (
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 whitespace-nowrap">
                          Activo
                        </Badge>
                      ) : organizer.status === "suspended" ? (
                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 whitespace-nowrap">
                          Suspendido
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200 whitespace-nowrap">
                          Pendiente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{organizer.eventsCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{organizer.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground">/5.0</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{organizer.location}</span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {new Date(organizer.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/organizers/${organizer.id}`}>Ver perfil</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/organizers/${organizer.id}/edit`}>Editar organizador</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {organizer.status === "active" ? (
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => updateOrganizerStatus(organizer.id, "suspended")}
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Suspender
                            </DropdownMenuItem>
                          ) : organizer.status === "suspended" ? (
                            <DropdownMenuItem 
                              className="text-green-600"
                              onClick={() => updateOrganizerStatus(organizer.id, "active")}
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Activar
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              className="text-green-600"
                              onClick={() => updateOrganizerStatus(organizer.id, "active")}
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Aprobar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {paginatedOrganizers.length} de {filteredOrganizers.length} organizadores
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <div className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 