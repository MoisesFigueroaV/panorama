"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Download, Filter, Flag, XCircle } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Datos de ejemplo para los reportes
const reports = [
  {
    id: 1,
    type: "Evento",
    title: "Contenido inapropiado",
    reportedItem: "Festival de Música Electrónica",
    reportedBy: "Juan Pérez",
    date: "15/05/2023",
    status: "Pendiente",
    priority: "Alta",
  },
  {
    id: 2,
    type: "Usuario",
    title: "Comportamiento abusivo",
    reportedItem: "Carlos Rodríguez",
    reportedBy: "María López",
    date: "10/05/2023",
    status: "Revisado",
    priority: "Media",
  },
  {
    id: 3,
    type: "Comentario",
    title: "Spam",
    reportedItem: "Comentario en Concierto de Rock",
    reportedBy: "Ana Martínez",
    date: "08/05/2023",
    status: "Resuelto",
    priority: "Baja",
  },
  {
    id: 4,
    type: "Evento",
    title: "Información falsa",
    reportedItem: "Conferencia de Tecnología",
    reportedBy: "Roberto Gómez",
    date: "05/05/2023",
    status: "Rechazado",
    priority: "Media",
  },
  {
    id: 5,
    type: "Organizador",
    title: "Fraude",
    reportedItem: "Eventos Premium",
    reportedBy: "Laura Sánchez",
    date: "01/05/2023",
    status: "Pendiente",
    priority: "Alta",
  },
  {
    id: 6,
    type: "Usuario",
    title: "Suplantación de identidad",
    reportedItem: "Miguel Fernández",
    reportedBy: "Patricia Díaz",
    date: "28/04/2023",
    status: "Revisado",
    priority: "Alta",
  },
  {
    id: 7,
    type: "Comentario",
    title: "Lenguaje ofensivo",
    reportedItem: "Comentario en Taller de Cocina",
    reportedBy: "Javier Ruiz",
    date: "25/04/2023",
    status: "Resuelto",
    priority: "Media",
  },
]

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Filtrar reportes según los criterios
  const filteredReports = reports.filter((report) => {
    // Filtro por pestaña
    if (activeTab !== "all" && report.status.toLowerCase() !== activeTab.toLowerCase()) {
      return false
    }

    // Filtros adicionales
    const matchesStatus = statusFilter === "all" || report.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesType = typeFilter === "all" || report.type.toLowerCase() === typeFilter.toLowerCase()
    const matchesPriority = priorityFilter === "all" || report.priority.toLowerCase() === priorityFilter.toLowerCase()

    return matchesStatus && matchesType && matchesPriority
  })

  // Paginación
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedReports = filteredReports.slice(startIndex, startIndex + itemsPerPage)

  // Función para obtener el color del badge según el estado
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "revisado":
        return "bg-blue-100 text-blue-800"
      case "resuelto":
        return "bg-green-100 text-green-800"
      case "rechazado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Función para obtener el icono según el estado
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pendiente":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "revisado":
        return <Flag className="h-4 w-4 text-blue-600" />
      case "resuelto":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rechazado":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  // Función para obtener el color del badge según la prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "alta":
        return "bg-red-100 text-red-800"
      case "media":
        return "bg-orange-100 text-orange-800"
      case "baja":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Reportes</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{reports.filter((r) => r.status.toLowerCase() === "pendiente").length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Flag className="h-5 w-5 text-blue-600" />
              Revisados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{reports.filter((r) => r.status.toLowerCase() === "revisado").length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Resueltos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{reports.filter((r) => r.status.toLowerCase() === "resuelto").length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Rechazados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{reports.filter((r) => r.status.toLowerCase() === "rechazado").length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="pendiente">Pendientes</TabsTrigger>
              <TabsTrigger value="revisado">Revisados</TabsTrigger>
              <TabsTrigger value="resuelto">Resueltos</TabsTrigger>
              <TabsTrigger value="rechazado">Rechazados</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Tipo de reporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="evento">Evento</SelectItem>
                <SelectItem value="usuario">Usuario</SelectItem>
                <SelectItem value="comentario">Comentario</SelectItem>
                <SelectItem value="organizador">Organizador</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2 ml-auto">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter size={16} />
                <span>Más filtros</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download size={16} />
                <span>Exportar</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Elemento reportado</TableHead>
                <TableHead>Reportado por</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>#{report.id}</TableCell>
                  <TableCell>{report.type}</TableCell>
                  <TableCell>{report.title}</TableCell>
                  <TableCell>{report.reportedItem}</TableCell>
                  <TableCell>{report.reportedBy}</TableCell>
                  <TableCell>{report.date}</TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(report.priority)}>{report.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(report.status)}
                      <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Ver detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Paginación */}
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-gray-500">
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredReports.length)} de{" "}
              {filteredReports.length} reportes
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm">
                Página {currentPage} de {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
