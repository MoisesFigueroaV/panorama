import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin, Share2, Heart, ArrowLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import EventMap from "@/components/event-map"
import { events } from "@/lib/mock-data"

interface EventPageProps {
  params: {
    id: string
  }
}

export default function EventPage({ params }: EventPageProps) {
  // Find the event by ID
  const event = events.find((e) => e.id === params.id) || events[0]

  // Related events (excluding current event)
  const relatedEvents = events.filter((e) => e.id !== event.id).slice(0, 3)

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
            <Badge className="mb-4">{event.category}</Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{event.title}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>
                  {event.date} • {event.time}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{event.location}</span>
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
          <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" priority />
        </div>
      </section>

      {/* Event Details */}
      <section className="container py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">Descripción</h2>
                <p className="text-muted-foreground">{event.description}</p>
                <p className="text-muted-foreground mt-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl
                  nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies lacinia, nisl
                  nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.
                </p>
                <p className="text-muted-foreground mt-4">
                  Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl
                  nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Ubicación</h2>
                <div className="h-[400px] rounded-lg overflow-hidden border">
                  <EventMap events={[event]} />
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
                  <p className="text-muted-foreground">{event.date}</p>
                  <p className="text-muted-foreground">{event.time}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Ubicación</h3>
                  <p className="text-muted-foreground">{event.location}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Organizador</h3>
                  <p className="text-muted-foreground">Eventos Santiago</p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Categoría</h3>
                  <Badge>{event.category}</Badge>
                </div>
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
      <section className="container py-12">
        <h2 className="text-2xl font-bold mb-6">Eventos relacionados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedEvents.map((relatedEvent) => (
            <Link key={relatedEvent.id} href={`/events/${relatedEvent.id}`} className="group">
              <div className="bg-card rounded-lg border overflow-hidden h-full flex flex-col transition-shadow hover:shadow-md">
                <div className="relative h-48">
                  <Image
                    src={relatedEvent.image || "/placeholder.svg"}
                    alt={relatedEvent.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge>{relatedEvent.category}</Badge>
                  </div>
                </div>
                <div className="p-4 flex-grow">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {relatedEvent.title}
                  </h3>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{relatedEvent.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{relatedEvent.location}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
