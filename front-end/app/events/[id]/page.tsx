"use client"

import { use } from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin, Share2, Heart, ArrowLeft, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
// import EventMap from "@/components/event-map" // Deshabilitado temporalmente
import { useEventoById, useEventosDestacados } from "@/lib/hooks/usePublicData"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface EventPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EventPage({ params }: EventPageProps) {
  const { id } = use(params)
  const eventoId = parseInt(id)
  const { evento, loading, error } = useEventoById(eventoId)
  const { eventos: eventosRelacionados } = useEventosDestacados(3)

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
  const horaInicio = format(fechaInicio, "HH:mm")
  const horaFin = format(fechaFin, "HH:mm")

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
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                <ExternalLink className="h-4 w-4 mr-2" />
                Comprar entradas
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-[#f9a05d] border-[#f9a05d] hover:bg-[#f9a05d]/10 font-medium"
              >
                <Heart className="h-4 w-4 mr-2" />
                Guardar evento
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-[#f9a05d] border-[#f9a05d] hover:bg-[#f9a05d]/10 font-medium"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 z-0">
          <Image 
            src={evento.imagen || "/placeholder.svg"} 
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

              {/* Mapa deshabilitado temporalmente */}
              {/*
              <div>
                <h2 className="text-2xl font-bold mb-4">Ubicación</h2>
                <div className="h-[400px] rounded-lg overflow-hidden border">
                  <EventMap events={[evento]} />
                </div>
              </div>
              */}
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
                <Button className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Comprar entradas
                </Button>
                <Button variant="outline" className="w-full">
                  <Heart className="h-4 w-4 mr-2" />
                  Guardar evento
                </Button>
                <Button variant="outline" className="w-full">
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
