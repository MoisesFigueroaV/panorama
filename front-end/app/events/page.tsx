"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Calendar, MapPin, ChevronDown, Grid, List, ArrowUpDown, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import EventCard from "@/components/event-card"
import { getEventosFiltrados } from '@/lib/api/apiClient';
import { api } from "@/lib/api"

interface EventoReal {
  id_evento: number
  titulo: string
  descripcion: string | null
  fecha_inicio: string
  fecha_fin: string
  ubicacion: string | null
  imagen: string | null
  nombre_categoria: string | null
  nombre_organizacion: string | null
  logo_organizacion: string | null
}

interface Categoria {
  id_categoria: number
  nombre_categoria: string
}

export default function EventsPage() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("categoria")
  const estadoParam = searchParams.get("estado")
  const searchParam = searchParams.get("search")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [viewMode, setViewMode] = useState("grid")
  const [eventos, setEventos] = useState<EventoReal[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [eventsPerPage] = useState(9)
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [estadoEvento, setEstadoEvento] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [pagination, setPagination] = useState(null);

  // Mapeo de IDs de categoría a nombres para mostrar
  const getCategoryConfig = (nombre: string) => {
    const lowerName = nombre.toLowerCase();
    if (lowerName.includes('música') || lowerName.includes('musica')) {
      return { id: 'music', nombre: nombre };
    } else if (lowerName.includes('deporte')) {
      return { id: 'sports', nombre: nombre };
    } else if (lowerName.includes('gastronomía') || lowerName.includes('gastronomia') || lowerName.includes('comida')) {
      return { id: 'food', nombre: nombre };
    } else if (lowerName.includes('arte') || lowerName.includes('cultura')) {
      return { id: 'art', nombre: nombre };
    } else if (lowerName.includes('tecnología') || lowerName.includes('tecnologia')) {
      return { id: 'tech', nombre: nombre };
    } else if (lowerName.includes('aire libre') || lowerName.includes('outdoor')) {
      return { id: 'outdoor', nombre: nombre };
    } else if (lowerName.includes('educación') || lowerName.includes('educacion')) {
      return { id: 'education', nombre: nombre };
    } else {
      return { id: 'other', nombre: nombre };
    }
  };

  // 1. Cargar categorías
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const categoriasResponse = await api.public.getCategorias();
        setCategorias(categoriasResponse);
      } catch (err: any) {
        console.error('Error al obtener categorías:', err);
      }
    };
    fetchCategorias();
  }, []);

  // 2. Aplicar filtro de categoría desde URL cuando las categorías ya están disponibles
  useEffect(() => {
    if (categoryParam && categorias.length > 0) {
      const match = categorias.find((cat) => {
        const config = getCategoryConfig(cat.nombre_categoria);
        return config.id === categoryParam;
      });
      if (match && !selectedCategories.includes(match.nombre_categoria)) {
        setSelectedCategories([match.nombre_categoria]);
      }
    }
  }, [categorias, categoryParam]);


  // Mapeo inverso: de ID a nombre de categoría
  const categoryIdToName = useMemo(() => {
    const mapping: Record<string, string> = {};
    categorias.forEach(cat => {
      const config = getCategoryConfig(cat.nombre_categoria);
      mapping[config.id] = cat.nombre_categoria;
    });
    return mapping;
  }, [categorias]);

  // Aplicar filtros desde URL
  useEffect(() => {
    if (searchParam) setSearchText(searchParam);
    if (estadoParam) setEstadoEvento(estadoParam);
  }, [searchParam, estadoParam]);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true);
    
        const filtros: Record<string, any> = {
          page: currentPage,
          limit: eventsPerPage,
          sortBy,
          sortOrder,
        };

        // Buscar por título
        if (searchText) {
          filtros.search = searchText;
        }

        // Filtrar por categoría (toma la primera categoría seleccionada, si existe)
        if (selectedCategories.length > 0) {
          const categoriaSeleccionada = categorias.find(cat => cat.nombre_categoria === selectedCategories[0]);
          if (categoriaSeleccionada) {
            filtros.categoria = categoriaSeleccionada.id_categoria;
          }
        }

        // Filtrar por estado
        if (estadoEvento) {
          filtros.estado = estadoEvento;
        }

        // Filtrar por fecha de inicio y fin
        if (fechaDesde) {
          filtros.fechaDesde = fechaDesde;
        }
        if (fechaHasta) {
          filtros.fechaHasta = fechaHasta;
        }

        const data = await getEventosFiltrados(filtros);
        setEventos(data.eventos); // o data.items si cambiaste la respuesta
        setPagination(data.pagination);
      } catch (error) {
        console.error("Error al filtrar eventos:", error);
      } finally {
        setLoading(false);
      }
    };


    fetchEventos()
  }, [selectedCategories, searchText, sortBy, sortOrder, estadoEvento, fechaDesde, fechaHasta, currentPage])

  // Cargar categorías al inicio
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const categoriasResponse = await api.public.getCategorias()
        setCategorias(categoriasResponse)
      } catch (err: any) {
        console.error('Error al obtener categorías:', err)
      }
    }

    fetchCategorias()
  }, [])

  // Filtrar eventos por categoría si hay alguna seleccionada
  const filteredEvents =
    selectedCategories.length > 0 
      ? eventos.filter((event) => selectedCategories.includes(event.nombre_categoria || ""))
      : eventos

  // Calcular paginación
  const indexOfLastEvent = currentPage * eventsPerPage
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent)
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage)

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories((prev) => [...prev, category])
    } else {
      setSelectedCategories((prev) => prev.filter((cat) => cat !== category))
    }
    setCurrentPage(1) // Resetear a la primera página cuando se cambian filtros
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setCurrentPage(1)
  }

  return (
    <main className="min-h-screen pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary via-accent to-highlight py-8">
        <div className="container">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a inicio</span>
          </Link>

          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Todos los eventos</h1>
            <p className="text-lg text-white/80 mb-6">Explora nuestra colección completa de eventos</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-primary/20 p-5 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Filtros</h2>
                <Button variant="ghost" size="sm" className="text-primary h-8 px-2" onClick={clearFilters}>
                  Limpiar todos
                </Button>
              </div>
              <div className="space-y-6">
                {/* Buscar por título */}
                <div>
                  <h3 className="font-medium mb-3">Buscar</h3>
                  <Input
                    type="text"
                    placeholder="Buscar por título"
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                <Separator />

                {/* Categorías */}
                <div>
                  <h3 className="font-medium mb-3">Categorías</h3>
                  <div className="space-y-2">
                    {categorias.map((categoria) => (
                      <div key={categoria.id_categoria} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${categoria.id_categoria}`}
                          checked={selectedCategories.includes(categoria.nombre_categoria)}
                          onCheckedChange={(checked) =>
                            handleCategoryChange(categoria.nombre_categoria, checked === true)
                          }
                        />
                        <label
                          htmlFor={`category-${categoria.id_categoria}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {categoria.nombre_categoria}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Estado del evento */}
                <div>
                  <h3 className="font-medium mb-3">Estado del evento</h3>
                  <Select
                    value={estadoEvento}
                    onValueChange={(value) => {
                      setEstadoEvento(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="finalizado">Finalizado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Fechas */}
                <div>
                  <h3 className="font-medium mb-3">Fecha</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Desde</label>
                      <Input
                        type="date"
                        value={fechaDesde}
                        onChange={(e) => {
                          setFechaDesde(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Hasta</label>
                      <Input
                        type="date"
                        value={fechaHasta}
                        onChange={(e) => {
                          setFechaHasta(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Events Grid */}
          <div className="flex-grow">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-primary">Todos los eventos</h2>
                  {sortBy && sortOrder && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Ordenado por:{" "}
                      {sortBy === "date" && (sortOrder === "asc" ? "Fecha (próximos)" : "Fecha (lejanos)")}
                      {sortBy === "capacidad" && (sortOrder === "asc" ? "Capacidad (menor a mayor)" : "Capacidad (mayor a menor)")}
                      {sortBy === "titulo" && (sortOrder === "asc" ? "Título (A-Z)" : "Título (Z-A)")}
                    </p>
                  )}
                <p className="text-muted-foreground">
                  Mostrando {currentEvents.length} de {filteredEvents.length} eventos
                  {selectedCategories.length > 0 && ` en categoría${selectedCategories.length > 1 ? 's' : ''}: ${selectedCategories.join(', ')}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Tabs value={viewMode} onValueChange={setViewMode} className="w-[200px]">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="grid" className="flex items-center gap-1">
                      <Grid className="h-4 w-4" />
                      <span className="sr-only md:not-sr-only">Cuadrícula</span>
                    </TabsTrigger>
                    <TabsTrigger value="list" className="flex items-center gap-1">
                      <List className="h-4 w-4" />
                      <span className="sr-only md:not-sr-only">Lista</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                {/* Ordenamiento de eventos */}
                <Select
                  value={sortBy && sortOrder ? `${sortBy}-${sortOrder}` : ''}
                  onValueChange={(value) => {
                    const [by, order] = value.split('-');
                    setSortBy(by);
                    setSortOrder(order);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4" />
                      <SelectValue placeholder="Ordenar por" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-asc">Fecha (próximos)</SelectItem>
                    <SelectItem value="date-desc">Fecha (lejanos)</SelectItem>
                    <SelectItem value="capacidad-asc">Capacidad (menor a mayor)</SelectItem>
                    <SelectItem value="capacidad-desc">Capacidad (mayor a menor)</SelectItem>
                    <SelectItem value="titulo-asc">Título (A-Z)</SelectItem>
                    <SelectItem value="titulo-desc">Título (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Active Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {/* Filtro de búsqueda */}
              {searchText && (
                <Badge variant="outline" className="bg-card flex items-center gap-1 px-3 py-1">
                  Buscar: "{searchText}"
                  <button onClick={() => setSearchText('')} className="ml-1 hover:text-primary">×</button>
                </Badge>
              )}

              {/* Filtros de categoría */}
              {selectedCategories.map((category) => (
                <Badge key={category} variant="outline" className="bg-card flex items-center gap-1 px-3 py-1">
                  {category}
                  <button onClick={() => setSelectedCategories(prev => prev.filter(cat => cat !== category))} className="ml-1 hover:text-primary">×</button>
                </Badge>
              ))}

              {/* Filtro de estado */}
              {estadoEvento && (
                <Badge variant="outline" className="bg-card flex items-center gap-1 px-3 py-1">
                  Estado: {estadoEvento}
                  <button onClick={() => setEstadoEvento('')} className="ml-1 hover:text-primary">×</button>
                </Badge>
              )}

              {/* Filtros de fechas */}
              {fechaDesde && (
                <Badge variant="outline" className="bg-card flex items-center gap-1 px-3 py-1">
                  Desde: {fechaDesde}
                  <button onClick={() => setFechaDesde('')} className="ml-1 hover:text-primary">×</button>
                </Badge>
              )}
              {fechaHasta && (
                <Badge variant="outline" className="bg-card flex items-center gap-1 px-3 py-1">
                  Hasta: {fechaHasta}
                  <button onClick={() => setFechaHasta('')} className="ml-1 hover:text-primary">×</button>
                </Badge>
              )}

              {(searchText || selectedCategories.length || estadoEvento || fechaDesde || fechaHasta) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary h-7 px-2"
                  onClick={clearFilters}
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Error al cargar eventos: {error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="mt-4"
                >
                  Reintentar
                </Button>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No se encontraron eventos con los filtros seleccionados.</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentEvents.map((event) => (
                  <EventCard key={event.id_evento} event={event} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {currentEvents.map((event) => (
                  <Card key={event.id_evento} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative w-full sm:w-96 h-64 sm:h-64 flex-shrink-0">
                        <Image
                          src={event.imagen || "/placeholder.svg"}
                          alt={event.titulo}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          <Badge
                            className={`category-badge-${
                              event.nombre_categoria?.toLowerCase() === "música"
                                ? "music"
                                : event.nombre_categoria?.toLowerCase() === "deportes"
                                  ? "sports"
                                  : event.nombre_categoria?.toLowerCase() === "gastronomía"
                                    ? "food"
                                    : event.nombre_categoria?.toLowerCase() === "arte y cultura"
                                      ? "art"
                                      : event.nombre_categoria?.toLowerCase() === "tecnología"
                                        ? "tech"
                                        : "outdoor"
                            }`}
                          >
                            {event.nombre_categoria}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4 flex-grow">
                        <Link href={`/events/${event.id_evento}`}>
                          <h3 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
                            {event.titulo}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Calendar className="h-4 w-4 flex-shrink-0 text-primary" />
                          <span className="text-sm">
                            {event.fecha_inicio} • {event.fecha_fin}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground mb-3">
                          <MapPin className="h-4 w-4 flex-shrink-0 text-primary" />
                          <span className="text-sm">{event.ubicacion}</span>
                        </div>
                        <p className="text-muted-foreground text-sm mb-4">{event.descripcion}</p>
                        <div className="flex justify-between items-center">
<div></div>
                          <Link href={`/events/${event.id_evento}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-primary text-primary hover:bg-primary/10"
                            >
                              Ver detalles
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-center mt-12">
              <nav className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <ChevronDown className="h-4 w-4 rotate-90" />
                </Button>
                
                {/* Mostrar páginas */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                      className={currentPage === pageNumber ? "bg-primary text-white hover:bg-primary/90" : ""}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="mx-1">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
                
                <Button 
                  variant="outline" 
                  size="icon"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <ChevronDown className="h-4 w-4 -rotate-90" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="container py-12">
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-highlight/10 rounded-2xl p-8">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-2 bg-accent text-white">¿No encuentras lo que buscas?</Badge>
            <h2 className="text-2xl font-bold mb-4 text-primary">Recibe alertas de nuevos eventos</h2>
            <p className="text-muted-foreground mb-6">
              Suscríbete a nuestras alertas y recibe notificaciones cuando se publiquen eventos que coincidan con tus
              intereses.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input type="email" placeholder="Tu correo electrónico" className="bg-white border-0" />
              <Button className="bg-primary text-white">Suscribirme</Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
