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
import EstadoEventoBadge from '@/components/estado-evento-badge'
import { useCategorias, useEventosDestacados } from '@/lib/hooks/usePublicData'
import { shouldUseLocalData } from '@/lib/hooks/useLocalData'

interface EventoReal {
  id_evento: number
  titulo: string
  descripcion: string | null
  fecha_inicio: string
  fecha_fin: string
  hora_inicio: string
  hora_fin: string
  ubicacion: string | null
  imagen: string | null
  nombre_categoria: string | null
  nombre_organizacion: string | null
  logo_organizacion: string | null
  en_curso: boolean
  proximo: boolean
  ya_realizado: boolean
  capacidad: number
  latitud: number | null
  longitud: number | null
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
  const { categorias, loading: loadingCategorias, error: errorCategorias } = useCategorias();
  const { eventos: todosEventos } = useEventosDestacados(1000); // Obtener todos los eventos para filtrar localmente
  const [loading, setLoading] = useState(true)
  const isLocalMode = shouldUseLocalData();
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [eventsPerPage] = useState(9)
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [estadoEvento, setEstadoEvento] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [pagination, setPagination] = useState<any>(null);

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

  // Las categorías se cargan automáticamente con el hook useCategorias

  // 2. Aplicar filtro de categoría desde URL cuando las categorías ya están disponibles
  useEffect(() => {
    if (categoryParam && categorias.length > 0) {
      const match = categorias.find((cat) => {
        return String(cat.id_categoria) === categoryParam;
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

        if (isLocalMode && todosEventos) {
          // Filtrar localmente usando los datos ya cargados
          console.log('🔍 Filtrando eventos localmente en página de eventos...');
          let eventosFiltrados = [...todosEventos];

          // Filtro por búsqueda
          if (searchText) {
            eventosFiltrados = eventosFiltrados.filter(evento =>
              evento.titulo.toLowerCase().includes(searchText.toLowerCase()) ||
              evento.descripcion?.toLowerCase().includes(searchText.toLowerCase())
            );
          }

          // Filtro por categoría
          if (selectedCategories.length > 0) {
            eventosFiltrados = eventosFiltrados.filter(evento => {
              const categoriaSeleccionada = categorias.find(cat => cat.nombre_categoria === selectedCategories[0]);
              return evento.nombre_categoria === categoriaSeleccionada?.nombre_categoria;
            });
          }

          // Filtro por estado
          if (estadoEvento) {
            const ahora = new Date();
            eventosFiltrados = eventosFiltrados.filter(evento => {
              const fechaEvento = new Date(evento.fecha_inicio);
              switch (estadoEvento) {
                case 'activo':
                  return fechaEvento > ahora;
                case 'finalizado':
                  return fechaEvento < ahora;
                case 'cancelado':
                  return false; // No tenemos estado cancelado en mocks
                default:
                  return true;
              }
            });
          }

          // Filtro por fecha
          if (fechaDesde) {
            const fechaDesdeDate = new Date(fechaDesde);
            eventosFiltrados = eventosFiltrados.filter(evento => 
              new Date(evento.fecha_inicio) >= fechaDesdeDate
            );
          }

          if (fechaHasta) {
            const fechaHastaDate = new Date(fechaHasta);
            eventosFiltrados = eventosFiltrados.filter(evento => 
              new Date(evento.fecha_inicio) <= fechaHastaDate
            );
          }

          // Ordenamiento
          if (sortBy && sortOrder) {
            eventosFiltrados.sort((a, b) => {
              let aValue: any, bValue: any;
              
              switch (sortBy) {
                case 'date':
                  aValue = new Date(a.fecha_inicio);
                  bValue = new Date(b.fecha_inicio);
                  break;
                case 'capacidad':
                  aValue = a.capacidad || 0;
                  bValue = b.capacidad || 0;
                  break;
                case 'titulo':
                  aValue = a.titulo.toLowerCase();
                  bValue = b.titulo.toLowerCase();
                  break;
                default:
                  return 0;
              }

              if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
              } else {
                return aValue < bValue ? 1 : -1;
              }
            });
          }

          // Calcular estado del evento
          const hoy = new Date();
          const eventosConEstado = eventosFiltrados.map((evento: any) => {
            const fechaInicio = new Date(evento.fecha_inicio);
            const fechaFin = new Date(evento.fecha_fin);
            const en_curso = typeof evento.en_curso === 'boolean' ? evento.en_curso : (fechaInicio <= hoy && fechaFin >= hoy);
            const proximo = typeof evento.proximo === 'boolean' ? evento.proximo : (fechaInicio > hoy);
            const ya_realizado = typeof evento.ya_realizado === 'boolean' ? evento.ya_realizado : (fechaFin < hoy);
            
                      console.log('🔍 Estado del evento:', evento.titulo, {
            fechaInicio: evento.fecha_inicio,
            fechaFin: evento.fecha_fin,
            fechaInicioObj: fechaInicio,
            fechaFinObj: fechaFin,
            hoy: hoy,
            en_curso,
            proximo,
            ya_realizado
          });
            
            return {
              ...evento,
              hora_inicio: evento.hora_inicio || '',
              hora_fin: evento.hora_fin || '',
              capacidad: evento.capacidad || 0,
              latitud: evento.latitud ?? null,
              longitud: evento.longitud ?? null,
              en_curso,
              proximo,
              ya_realizado,
            };
          });

          setEventos(eventosConEstado);
          setPagination({
            currentPage,
            totalPages: Math.ceil(eventosConEstado.length / eventsPerPage),
            totalItems: eventosConEstado.length,
            hasNextPage: currentPage < Math.ceil(eventosConEstado.length / eventsPerPage),
            hasPrevPage: currentPage > 1
          });
        } else {
          // Usar API remota
          const filtros: Record<string, any> = {
            page: currentPage,
            limit: eventsPerPage,
            sortBy,
            sortOrder,
          };

          if (searchText) filtros.search = searchText;
          if (selectedCategories.length > 0) {
            const categoriaSeleccionada = categorias.find(cat => cat.nombre_categoria === selectedCategories[0]);
            if (categoriaSeleccionada) {
              filtros.categoria = categoriaSeleccionada.id_categoria;
            }
          }
          if (estadoEvento) filtros.estado = estadoEvento;
          if (fechaDesde) filtros.fechaDesde = fechaDesde;
          if (fechaHasta) filtros.fechaHasta = fechaHasta;

          const data = await getEventosFiltrados(filtros);
          const hoy = new Date();
          const eventosConEstado = (data.eventos || []).map((event: any) => {
            const fechaInicio = new Date(event.fecha_inicio);
            const fechaFin = new Date(event.fecha_fin);
            return {
              ...event,
              hora_inicio: event.hora_inicio || '',
              hora_fin: event.hora_fin || '',
              capacidad: event.capacidad || 0,
              latitud: event.latitud ?? null,
              longitud: event.longitud ?? null,
              en_curso: typeof event.en_curso === 'boolean' ? event.en_curso : (fechaInicio <= hoy && fechaFin >= hoy),
              proximo: typeof event.proximo === 'boolean' ? event.proximo : (fechaInicio > hoy),
              ya_realizado: typeof event.ya_realizado === 'boolean' ? event.ya_realizado : (fechaFin < hoy),
            };
          });
          setEventos(eventosConEstado);
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error("Error al filtrar eventos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, [selectedCategories, searchText, sortBy, sortOrder, estadoEvento, fechaDesde, fechaHasta, currentPage, isLocalMode, todosEventos, categorias]);

  // Las categorías se cargan automáticamente con el hook useCategorias

  // Calcular paginación directamente desde eventos ya filtrados
  const indexOfLastEvent = currentPage * eventsPerPage
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage
  const currentEvents = eventos.slice(indexOfFirstEvent, indexOfLastEvent)
  const totalPages = Math.ceil(eventos.length / eventsPerPage)

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories((prev) => [...prev, category])
    } else {
      setSelectedCategories((prev) => prev.filter((cat) => cat !== category))
    }
    setCurrentPage(1) // Resetear a la primera página cuando se cambian filtros
  }

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchText('');
    setEstadoEvento('');
    setFechaDesde('');
    setFechaHasta('');
    setSortBy('');
    setSortOrder('');
    setCurrentPage(1);
  };

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

                {/* Categoría (Select en vez de checkboxes) */}
                <div>
                  <h3 className="font-medium mb-3">Categoría</h3>
                  <Select
                    value={selectedCategories[0] || ""}
                    onValueChange={(value) => {
                      setSelectedCategories(value ? [value] : []);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria.id_categoria} value={categoria.nombre_categoria}>
                          {categoria.nombre_categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  Mostrando {currentEvents.length} de {eventos.length} eventos
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
            ) : eventos.length === 0 ? (
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
                {currentEvents.map((event) => {
                  let estado = '';
                  let estadoColor = '';
                  if (event.en_curso) {
                    estado = 'En curso';
                    estadoColor = 'bg-green-500 text-white';
                  } else if (event.proximo) {
                    estado = 'Próximo';
                    estadoColor = 'bg-blue-500 text-white';
                  } else if (event.ya_realizado) {
                    estado = 'Finalizado';
                    estadoColor = 'bg-gray-500 text-white';
                  }
                  return (
                    <Card key={event.id_evento} className="overflow-hidden">
                      <div className="flex flex-col sm:flex-row">
                        <div className="relative w-full sm:w-96 h-64 sm:h-64 flex-shrink-0">
                          <Image
                            src={event.imagen || "/placeholder.svg"}
                            alt={event.titulo}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-2 left-2 flex flex-col gap-2">
                            <Badge className="mb-1">{event.nombre_categoria}</Badge>
                            <EstadoEventoBadge en_curso={event.en_curso} proximo={event.proximo} ya_realizado={event.ya_realizado} />
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
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{event.descripcion}</p>
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
                  );
                })}
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
