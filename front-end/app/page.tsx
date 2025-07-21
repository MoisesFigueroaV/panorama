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
  AlertCircle,
  Briefcase,
  Clapperboard,
  Drama,
} from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { events } from "@/lib/mock-data"
import MiniEventFilter from "@/components/mini-event-filter"
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { apiClient } from '@/lib/api/apiClient'

// Importar todos los componentes necesarios
import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import EventCard from "@/components/event-card"
import NewsletterForm from "@/components/newsletter-form"
import CalendarView from "@/components/calendar-view"
import PromotedEventsCarousel from "@/components/promoted-events-carousel"
import CategoryCard from "@/components/category-card"
import TestimonialCard from "@/components/testimonial-card"
import FeaturedOrganizers from "@/components/featured-organizers"
import { DynamicHeader } from "@/components/dynamic-header"
import { useEventosData, useOrganizadoresData, useCategoriasData } from '@/lib/hooks/useLocalData'
import CategoryCardWithCount from "@/components/category-card-with-count"
import { DataModeToggleCompact } from "@/components/ui/data-mode-toggle"

// Tipos
interface Event {
  id_evento: number;
  titulo: string;
  fecha_inicio: string;
  fecha_fin: string;
  hora_inicio: string;
  hora_fin: string;
  ubicacion: string | null;
  imagen: string | null;
  nombre_categoria: string | null;
  descripcion: string | null;
  latitud: number | null;
  longitud: number | null;
  nombre_organizacion: string;
  logo_organizacion: string | null;
  en_curso?: boolean;
  capacidad: number;
  ya_realizado: boolean;
  fecha_registro: string;
}

// Cargar el mapa dinámicamente solo del lado del cliente
const EventMap = dynamic(
  () => import('@/components/event-map'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full bg-gray-100 animate-pulse flex items-center justify-center">
        <p className="text-muted-foreground">Cargando mapa...</p>
      </div>
    )
  }
);

function getImageUrl(imagen: string | null): string {
  if (!imagen) return "/placeholder.svg";
  if (imagen.startsWith("http")) return imagen;
  if (imagen.startsWith("/")) return imagen; // Permitir rutas locales
  // Solo para rutas relativas de Supabase Storage
  return `https://<TU_SUPABASE_URL>/storage/v1/object/public/eventos-media/Imagenes/${imagen}`;
}

export default function Home() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { data: eventosAll = [] } = useEventosData();
  const { data: organizacionesAll = [] } = useOrganizadoresData();
  const { data: categoriasMock = [] } = useCategoriasData ? useCategoriasData() : { data: [] };
  const [usuariosAll, setUsuariosAll] = useState<any[]>([]);

  useEffect(() => {
    async function fetchUsuarios() {
      try {
        const mod = await import('@/mocks/usuarios.json');
        setUsuariosAll(mod.default || []);
      } catch {
        setUsuariosAll([]);
      }
    }
    fetchUsuarios();
  }, []);

  const eventosPublicados = Array.isArray(eventosAll)
    ? eventosAll.filter(ev => ev.estado_evento?.nombre_estado === 'Publicado' || ev.estado_evento?.nombre_estado === 'publicado').length
    : 0;
  const usuariosRegistrados = Array.isArray(usuariosAll) ? usuariosAll.length : 0;
  const totalOrganizaciones = Array.isArray(organizacionesAll) ? organizacionesAll.length : 0;
  const totalCiudades = 1;

  useEffect(() => {
    // Limpiar ubicación guardada al cargar la página
    localStorage.removeItem('userLocation');
    
    // Solicitar ubicación actual
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(newLocation);
          localStorage.setItem('userLocation', JSON.stringify(newLocation));
          setLocationError(null);
        },
        (error) => {
          let mensaje = "No pudimos obtener tu ubicación. Mostrando eventos en Concepción.";
          if (error && error.code !== undefined) {
            switch (error.code) {
              case 1:
                mensaje = "Permiso de ubicación denegado. Mostrando eventos en Concepción.";
                break;
              case 2:
                mensaje = "Ubicación no disponible. Mostrando eventos en Concepción.";
                break;
              case 3:
                mensaje = "La solicitud de ubicación expiró. Mostrando eventos en Concepción.";
                break;
            }
          }
          console.error("Error obteniendo ubicación:", error?.message || error);
          setLocationError(mensaje);
        },
        { enableHighAccuracy: true, maximumAge: 0 } // Forzar solicitud nueva cada vez
      );
    } else {
      setLocationError("Tu navegador no soporta geolocalización. Mostrando eventos en Concepción.");
    }
  }, []); // Se ejecuta solo al montar el componente

  useEffect(() => {
    async function fetchKpis() {
      try {
        const res = await apiClient.get('/admin/dashboard/kpis');
        const data = res.data;
        // setKpis({
        //   eventosActivos: data.eventosActivos,
        //   totalUsuarios: data.totalUsuarios,
        //   totalOrganizadores: data.totalOrganizadores,
        // });
      } catch (e) {
        // setKpis(null);
      } finally {
        // setLoadingKpis(false);
      }
    }
    fetchKpis();
  }, []);

  // Obtener datos reales
  const categoriasExtra = [
    { id_categoria: 6, nombre_categoria: 'Teatro' },
    { id_categoria: 7, nombre_categoria: 'Cine' },
    { id_categoria: 8, nombre_categoria: 'Negocios' },
  ];
  // Unir categorías del mock y extra, sin duplicados
  const categoriasArray = Array.isArray(categoriasMock) ? categoriasMock : [];
  const categorias = [
    ...categoriasArray,
    ...categoriasExtra.filter(cat => !categoriasArray.some((c: any) => c.id_categoria === cat.id_categoria))
  ];

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
  ];

  (eventosAll || []).forEach((e: any) => console.log('Evento:', e.titulo, 'Capacidad:', e.capacidad, 'Imagen:', e.imagen, 'Ya realizado:', e.ya_realizado));

  // Unificar lógica de destacados
  const eventosDestacadosBase = (eventosAll || [])
    .filter((event: Event) => event.capacidad >= 1000 && event.imagen && !event.ya_realizado)
    .sort((a: Event, b: Event) => new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime());

  const eventosCarrusel = eventosDestacadosBase.slice(0, 5).map((event: Event) => ({
    id: String(event.id_evento),
    title: event.titulo,
    date: event.fecha_inicio,
    time: event.hora_inicio,
    location: event.ubicacion || '',
    image: getImageUrl(event.imagen),
    category: event.nombre_categoria || '',
    description: event.descripcion || '',
    eventId: event.id_evento,
  }));

  const eventosDestacadosFila = eventosDestacadosBase.slice(0, 3);

  console.log('EVENTOS CARRUSEL:', eventosCarrusel);

  console.log('EVENTOS DESTACADOS DEL BACKEND:', eventosAll);

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
                <Link href="/events">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                    Explorar eventos
                  </Button>
                </Link>
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

        {/* Filtros dinámicos resumidos */}
        <section className="container py-12">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-primary">Busca eventos a tu medida</h2>
            <p className="text-muted-foreground">Filtra y descubre eventos según tus preferencias</p>
          </div>
          <MiniEventFilter />
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
              <h3 className="text-4xl font-bold text-primary mb-1">{eventosPublicados}</h3>
              <p className="text-muted-foreground font-medium">Eventos publicados</p>
            </div>
            <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl border border-accent/20 p-6 text-center hover:shadow-md transition-all duration-300">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Users className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-4xl font-bold text-accent mb-1">{usuariosRegistrados}</h3>
              <p className="text-muted-foreground font-medium">Usuarios registrados</p>
            </div>
            <div className="bg-gradient-to-br from-highlight/5 to-highlight/10 rounded-xl border border-highlight/20 p-6 text-center hover:shadow-md transition-all duration-300">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Building2 className="h-8 w-8 text-highlight" />
              </div>
              <h3 className="text-4xl font-bold text-highlight mb-1">{totalOrganizaciones}</h3>
              <p className="text-muted-foreground font-medium">Organizaciones</p>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-xl border border-accent/20 p-6 text-center hover:shadow-md transition-all duration-300">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Globe className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-4xl font-bold text-accent mb-1">{totalCiudades}</h3>
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
              Descubre los eventos más populares y promocionados de esta semana. No te pierdas estas experiencias únicas.
            </p>
          </div>
          {eventosCarrusel.length > 0 && (
            <PromotedEventsCarousel events={eventosCarrusel} />
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 mb-8">
            {eventosDestacadosFila.map((event: Event) => {
              const now = new Date();
              const fechaInicio = new Date(event.fecha_inicio);
              const fechaFin = new Date(event.fecha_fin);
              const proximo = fechaInicio > now;
              const en_curso = fechaInicio <= now && fechaFin >= now;
              const ya_realizado = fechaFin < now;
              // Extraer nombre_categoria correctamente
              const nombre_categoria = event.nombre_categoria ?? (event as any).categoria_evento?.nombre_categoria ?? 'Sin categoría';
              return (
                <EventCard
                  key={event.id_evento}
                  event={{
                    ...event,
                    proximo,
                    en_curso,
                    ya_realizado,
                    nombre_categoria,
                  }}
                />
              );
            })}
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
        <section className="container py-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-primary">Explora por categoría</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {categorias?.map((categoria) => {
              const nombre = categoria.nombre_categoria || 'Sin nombre';
                  const lowerName = nombre.toLowerCase();
              let id = 'other';
              let icon = <Calendar className="h-6 w-6" />;
              let color = '';
                  if (lowerName.includes('música') || lowerName.includes('musica')) {
                id = 'music'; icon = <Music className="h-6 w-6" />; color = '#f47c6c';
                  } else if (lowerName.includes('deporte')) {
                id = 'sports'; icon = <Trophy className="h-6 w-6" />; color = '#a3d7e0';
                  } else if (lowerName.includes('gastronomía') || lowerName.includes('gastronomia') || lowerName.includes('comida')) {
                id = 'food'; icon = <Calendar className="h-6 w-6" />; color = '#f9a05d';
                  } else if (lowerName.includes('arte') || lowerName.includes('cultura')) {
                id = 'art'; icon = <Palette className="h-6 w-6" />; color = '#f1c84b';
                  } else if (lowerName.includes('tecnología') || lowerName.includes('tecnologia')) {
                id = 'tech'; icon = <Code className="h-6 w-6" />; color = '#6366f1';
                  } else if (lowerName.includes('aire libre') || lowerName.includes('outdoor')) {
                id = 'outdoor'; icon = <TreePine className="h-6 w-6" />; color = '#22c55e';
                  } else if (lowerName.includes('educación') || lowerName.includes('educacion')) {
                id = 'education'; icon = <Calendar className="h-6 w-6" />; color = '#ef4444';
              } else if (lowerName.includes('teatro')) {
                id = 'theater'; icon = <Drama className="h-6 w-6" />; color = '#a21caf';
              } else if (lowerName.includes('cine')) {
                id = 'cinema'; icon = <Clapperboard className="h-6 w-6" />; color = '#1e293b';
              } else if (lowerName.includes('negocios')) {
                id = 'business'; icon = <Briefcase className="h-6 w-6" />; color = '#334155';
              }
                return (
                  <CategoryCardWithCount
                    key={categoria.id_categoria}
                  id={id}
                  name={nombre}
                    categoriaId={categoria.id_categoria}
                  icon={icon}
                  color={color}
                  />
                );
              })}
            </div>
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
        <section className="container py-8">
          <div className="mt-12">
            <h3 className="text-xl font-bold mb-6 text-primary">Explorar todos los eventos</h3>
          <Tabs defaultValue="list" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="list">Lista</TabsTrigger>
                <TabsTrigger value="map">Mapa</TabsTrigger>
                </TabsList>
            <TabsContent value="list" className="space-y-8">
                {/* Aquí iría el loading/error de eventos si se usa el hook remoto */}
                {/* Eliminar bloque de errorEventos */}
                  <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {eventosAll?.map((event: Event) => {
                         // Calcular proximo y en_curso si no existen
                         const now = new Date();
                         const fechaInicio = new Date(event.fecha_inicio);
                         const fechaFin = new Date(event.fecha_fin);
                         const proximo = (event as any).proximo !== undefined ? (event as any).proximo : (fechaInicio > now);
                         const en_curso = (event as any).en_curso !== undefined ? (event as any).en_curso : (fechaInicio <= now && fechaFin >= now);
                         const ya_realizado = (event as any).ya_realizado !== undefined ? (event as any).ya_realizado : (fechaFin < now);
                         return (
                           <EventCard key={event.id_evento} event={{ ...event, proximo, en_curso, ya_realizado }} />
                         );
                       })}
                </div>
                    <div className="flex justify-center mt-6">
                      <a href="/events" className="inline-block px-6 py-2 rounded bg-primary text-white font-semibold hover:bg-primary/90 transition">Ver más eventos</a>
              </div>
                  </>
                
            </TabsContent>
            <TabsContent value="map">
                {locationError && (
                  <div className="mb-4 p-4 bg-muted rounded-lg">
                    <p className="text-muted-foreground">{locationError}</p>
                </div>
                )}
                <EventMap 
                  center={userLocation || { lat: -36.82, lng: -73.05 }}
                  userLocation={userLocation}
                  events={eventosAll || []}
                />
            </TabsContent>
          </Tabs>
          </div>
        </section>

        {/* Featured Organizers */}
        <section className="container py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 text-primary">Organizadores destacados</h2>
            <p className="text-muted-foreground">Conoce a quienes crean los mejores eventos</p>
          </div>
          <FeaturedOrganizers 
            organizadores={(organizacionesAll || []).slice(0, 9)} 
            loading={false} 
          />
          {/* errorOrganizadores && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Error al cargar organizadores: {errorOrganizadores}</p>
            </div>
          ) */}
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
            {testimonials.map((testimonial: any, index: number) => (
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
        {/* <section className="container py-16">
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
        </section> */}
      </main>
      <SiteFooter />
    </div>
  )
}
