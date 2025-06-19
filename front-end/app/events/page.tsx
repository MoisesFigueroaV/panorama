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
  const categoryParam = searchParams.get("category")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [viewMode, setViewMode] = useState("grid")
  const [eventos, setEventos] = useState<EventoReal[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [eventsPerPage] = useState(9)

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

  // Mapeo inverso: de ID a nombre de categoría (usando useMemo para evitar recreaciones)
  const categoryIdToName = useMemo(() => {
    const mapping: Record<string, string> = {};
    categorias.forEach(cat => {
      const config = getCategoryConfig(cat.nombre_categoria);
      mapping[config.id] = cat.nombre_categoria;
    });
    return mapping;
  }, [categorias]);

  // Procesar parámetro de categoría de la URL
  useEffect(() => {
    if (categoryParam && categoryIdToName[categoryParam]) {
      setSelectedCategories([categoryIdToName[categoryParam]]);
    }
  }, [categoryParam, categoryIdToName]);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Si hay categorías seleccionadas, obtener eventos por categoría
        if (selectedCategories.length > 0) {
          // Obtener el ID de la primera categoría seleccionada
          const categoriaSeleccionada = categorias.find(cat => cat.nombre_categoria === selectedCategories[0])
          if (categoriaSeleccionada) {
            const eventosResponse = await api.public.getEventosByCategoria(categoriaSeleccionada.id_categoria, 100)
            setEventos(eventosResponse)
          }
        } else {
          // Obtener todos los eventos destacados
          const eventosResponse = await api.public.getEventosDestacados(100)
          setEventos(eventosResponse)
        }
      } catch (err: any) {
        console.error('Error al obtener eventos:', err)
        setError(err.message || 'Error al cargar eventos')
      } finally {
        setLoading(false)
      }
    }

    fetchEventos()
  }, [selectedCategories])

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
                {/* Categorías */}
                <div>
                  <h3 className="font-medium mb-3">Categorías</h3>
                  <div className="space-y-2">
                    {categorias.map((categoria) => (
                      <div key={categoria.id_categoria} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${categoria.id_categoria}`}
                          checked={selectedCategories.includes(categoria.nombre_categoria)}
                          onCheckedChange={(checked) => handleCategoryChange(categoria.nombre_categoria, checked === true)}
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

                {/* Fecha - Comentado temporalmente */}
                {/*
                <div>
                  <h3 className="font-medium mb-3">Fecha</h3>
                  <div className="space-y-2">
                    {["Hoy", "Mañana", "Este fin de semana", "Esta semana", "Este mes", "Personalizada"].map((date) => (
                      <div key={date} className="flex items-center space-x-2">
                        <Checkbox id={`date-${date}`} />
                        <label
                          htmlFor={`date-${date}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {date}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />
                */}

                {/* Ubicación - Comentado temporalmente */}
                {/*
                <div>
                  <h3 className="font-medium mb-3">Ubicación</h3>
                  <div className="space-y-3">
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona ciudad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="santiago">Santiago</SelectItem>
                        <SelectItem value="valparaiso">Valparaíso</SelectItem>
                        <SelectItem value="concepcion">Concepción</SelectItem>
                        <SelectItem value="la-serena">La Serena</SelectItem>
                        <SelectItem value="antofagasta">Antofagasta</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <Input type="number" placeholder="Radio (km)" className="w-full" />
                      <span className="text-sm text-muted-foreground">km</span>
                    </div>
                  </div>
                </div>

                <Separator />
                */}

                {/* Precio - Comentado temporalmente */}
                {/*
                <div>
                  <h3 className="font-medium mb-3">Precio</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="price-free" />
                      <label
                        htmlFor="price-free"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Gratis
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="price-paid" />
                      <label
                        htmlFor="price-paid"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        De pago
                      </label>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">$0</span>
                      <span className="text-sm text-muted-foreground">$100.000+</span>
                    </div>
                    <Slider defaultValue={[0, 75]} max={100} step={1} />
                    <div className="flex justify-between mt-2">
                      <div className="bg-muted rounded px-2 py-1 text-xs">$0</div>
                      <div className="bg-muted rounded px-2 py-1 text-xs">$75.000</div>
                    </div>
                  </div>
                </div>

                <Separator />
                */}

                {/* Más filtros - Comentado temporalmente */}
                {/*
                <div>
                  <h3 className="font-medium mb-3">Más filtros</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="filter-accessible" />
                      <label
                        htmlFor="filter-accessible"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Accesible
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="filter-family" />
                      <label
                        htmlFor="filter-family"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Familiar
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="filter-pet" />
                      <label
                        htmlFor="filter-pet"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Admite mascotas
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="filter-parking" />
                      <label
                        htmlFor="filter-parking"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Estacionamiento
                      </label>
                    </div>
                  </div>
                </div>
                */}

                <Button className="w-full bg-primary text-white">Aplicar filtros</Button>
              </div>
            </div>
          </div>

          {/* Events Grid */}
          <div className="flex-grow">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-primary">Todos los eventos</h2>
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
                <Select defaultValue="featured">
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4" />
                      <SelectValue placeholder="Ordenar por" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Destacados</SelectItem>
                    <SelectItem value="date-asc">Fecha (próximos)</SelectItem>
                    <SelectItem value="date-desc">Fecha (lejanos)</SelectItem>
                    <SelectItem value="price-asc">Precio (menor a mayor)</SelectItem>
                    <SelectItem value="price-desc">Precio (mayor a menor)</SelectItem>
                    <SelectItem value="popular">Popularidad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedCategories.map((category) => (
                <Badge key={category} variant="outline" className="bg-card flex items-center gap-1 px-3 py-1">
                  {category}
                  <button
                    className="ml-1 hover:text-primary"
                    onClick={() => setSelectedCategories((prev) => prev.filter((cat) => cat !== category))}
                  >
                    ×
                  </button>
                </Badge>
              ))}
              {selectedCategories.length > 0 && (
                <Button variant="ghost" size="sm" className="text-primary h-7 px-2" onClick={clearFilters}>
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
                          <Badge variant="outline" className="bg-primary/5 text-primary">
                            Desde $10.000
                          </Badge>
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
