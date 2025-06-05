import { Search, Calendar, MapPin, SlidersHorizontal, ArrowLeft, ArrowRight, Heart, Share2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { events, type EventData } from "@/lib/mock-data"

export default function AllEventsPage() {
  // Duplicar eventos para tener más contenido para mostrar
  const allEvents = [
    ...events,
    ...events.map((event: EventData) => ({ ...event, id: `dup-${event.id}` })),
    ...events.map((event: EventData) => ({ ...event, id: `trip-${event.id}` })),
  ].slice(0, 12)

  return (
    <main className="min-h-screen pb-16">
      {/* Header */}
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
      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-xl border border-black/5 p-5 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Filtros</h2>
                <Button variant="ghost" size="sm" className="text-primary h-8 px-2">
                  Limpiar todos
                </Button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar eventos..." className="pl-10" />
                </div>
              </div>

              <div className="space-y-6">
                {/* Categorías */}
                <div>
                  <h3 className="font-medium mb-3">Categorías</h3>
                  <div className="space-y-2">
                    {["Música", "Deportes", "Gastronomía", "Arte y cultura", "Tecnología", "Aire libre"].map(
                      (category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox id={`category-${category}`} />
                          <label
                            htmlFor={`category-${category}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {category}
                          </label>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <Separator />

                {/* Precio */}
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

                {/* Fecha */}
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

                {/* Ubicación */}
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

                {/* Más filtros */}
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

                <Button className="w-full bg-primary text-white">Aplicar filtros</Button>
              </div>
            </div>
          </div>

          {/* Events List */}
          <div className="flex-grow">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-primary">Todos los eventos</h2>
                <p className="text-muted-foreground">Mostrando {allEvents.length} eventos</p>
              </div>
              <div className="flex items-center gap-3">
                <Select defaultValue="featured">
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
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
              <Badge variant="outline" className="bg-card flex items-center gap-1 px-3 py-1">
                Música
                <button className="ml-1 hover:text-primary">×</button>
              </Badge>
              <Badge variant="outline" className="bg-card flex items-center gap-1 px-3 py-1">
                Este fin de semana
                <button className="ml-1 hover:text-primary">×</button>
              </Badge>
              <Badge variant="outline" className="bg-card flex items-center gap-1 px-3 py-1">
                Santiago
                <button className="ml-1 hover:text-primary">×</button>
              </Badge>
              <Button variant="ghost" size="sm" className="text-primary h-7 px-2">
                Limpiar filtros
              </Button>
            </div>

            {/* Events List */}
            <div className="space-y-6">
              {allEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative w-full sm:w-64 h-48 sm:h-auto flex-shrink-0">
                      <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
                      <div className="absolute top-2 left-2">
                        <Badge
                          className={`category-badge-${
                            event.category.toLowerCase() === "música"
                              ? "music"
                              : event.category.toLowerCase() === "deportes"
                                ? "sports"
                                : event.category.toLowerCase() === "gastronomía"
                                  ? "food"
                                  : event.category.toLowerCase() === "arte y cultura"
                                    ? "art"
                                    : event.category.toLowerCase() === "tecnología"
                                      ? "tech"
                                      : "outdoor"
                          }`}
                        >
                          {event.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6 flex-grow">
                      <div className="flex flex-col h-full justify-between">
                        <div>
                          <Link href={`/events/${event.id}`}>
                            <h3 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
                              {event.title}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Calendar className="h-4 w-4 flex-shrink-0 text-accent" />
                            <span className="text-sm">
                              {event.date} • {event.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground mb-3">
                            <MapPin className="h-4 w-4 flex-shrink-0 text-accent" />
                            <span className="text-sm">{event.location}</span>
                          </div>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{event.description}</p>
                        </div>

                        <div className="flex justify-between items-center mt-auto">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-primary/5 text-primary">
                              Desde $10.000
                            </Badge>
                            <div className="flex -space-x-2">
                              <div className="w-6 h-6 rounded-full bg-highlight"></div>
                              <div className="w-6 h-6 rounded-full bg-highlight/80"></div>
                              <div className="w-6 h-6 rounded-full bg-highlight/60"></div>
                              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                                +8
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full">
                              <Heart className="h-4 w-4" />
                              <span className="sr-only">Guardar</span>
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full">
                              <Share2 className="h-4 w-4" />
                              <span className="sr-only">Compartir</span>
                            </Button>
                            <Link href={`/events/${event.id}`}>
                              <Button className="bg-primary text-white hover:bg-primary/90">Ver detalles</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-12">
              <nav className="flex items-center gap-1">
                <Button variant="outline" size="icon" disabled>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="bg-primary text-white hover:bg-primary/90">
                  1
                </Button>
                <Button variant="outline" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
                <Button variant="outline" size="sm">
                  4
                </Button>
                <Button variant="outline" size="sm">
                  5
                </Button>
                <span className="mx-1">...</span>
                <Button variant="outline" size="sm">
                  12
                </Button>
                <Button variant="outline" size="icon">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>

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
