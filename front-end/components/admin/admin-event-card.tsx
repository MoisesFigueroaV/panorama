"use client"

// Create this file for the admin event card component
import { Calendar, MapPin, Check, X, Flag, Star, Eye, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { api } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { useState } from "react"
import { shouldUseLocalData } from '@/lib/hooks/useLocalData'

interface AdminEvent {
  id_evento: number
  titulo: string
  descripcion: string | null
  fecha_inicio: string
  fecha_fin: string
  ubicacion: string | null
  imagen: string | null
  capacidad: number
  id_estado_evento: number | null
  nombre_organizacion: string | null
  nombre_categoria: string | null
  nombre_estado: string | null
  imagen_portada?: string | null;
  imagen_evento?: string | null;
  categoria_evento?: { nombre_categoria: string | null };
}

interface AdminEventCardProps {
  event: AdminEvent
  onStatusChange?: () => void
}

function getStatusBadge(estadoId: number | null, nombreEstado: string | null) {
  if (!estadoId) return <Badge variant="secondary">Sin estado</Badge>
  
  if (estadoId === 2) {
    return <Badge className="bg-green-500 text-white font-semibold">Publicado</Badge>;
  }
  if (estadoId === 1) {
    return <Badge className="bg-yellow-400 text-black font-semibold">Pendiente</Badge>;
  }
  if (estadoId === 3) {
    return <Badge className="bg-red-500 text-white font-semibold">Cancelado</Badge>;
  }
  if (estadoId === 4) {
    return <Badge variant="outline">Finalizado</Badge>;
  }
  return <Badge variant="secondary">{nombreEstado || "Desconocido"}</Badge>;
}

function getCategoryBadge(nombreCategoria: string | null) {
  if (!nombreCategoria) return <Badge variant="outline">Sin categoría</Badge>
  
  return <Badge variant="outline">{nombreCategoria}</Badge>
}

export function AdminEventCard({ event, onStatusChange }: AdminEventCardProps) {
  const { accessToken } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleStatusChange = async (newStatus: number) => {
    setIsUpdating(true)
    try {
      if (shouldUseLocalData()) {
        // Modo local: actualizar en localStorage
        const { localDataManager } = await import('@/lib/localStorage/localDataManager');
        await localDataManager.updateEvento(event.id_evento, { id_estado_evento: newStatus });
      } else {
        if (!accessToken) {
          toast.error("No tienes acceso")
          return
        }
        await api.eventos.updateStatus(event.id_evento, newStatus, accessToken)
      }
      const statusLabels = {
        1: "Borrador",
        2: "Publicado", 
        3: "Cancelado",
        4: "Finalizado"
      }
      toast.success(`Evento cambiado a ${statusLabels[newStatus as keyof typeof statusLabels]}`)
      // Llamar callback para refrescar la lista
      if (onStatusChange) {
        onStatusChange()
      }
    } catch (error: any) {
      console.error("Error al cambiar estado:", error)
      toast.error(error.message || "Error al cambiar el estado del evento")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleReject = async () => {
    setIsUpdating(true)
    try {
      if (shouldUseLocalData()) {
        const { localDataManager } = await import('@/lib/localStorage/localDataManager');
        await localDataManager.deleteEvento(event.id_evento);
        toast.success('Evento rechazado y eliminado');
        if (onStatusChange) onStatusChange();
      } else {
        toast.info('Funcionalidad de rechazo solo disponible en modo local');
      }
    } catch (error: any) {
      console.error('Error al rechazar/eliminar evento:', error);
      toast.error(error.message || 'Error al rechazar el evento');
    } finally {
      setIsUpdating(false)
    }
  }

  console.log('🖼️ [ADMIN] IMAGEN DEL EVENTO:', event.imagen)

  // Lógica igual que en EventCard de la home
  const imgSrc = event.imagen || "/placeholder.svg";

  // Compatibilidad con mocks: buscar categoría en varias propiedades
  const categoria = event.nombre_categoria || event.categoria_evento?.nombre_categoria || 'Sin categoría';

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative overflow-hidden rounded-lg bg-[#FFB86B]/20">
        <Image
          src={imgSrc}
          alt={event.titulo}
          fill
          className="object-cover rounded-lg"
        />
        <div className="absolute top-2 left-2 flex gap-1">
          {getStatusBadge(event.id_estado_evento, event.nombre_estado)}
          <Badge variant="outline">{categoria}</Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">
            {event.titulo}
          </h3>
          
          {event.descripcion && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {event.descripcion}
            </p>
          )}

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(event.fecha_inicio)} - {formatDate(event.fecha_fin)}</span>
          </div>

          {event.ubicacion && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">{event.ubicacion}</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>Capacidad: {event.capacidad}</span>
          </div>

          {event.nombre_organizacion && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Organizador:</span> {event.nombre_organizacion}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
        <div className="flex flex-wrap gap-2 flex-1">
          {event.id_estado_evento === 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-green-600 border-green-600 hover:bg-green-50 flex-1 sm:flex-none"
                onClick={() => handleStatusChange(2)}
                disabled={isUpdating}
              >
                <Check className="h-3 w-3" />
                Aprobar
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 gap-1 text-red-600 border-red-600 hover:bg-red-50 flex-1 sm:flex-none"
                onClick={handleReject}
                disabled={isUpdating}
              >
                <X className="h-3 w-3" />
                Rechazar
              </Button>
            </>
          )}
          {event.id_estado_evento === 2 && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 gap-1 flex-1 sm:flex-none"
                onClick={() => handleStatusChange(1)}
                disabled={isUpdating}
              >
                <Star className="h-3 w-3" />
                Volver a borrador
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 gap-1 text-red-600 border-red-600 hover:bg-red-50 flex-1 sm:flex-none"
                onClick={() => handleStatusChange(3)}
                disabled={isUpdating}
              >
                <X className="h-3 w-3" />
                Cancelar
              </Button>
            </>
          )}
          {event.id_estado_evento === 3 && (
            <span className="text-red-600 font-semibold">Este evento está cancelado.</span>
          )}
        </div>
        <Link href={`/events/${event.id_evento}`} passHref legacyBehavior>
          <Button variant="destructive" className="w-full mt-2">
            Ver evento
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
