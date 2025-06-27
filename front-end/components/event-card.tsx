import Link from "next/link"
import { Calendar, MapPin, Share2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { EventoDestacado } from "@/lib/hooks/usePublicData"
import { toast } from "sonner"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface EventCardProps {
  event: EventoDestacado;
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

  // Log para depuración
  console.log('🖼️ IMAGEN DEL EVENTO:', event.imagen)
  
  // Handler para copiar la URL y mostrar alerta
  const handleCopyUrl = async () => {
    try {
      const url = `${window.location.origin}/events/${event.id_evento}`
      await navigator.clipboard.writeText(url)
      toast.success("¡Enlace copiado al portapapeles!")
    } catch {
      toast.error("No se pudo copiar el enlace")
    }
  }

  return (
    <Card className="overflow-visible h-full flex flex-col group hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-black/5">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={event.imagen || '/placeholder.svg'}
          alt={event.titulo}
          fill
          className="object-cover"
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
        
        {/* Badge de estado del evento */}
        {(event.ya_realizado || event.proximo || event.en_curso) && (
          <div className="absolute top-2 left-2 mt-8">
            <Badge
              variant={event.ya_realizado ? "secondary" : event.en_curso ? "default" : "default"}
              className={`${
                event.ya_realizado 
                  ? "bg-gray-500 text-white" 
                  : event.en_curso 
                    ? "bg-green-500 text-white" 
                    : "bg-blue-500 text-white"
              }`}
            >
              {event.ya_realizado ? "Ya realizado" : event.en_curso ? "En curso" : "Próximo"}
            </Badge>
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-2">
          {/* <TooltipProvider>
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
          </TooltipProvider> */}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110 bg-highlight text-secondary"
                  onClick={handleCopyUrl}
                >
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Compartir evento</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="z-50">
                <p>Compartir evento</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
            {event.fecha_inicio && !isNaN(new Date(event.fecha_inicio).getTime())
              ? format(new Date(event.fecha_inicio), "dd/MM/yyyy", { locale: es })
              : "Fecha por confirmar"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{event.ubicacion || 'Ubicación por confirmar'}</span>
        </div>
      </div>
    </Card>
  )
}
