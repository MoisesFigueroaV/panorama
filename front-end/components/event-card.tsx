import { Calendar, MapPin, Share2, Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface EventCardProps {
  event: {
    id_evento: number
    titulo: string
    fecha_inicio: string
    fecha_fin: string
    ubicacion: string | null
    imagen: string | null
    nombre_categoria: string | null
    descripcion: string | null
    nombre_organizacion: string | null
    logo_organizacion: string | null
  }
}

export default function EventCard({ event }: EventCardProps) {
  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Formatear hora
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col group hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-black/5">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={event.imagen || "/placeholder.svg"}
          alt={event.titulo}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-secondary/50 to-transparent"></div>
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
            {event.nombre_categoria || "Evento"}
          </Badge>
        </div>
        <div className="absolute top-2 right-2 flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110 bg-highlight text-secondary"
                >
                  <Heart className="h-4 w-4" />
                  <span className="sr-only">Guardar evento</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Guardar evento</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110 bg-highlight text-secondary"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Compartir evento</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Compartir evento</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <CardHeader className="p-4 pb-0">
        <h3 className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors">{event.titulo}</h3>
      </CardHeader>
      <CardContent className="p-4 pt-2 flex-grow">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Calendar className="h-4 w-4 flex-shrink-0 text-accent" />
          <span className="text-sm">
            {formatDate(event.fecha_inicio)} • {formatTime(event.fecha_inicio)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground mb-3">
          <MapPin className="h-4 w-4 flex-shrink-0 text-accent" />
          <span className="text-sm">{event.ubicacion || "Ubicación por confirmar"}</span>
        </div>
        {event.nombre_organizacion && (
          <div className="flex items-center gap-2 mb-3">
            {event.logo_organizacion && (
              <Image
                src={event.logo_organizacion}
                alt={event.nombre_organizacion}
                width={16}
                height={16}
                className="rounded-full"
              />
            )}
            <span className="text-xs text-muted-foreground">{event.nombre_organizacion}</span>
          </div>
        )}
        <p className="text-muted-foreground text-sm line-clamp-2">{event.descripcion || "Sin descripción disponible"}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/events/${event.id_evento}`} className="w-full">
          <Button
            variant="outline"
            className="w-full transition-transform duration-300 hover:scale-[1.02] border-gray-200 text-highlight hover:bg-highlight hover:text-secondary"
          >
            Ver detalles
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
