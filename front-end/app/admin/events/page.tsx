"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Download, RefreshCw, Calendar, Users, MapPin } from "lucide-react"
import { AdminEventCard } from "@/components/admin/admin-event-card"
import { EventFilters } from "@/components/admin/event-filters"
import { Pagination } from "@/components/ui/pagination"
import { api } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

interface AdminEvent {
  id_evento: number
  titulo: string
  descripcion: string | null
  fecha_inicio: string
  fecha_fin: string
  ubicacion: string | null
  imagen: string | null
  capacidad: number
  id_estado_evento: number | null
  nombre_organizacion: string | null
  nombre_categoria: string | null
  nombre_estado: string | null
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface Filters {
  search: string
  estado: number | null
  categoria: number | null
  organizador: number | null
  fechaDesde: string
  fechaHasta: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export default function EventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [filters, setFilters] = useState<Filters>({
    search: "",
    estado: null,
    categoria: null,
    organizador: null,
    fechaDesde: "",
    fechaHasta: "",
    sortBy: "fecha_registro",
    sortOrder: "desc"
  })
  const [activeTab, setActiveTab] = useState("all")
  const { accessToken, user } = useAuth()

  const fetchEvents = async (page = 1, newFilters = filters) => {
    try {
      console.log('🔐 Token disponible:', !!accessToken)
      console.log('🔐 Token:', accessToken ? accessToken.substring(0, 20) + '...' : 'No hay token')
      console.log('👤 Usuario:', user)
      console.log('👤 Rol:', user?.rol)
      
      if (!accessToken) {
        toast.error("No tienes acceso")
        return
      }
      
      if (!user || user.rol?.id_rol !== 1) {
        toast.error("No tienes permisos de administrador")
        return
      }
      
      console.log('📡 Fetching eventos con filtros:', newFilters)
      setLoading(true)
      
      // Temporalmente usar el endpoint que sabemos que funciona
      const data = await api.eventos.getAllForAdmin(accessToken)
      
      console.log('📊 Datos recibidos:', data.length, 'eventos')
      
      // Aplicar filtros en el front-end por ahora
      let filteredEvents = data
      
      if (newFilters.estado) {
        filteredEvents = filteredEvents.filter((event: AdminEvent) => event.id_estado_evento === newFilters.estado)
        console.log('🔍 Filtrado por estado:', newFilters.estado, 'eventos:', filteredEvents.length)
      }
      
      if (newFilters.search) {
        filteredEvents = filteredEvents.filter((event: AdminEvent) => 
          event.titulo.toLowerCase().includes(newFilters.search.toLowerCase()) ||
          event.nombre_organizacion?.toLowerCase().includes(newFilters.search.toLowerCase()) ||
          event.nombre_categoria?.toLowerCase().includes(newFilters.search.toLowerCase())
        )
        console.log('🔍 Filtrado por búsqueda:', newFilters.search, 'eventos:', filteredEvents.length)
      }
      
      // Simular paginación en el front-end
      const startIndex = (page - 1) * pagination.limit
      const endIndex = startIndex + pagination.limit
      const paginatedEvents = filteredEvents.slice(startIndex, endIndex)
      
      console.log('📄 Eventos paginados:', paginatedEvents.length)
      
      setEvents(paginatedEvents)
      setPagination({
        page,
        limit: pagination.limit,
        total: filteredEvents.length,
        totalPages: Math.ceil(filteredEvents.length / pagination.limit),
        hasNext: endIndex < filteredEvents.length,
        hasPrev: page > 1
      })
    } catch (error: any) {
      console.error("Error al obtener eventos:", error)
      
      // Extraer el mensaje de error correctamente
      let errorMessage = "Error al obtener eventos";
      
      if (error.response?.data?.error) {
        // Si el error viene en formato { error: "mensaje" }
        errorMessage = error.response.data.error;
      } else if (error.response?.data) {
        // Si el error es directamente un string
        errorMessage = typeof error.response.data === 'string' ? error.response.data : errorMessage;
      } else if (error.message) {
        // Si hay un mensaje en el error
        errorMessage = error.message;
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents(1, filters)
  }, [accessToken])

  const handleStatusChange = () => {
    // Refrescar la lista cuando se cambie el estado de un evento
    fetchEvents(pagination.page, filters)
  }

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters)
    fetchEvents(1, newFilters) // Reset a página 1 cuando cambian los filtros
  }

  const handleClearFilters = () => {
    const defaultFilters: Filters = {
      search: "",
      estado: null,
      categoria: null,
      organizador: null,
      fechaDesde: "",
      fechaHasta: "",
      sortBy: "fecha_registro",
      sortOrder: "desc"
    }
    setFilters(defaultFilters)
    fetchEvents(1, defaultFilters)
  }

  const handlePageChange = (page: number) => {
    fetchEvents(page, filters)
  }

  const handleTabChange = (tab: string) => {
    console.log('🔄 Cambiando a pestaña:', tab)
    setActiveTab(tab)
    let newFilters = { ...filters }
    
    // Aplicar filtro de estado según la pestaña
    switch (tab) {
      case "pending":
        newFilters.estado = 1
        break
      case "published":
        newFilters.estado = 2
        break
      default:
        newFilters.estado = null
    }
    
    console.log('🔍 Nuevos filtros:', newFilters)
    setFilters(newFilters)
    fetchEvents(1, newFilters)
  }

  const getEventStats = () => {
    // Si estamos en una pestaña específica, solo contar los eventos de ese estado
    if (activeTab !== "all") {
      const stats = {
        total: pagination.total,
        pending: activeTab === "pending" ? pagination.total : 0,
        published: activeTab === "published" ? pagination.total : 0
      }
      return stats
    }

    // Si estamos en "all", contar todos los eventos cargados
    const stats = {
      total: pagination.total,
      pending: 0,
      published: 0
    }

    events.forEach(event => {
      switch (event.id_estado_evento) {
        case 1:
          stats.pending++
          break
        case 2:
          stats.published++
          break
      }
    })

    return stats
  }

  const stats = getEventStats()

  if (loading && events.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
            <p className="text-muted-foreground">Gestiona los eventos de la plataforma</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-32">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <p className="text-muted-foreground">Cargando eventos...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
          <p className="text-muted-foreground">Gestiona los eventos de la plataforma</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            onClick={() => fetchEvents(pagination.page, filters)}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo evento</span>
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Eventos registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Badge variant="secondary" className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Por revisar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publicados</CardTitle>
            <Badge variant="default" className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
            <p className="text-xs text-muted-foreground">Activos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <EventFilters 
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* Contenido principal */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Eventos</CardTitle>
          <CardDescription>
            Revisa y gestiona todos los eventos de la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <TabsList className="grid w-full sm:w-auto grid-cols-3">
                <TabsTrigger value="all">
                  Todos ({stats.total})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pendientes ({stats.pending})
                </TabsTrigger>
                <TabsTrigger value="published">
                  Publicados ({stats.published})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="m-0">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <p className="text-muted-foreground">Cargando eventos...</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 p-4 md:p-6 md:grid-cols-2 lg:grid-cols-3">
                    {events.length > 0 ? (
                      events.map((event) => (
                        <AdminEventCard key={event.id_evento} event={event} onStatusChange={handleStatusChange} />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No se encontraron eventos</p>
                        <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                      </div>
                    )}
                  </div>

                  {/* Paginación */}
                  {pagination.totalPages > 1 && (
                    <div className="mt-6 pt-6 border-t">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} eventos
                        </p>
                        <Pagination
                          currentPage={pagination.page}
                          totalPages={pagination.totalPages}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
