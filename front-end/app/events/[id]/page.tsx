"use client"

import { use } from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin, Share2, Heart, ArrowLeft, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import dynamic from "next/dynamic"
import { useEventoById, useEventosDestacados } from "@/lib/hooks/usePublicData"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useAuth } from "@/context/AuthContext"
import { useSavedEvents } from "@/context/SavedEventsContext"
import { useRouter } from "next/navigation"
import { toast } from 'sonner';

interface EventPageProps {
  params: Promise<{
    id: string
  }>
}

const EventMap = dynamic(() => import("@/components/event-map-picker"), { ssr: false })

export default function EventPage({ params }: EventPageProps) {
  const { id } = use(params)
  const eventoId = parseInt(id)
  const { evento, loading, error } = useEventoById(eventoId)
  const { eventos: eventosRelacionados } = useEventosDestacados(3)

  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { addSavedEvent, removeSavedEvent, isEventSaved } = useSavedEvents()
  const isSaved = isAuthenticated && evento ? isEventSaved(evento.id_evento) : false;

  const handleShare = async () => {
    const currentUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast.success("¡Enlace del evento copiado al portapapeles!");
    } catch (err) {
      toast.error("No se pudo copiar el enlace.");
      console.error('Error al copiar la URL:', err);
    }
  };

  const handleSaveToggle = () => {
    if (!isAuthenticated) {
      toast.info("Debes iniciar sesión para guardar eventos.");
      router.push('/login');
      return;
    }
    
    if (evento) {
      if (isSaved) {
        removeSavedEvent(evento.id_evento);
      } else {
        addSavedEvent(evento);
      }
    }
  };

  
  if (loading) {
    return (
      <main className="min-h-screen pb-16">
        <div className="container py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Cargando evento...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !evento) {
    return (
      <main className="min-h-screen pb-16">
        <div className="container py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                {error || 'Evento no encontrado'}
              </p>
              <Link href="/events">
                <Button>Volver a eventos</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Formatear fechas
  const fechaInicio = new Date(evento.fecha_inicio)
  const fechaFin = new Date(evento.fecha_fin)
  const fechaFormateada = format(fechaInicio, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
  const horaInicio = evento.hora_inicio || "09:00"
  const horaFin = evento.hora_fin || "18:00"

  console.log('🖼️ [DETALLE] IMAGEN DEL EVENTO:', evento.imagen)

  // Handler para copiar la URL y mostrar alerta
  const handleCopyUrl = async () => {
    try {
      const url = `${window.location.origin}/events/${id}`
      await navigator.clipboard.writeText(url)
      toast.success("¡Enlace copiado al portapapeles!")
    } catch {
      toast.error("No se pudo copiar el enlace")
    }
  }

  return (
    <main className="min-h-screen pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/90 to-primary h-[400px] flex items-center">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div className="container relative z-20">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 bg-black/20 backdrop-blur-sm px-3 py-2 rounded-full transition-all hover:bg-black/30"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a eventos</span>
          </Link>

          <div className="max-w-3xl text-white">
            <Badge className="mb-4">{evento.nombre_categoria}</Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{evento.titulo}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>
                  {fechaFormateada} • {horaInicio} - {horaFin}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{evento.ubicacion || 'Ubicación por confirmar'}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              {/*
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                <ExternalLink className="h-4 w-4 mr-2" />
                Comprar entradas
              </Button>
              */} 
              <Button
                size="lg"
                variant="outline"
                className="text-[#f9a05d] border-[#f9a05d] hover:bg-[#f9a05d]/10 font-medium"
                onClick={handleSaveToggle}
              >
                <Heart className="h-4 w-4 mr-2" />
                Guardar evento
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-[#f9a05d] border-[#f9a05d] hover:bg-[#f9a05d]/10 font-medium"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 z-0">
          <Image 
            src={evento.imagen && evento.imagen !== "" ? evento.imagen : "https://via.placeholder.com/800x450?text=Evento"} 
            alt={evento.titulo} 
            fill 
            className="object-cover" 
            priority 
          />
        </div>
      </section>

      {/* Event Details */}
      <section className="container py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">Descripción</h2>
                <p className="text-muted-foreground">{evento.descripcion || 'Descripción no disponible'}</p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Ubicación</h2>
                <div className="h-[400px] rounded-lg overflow-hidden border">
                  <EventMap 
                    latitud={evento.latitud ?? null} 
                    longitud={evento.longitud ?? null} 
                    onChange={() => {}} // Solo visualización
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-card rounded-lg border p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-4">Información del evento</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-medium mb-1">Fecha y hora</h3>
                  <p className="text-muted-foreground">{fechaFormateada}</p>
                  <p className="text-muted-foreground">{horaInicio} - {horaFin}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Ubicación</h3>
                  <p className="text-muted-foreground">{evento.ubicacion || 'Por confirmar'}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Organizador</h3>
                  <p className="text-muted-foreground">{evento.nombre_organizacion || 'Organizador no especificado'}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Categoría</h3>
                  <Badge>{evento.nombre_categoria}</Badge>
                </div>

                {evento.capacidad && (
                  <div>
                    <h3 className="font-medium mb-1">Capacidad</h3>
                    <p className="text-muted-foreground">{evento.capacidad} personas</p>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                {/*<Button className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Comprar entradas
                </Button>*/}
                <Button variant="outline" className="w-full" onClick={handleSaveToggle}>
                  <Heart className="h-4 w-4 mr-2" />
                  {isSaved ? 'Guardado' : 'Guardar evento'}
                </Button>
                <Button variant="outline" className="w-full" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Events */}
      {eventosRelacionados && eventosRelacionados.length > 0 && (
        <section className="container py-12">
          <h2 className="text-2xl font-bold mb-6">Eventos relacionados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventosRelacionados
              .filter(relatedEvent => relatedEvent.id_evento !== evento.id_evento)
              .slice(0, 3)
              .map((relatedEvent) => (
                <Link key={relatedEvent.id_evento} href={`/events/${relatedEvent.id_evento}`} className="group">
                  <div className="bg-card rounded-lg border overflow-hidden h-full flex flex-col transition-shadow hover:shadow-md">
                    <div className="relative h-48">
                      <Image
                        src={relatedEvent.imagen || "/placeholder.svg"}
                        alt={relatedEvent.titulo}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge>{relatedEvent.nombre_categoria}</Badge>
                      </div>
                    </div>
                    <div className="p-4 flex-grow">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {relatedEvent.titulo}
                      </h3>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                          {format(new Date(relatedEvent.fecha_inicio), "dd/MM/yyyy", { locale: es })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{relatedEvent.ubicacion || 'Ubicación por confirmar'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      )}
    </main>
  )
}
