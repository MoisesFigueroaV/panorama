"use client"

import {
  Search,
  MapPin,
  Calendar,
  Filter,
  Music,
  Trophy,
  ArrowRight,
  Users,
  Building2,
  Globe,
  Star,
  Bell,
  Palette,
  Code,
  TreePine,
} from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { events } from "@/lib/mock-data"

// Importar todos los componentes necesarios
import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import EventCard from "@/components/event-card"
import EventMap from "@/components/event-map"
import NewsletterForm from "@/components/newsletter-form"
import CalendarView from "@/components/calendar-view"
import PromotedEventsCarousel from "@/components/promoted-events-carousel"
import CategoryCard from "@/components/category-card"
import TestimonialCard from "@/components/testimonial-card"
import FeaturedOrganizers from "@/components/featured-organizers"
import { DynamicHeader } from "@/components/dynamic-header"
import { useEventosDestacados, useOrganizadoresVerificados, useCategorias, useEventosByCategoria } from "@/lib/hooks/usePublicData"
import CategoryCardWithCount from "@/components/category-card-with-count"

export default function Home() {
  // Obtener datos reales
  const { eventos, loading: loadingEventos, error: errorEventos } = useEventosDestacados(6);
  const { organizadores, loading: loadingOrganizadores, error: errorOrganizadores } = useOrganizadoresVerificados(3);
  const { categorias, loading: loadingCategorias, error: errorCategorias } = useCategorias();

  // Testimonios para mostrar
  const testimonials = [
    {
      quote: "Encontré los mejores conciertos gracias a esta plataforma. ¡Increíble experiencia!",
      author: "Carlos Rodríguez",
      role: "Usuario frecuente",
      rating: 5,
    },
    {
      quote: "Como organizador, he podido llegar a mucho más público. Las herramientas son excelentes.",
      author: "María González",
      role: "Organizadora de eventos",
      rating: 5,
    },
    // Más testimonios podrían agregarse aquí
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <DynamicHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-primary via-accent to-highlight h-[600px] flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-black/30 z-10"></div>
          <div className="container relative z-20">
            <div className="max-w-2xl text-secondary-foreground">
              <Badge className="bg-white text-primary mb-4 backdrop-blur-sm">¡Descubre tu próxima aventura!</Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-slide-up text-white">
                Encuentra eventos increíbles cerca de ti
              </h1>
              <p className="text-lg md:text-xl mb-8 text-white/90 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                Conciertos, festivales, talleres, conferencias y mucho más. Todo lo que está pasando en tu ciudad, en un
                solo lugar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  Explorar eventos
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white border-gray-100 bg-white/10 hover:bg-white/20"
                >
                  Ver mapa
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 z-0">
            <Image
              src="/placeholder.svg?height=600&width=1920"
              alt="Eventos destacados"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Floating elements for visual interest */}
          <div className="absolute bottom-10 right-10 z-20 hidden lg:block">
            <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 w-64 animate-float border border-black/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-secondary-foreground font-medium">Festival de Jazz</p>
                  <p className="text-secondary-foreground/70 text-sm">Hoy, 20:00</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-primary"></div>
                  <div className="w-6 h-6 rounded-full bg-accent"></div>
                  <div className="w-6 h-6 rounded-full bg-highlight"></div>
                </div>
                <p className="text-secondary-foreground/70 text-xs ml-2">+120 personas asistirán</p>
              </div>
            </div>
          </div>

          <div className="absolute top-40 right-40 z-20 hidden lg:block">
            <div
              className="bg-white/80 backdrop-blur-md rounded-xl p-3 animate-float border border-black/5"
              style={{ animationDelay: "1s" }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <p className="text-secondary-foreground text-sm font-medium">Maratón Urbana</p>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="container py-8">
          <div className="bg-white shadow-lg rounded-2xl -mt-24 relative z-30 p-6 border border-black/5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar eventos..." className="pl-10 bg-card border-gray-100" />
              </div>
              <Select>
                <SelectTrigger className="border-gray-100 bg-card">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent" />
                    <SelectValue placeholder="Ubicación" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="santiago">Santiago</SelectItem>
                  <SelectItem value="valparaiso">Valparaíso</SelectItem>
                  <SelectItem value="concepcion">Concepción</SelectItem>
                  <SelectItem value="la-serena">La Serena</SelectItem>
                  <SelectItem value="antofagasta">Antofagasta</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="border-gray-100 bg-card">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-accent" />
                    <SelectValue placeholder="Fecha" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="tomorrow">Mañana</SelectItem>
                  <SelectItem value="this-weekend">Este fin de semana</SelectItem>
                  <SelectItem value="this-week">Esta semana</SelectItem>
                  <SelectItem value="this-month">Este mes</SelectItem>
                  <SelectItem value="custom">Fecha personalizada</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="border-gray-100 bg-card">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-accent" />
                    <SelectValue placeholder="Categoría" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="music">Música</SelectItem>
                  <SelectItem value="sports">Deportes</SelectItem>
                  <SelectItem value="food">Gastronomía</SelectItem>
                  <SelectItem value="art">Arte y cultura</SelectItem>
                  <SelectItem value="tech">Tecnología</SelectItem>
                  <SelectItem value="outdoor">Aire libre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-card cursor-pointer hover:bg-muted border-gray-100 text-primary">
                Conciertos
              </Badge>
              <Badge variant="outline" className="bg-card cursor-pointer hover:bg-muted border-gray-100 text-primary">
                Festivales
              </Badge>
              <Badge variant="outline" className="bg-card cursor-pointer hover:bg-muted border-gray-100 text-primary">
                Gratuitos
              </Badge>
              <Badge variant="outline" className="bg-card cursor-pointer hover:bg-muted border-gray-100 text-primary">
                Familiar
              </Badge>
              <Badge variant="outline" className="bg-card cursor-pointer hover:bg-muted border-gray-100 text-primary">
                Talleres
              </Badge>
              <Badge variant="outline" className="bg-card cursor-pointer hover:bg-muted border-gray-100 text-primary">
                Exposiciones
              </Badge>
            </div>
          </div>
        </section>

        {/* Stats Section - Rediseñada con colores más coherentes */}
        <section className="container py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-primary">Panorama en números</h2>
            <p className="text-muted-foreground">Descubre el alcance de nuestra plataforma</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20 p-6 text-center hover:shadow-md transition-all duration-300">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-4xl font-bold text-primary mb-1">250+</h3>
              <p className="text-muted-foreground font-medium">Eventos mensuales</p>
            </div>

            <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl border border-accent/20 p-6 text-center hover:shadow-md transition-all duration-300">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Users className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-4xl font-bold text-accent mb-1">10K+</h3>
              <p className="text-muted-foreground font-medium">Usuarios activos</p>
            </div>

            <div className="bg-gradient-to-br from-highlight/5 to-highlight/10 rounded-xl border border-highlight/20 p-6 text-center hover:shadow-md transition-all duration-300">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Building2 className="h-8 w-8 text-highlight" />
              </div>
              <h3 className="text-4xl font-bold text-highlight mb-1">120+</h3>
              <p className="text-muted-foreground font-medium">Organizaciones</p>
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-xl border border-accent/20 p-6 text-center hover:shadow-md transition-all duration-300">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Globe className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-4xl font-bold text-accent mb-1">15+</h3>
              <p className="text-muted-foreground font-medium">Ciudades</p>
            </div>
          </div>
        </section>

        {/* Eventos Destacados - Rediseñado para mayor visibilidad */}
        <section className="container py-12 bg-gradient-to-r from-primary/5 via-accent/5 to-highlight/5 rounded-3xl">
          <div className="text-center mb-8">
            <Badge className="mb-2 bg-primary text-white">Lo más popular</Badge>
            <h2 className="text-3xl font-bold mb-2 text-primary">Eventos destacados</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Descubre los eventos más populares y promocionados de esta semana. No te pierdas estas experiencias
              únicas.
            </p>
          </div>
          <PromotedEventsCarousel events={events.slice(0, 5)} />

          {/* Eventos destacados en formato de tarjetas con indicador */}
          <div className="mt-12">
            <h3 className="text-xl font-bold mb-6 text-primary">Eventos que no te puedes perder</h3>
            {loadingEventos ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : errorEventos ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Error al cargar eventos: {errorEventos}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {eventos.slice(0, 3).map((event) => (
                  <EventCard key={event.id_evento} event={event} />
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-center mt-8">
            <Link href="/events">
              <Button size="lg" className="bg-primary text-white gap-2">
                <Star className="h-4 w-4" />
                Ver todos los eventos destacados
              </Button>
            </Link>
          </div>
        </section>

        {/* Explore by Categories */}
        <section className="container py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-primary">Explora por categorías</h2>
            <p className="text-muted-foreground">Encuentra eventos según tus intereses</p>
          </div>
          
          {loadingCategorias ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : errorCategorias ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Error al cargar categorías: {errorCategorias}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
              {categorias.map((categoria) => {
                // Mapear categorías reales a iconos y colores
                const getCategoryConfig = (nombre: string) => {
                  const lowerName = nombre.toLowerCase();
                  if (lowerName.includes('música') || lowerName.includes('musica')) {
                    return { icon: <Music className="h-6 w-6" />, id: 'music' };
                  } else if (lowerName.includes('deporte')) {
                    return { icon: <Trophy className="h-6 w-6" />, id: 'sports' };
                  } else if (lowerName.includes('gastronomía') || lowerName.includes('gastronomia') || lowerName.includes('comida')) {
                    return { icon: <Calendar className="h-6 w-6" />, id: 'food' };
                  } else if (lowerName.includes('arte') || lowerName.includes('cultura')) {
                    return { icon: <Palette className="h-6 w-6" />, id: 'art' };
                  } else if (lowerName.includes('tecnología') || lowerName.includes('tecnologia')) {
                    return { icon: <Code className="h-6 w-6" />, id: 'tech' };
                  } else if (lowerName.includes('aire libre') || lowerName.includes('outdoor')) {
                    return { icon: <TreePine className="h-6 w-6" />, id: 'outdoor' };
                  } else if (lowerName.includes('educación') || lowerName.includes('educacion')) {
                    return { icon: <Calendar className="h-6 w-6" />, id: 'education' };
                  } else {
                    return { icon: <Calendar className="h-6 w-6" />, id: 'other' };
                  }
                };

                const config = getCategoryConfig(categoria.nombre_categoria);
                
                return (
                  <CategoryCardWithCount
                    key={categoria.id_categoria}
                    id={config.id}
                    name={categoria.nombre_categoria}
                    categoriaId={categoria.id_categoria}
                    icon={config.icon}
                    color=""
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="container py-8">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-gradient-to-r from-primary/10 via-accent/10 to-highlight/10 rounded-2xl p-8">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-primary">¿Ya tienes una cuenta?</h2>
              <p className="text-muted-foreground">
                Inicia sesión para descubrir eventos personalizados y guardar tus favoritos
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/login">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-primary text-white">Registrarse</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Events Section */}
        <section className="container py-12">
          <Tabs defaultValue="list" className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2 text-primary">Explora todos los eventos</h2>
                <p className="text-muted-foreground">Encuentra el evento perfecto para ti</p>
              </div>
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <TabsList className="bg-muted">
                  <TabsTrigger value="list" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                    Lista
                  </TabsTrigger>
                  <TabsTrigger value="map" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                    Mapa
                  </TabsTrigger>
                  <TabsTrigger
                    value="calendar"
                    className="data-[state=active]:bg-primary data-[state=active]:text-white"
                  >
                    Calendario
                  </TabsTrigger>
                </TabsList>
                <Select defaultValue="featured">
                  <SelectTrigger className="w-[180px] border-gray-100 bg-card">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Destacados</SelectItem>
                    <SelectItem value="date-asc">Fecha (próximos)</SelectItem>
                    <SelectItem value="date-desc">Fecha (lejanos)</SelectItem>
                    <SelectItem value="popular">Popularidad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="list" className="space-y-8">
              {loadingEventos ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : errorEventos ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Error al cargar eventos: {errorEventos}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {eventos.map((event) => (
                    <EventCard key={event.id_evento} event={event} />
                  ))}
                </div>
              )}
              <div className="flex justify-center">
                <Link href="/events">
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 border-primary text-primary hover:bg-primary hover:text-white"
                  >
                    Ver más eventos
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="map">
              <div className="h-[600px] rounded-lg overflow-hidden border border-black/5">
                <EventMap events={events} />
              </div>
            </TabsContent>

            <TabsContent value="calendar">
              <CalendarView events={events} />
            </TabsContent>
          </Tabs>
        </section>

        {/* Featured Organizers */}
        <section className="container py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 text-primary">Organizadores destacados</h2>
            <p className="text-muted-foreground">Conoce a quienes crean los mejores eventos</p>
          </div>
          <FeaturedOrganizers 
            organizadores={organizadores} 
            loading={loadingOrganizadores} 
          />
          {errorOrganizadores && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Error al cargar organizadores: {errorOrganizadores}</p>
            </div>
          )}
        </section>

        {/* Testimonials */}
        <section className="container py-12 bg-muted/30 rounded-2xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2 text-primary">Lo que dicen nuestros usuarios</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Miles de personas usan nuestra plataforma para encontrar y organizar eventos increíbles
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                quote={testimonial.quote}
                author={testimonial.author}
                role={testimonial.role}
                rating={testimonial.rating}
              />
            ))}
            {/* Añadir un testimonio más para completar la fila */}
            <TestimonialCard
              quote="La mejor plataforma para encontrar eventos. La interfaz es muy intuitiva y fácil de usar."
              author="Ana Martínez"
              role="Usuario frecuente"
              rating={5}
            />
          </div>
        </section>

        {/* Mantenerse Informado - Con estilo de gradiente unificado */}
        <section className="container py-16">
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-highlight/10 rounded-2xl p-8 md:p-12 border border-primary/10 shadow-sm">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Bell className="h-8 w-8 text-primary" />
              </div>
              <Badge className="mb-2 bg-primary text-white">Mantente informado</Badge>
              <h2 className="text-3xl font-bold mb-4 text-primary">No te pierdas ningún evento</h2>
              <p className="text-muted-foreground mb-8">
                Suscríbete a nuestro boletín semanal y recibe recomendaciones personalizadas de eventos según tus
                intereses. Te enviaremos solo lo que realmente te importa.
              </p>
              <NewsletterForm />
              <p className="text-xs text-muted-foreground mt-4">
                Respetamos tu privacidad. Puedes darte de baja en cualquier momento.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
