import Link from "next/link"
import { Calendar, MapPin, Heart, Share2  } from "lucide-react";
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { EventoDestacado } from "@/lib/hooks/usePublicData"
import EstadoEventoBadge from './estado-evento-badge'
import { cn } from "@/lib/utils"
import { useSavedEvents } from "@/context/SavedEventsContext"
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext"; 
import { useRouter } from "next/navigation";  
import { toast } from "sonner";                

interface EventCardProps {
  event: EventoDestacado;
  }

export default function EventCard({ event }: EventCardProps) {
  console.log('🔍 EventCard recibió evento:', {
    titulo: event.titulo,
    nombre_categoria: event.nombre_categoria,
    en_curso: event.en_curso,
    proximo: event.proximo,
    ya_realizado: event.ya_realizado
  });
  
  const { isAuthenticated } = useAuth();
  const router = useRouter();           
  const { addSavedEvent, removeSavedEvent, isEventSaved } = useSavedEvents()
  const isSaved = isAuthenticated && isEventSaved(event.id_evento);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAuthenticated) {
      if (isSaved) {
        removeSavedEvent(event.id_evento);
      } else {
        const eventToSave = { ...event };
        addSavedEvent(eventToSave);
      }
    } else {
      toast.info("Debes iniciar sesión para guardar eventos.");
      router.push('/login');
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const eventUrl = `${window.location.origin}/events/${event.id_evento}`;
    
    try {
      await navigator.clipboard.writeText(eventUrl);
      toast.success("¡Enlace del evento copiado!");
    } catch (err) {
      toast.error("No se pudo copiar el enlace.");
      console.error('Error al copiar al portapapeles:', err);
    }}


  // ... (la función formatDate y formatTime se mantienen igual)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

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
            <Badge className="flex items-center justify-center px-5 py-0.5 rounded-full text-xs font-semibold">{event.nombre_categoria || 'Sin categoría'}</Badge>
            <EstadoEventoBadge en_curso={event.en_curso} proximo={event.proximo} ya_realizado={event.ya_realizado} />
          </div>
          <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                          onClick={handleSaveToggle}
                        >
                          <Heart className={cn( "h-4 w-4", isSaved ? "text-red-500 fill-red-500" : "text-muted-foreground" )} />
                          <span className="sr-only">Guardar evento</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{ isAuthenticated ? (isSaved ? 'Eliminar de guardados' : 'Guardar evento') : 'Inicia sesión para guardar' }</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 text-muted-foreground" />
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
              : "Fecha no disponible"}
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
