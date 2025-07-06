import Link from "next/link"
import { Calendar, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { EventoDestacado } from "@/lib/hooks/usePublicData"
import EstadoEventoBadge from './estado-evento-badge'

interface EventCardProps {
  event: EventoDestacado;
  }

export default function EventCard({ event }: EventCardProps) {
  return (
    <Link href={`/events/${event.id_evento}`} className="group">
      <div className="bg-card rounded-lg border overflow-hidden h-full flex flex-col transition-shadow hover:shadow-md">
        <div className="relative h-48">
          <Image
            src={event.imagen || "/placeholder.svg"}
            alt={event.titulo}
            fill
            className="object-cover"
          />
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            <Badge className="flex items-center justify-center px-5 py-0.5 rounded-full text-xs font-semibold">{event.nombre_categoria}</Badge>
            <EstadoEventoBadge en_curso={event.en_curso} proximo={event.proximo} ya_realizado={event.ya_realizado} />
          </div>
        </div>
        <div className="p-4 flex-grow">
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
            {event.titulo}
          </h3>
          {event.descripcion && (
            <p className="text-muted-foreground text-sm mb-2 line-clamp-2">{event.descripcion}</p>
          )}
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">
              {format(new Date(event.fecha_inicio), "dd/MM/yyyy", { locale: es })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{event.ubicacion || 'Ubicación por confirmar'}</span>
          </div>
        </div>
            </div>
          </Link>
  )
}
