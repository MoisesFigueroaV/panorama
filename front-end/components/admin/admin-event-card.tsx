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
}

interface AdminEventCardProps {
  event: AdminEvent
  onStatusChange?: () => void
}

function getStatusBadge(estadoId: number | null, nombreEstado: string | null) {
  if (!estadoId) return <Badge variant="secondary">Sin estado</Badge>
  
  const statusMap: Record<number, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
    1: { variant: "secondary", label: "Borrador" },
    2: { variant: "default", label: "Publicado" },
    3: { variant: "destructive", label: "Cancelado" },
    4: { variant: "outline", label: "Finalizado" }
  }
  
  const status = statusMap[estadoId] || { variant: "secondary" as const, label: nombreEstado || "Desconocido" }
  
  return <Badge variant={status.variant}>{status.label}</Badge>
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
    if (!accessToken) {
      toast.error("No tienes acceso")
      return
    }

    setIsUpdating(true)
    try {
      await api.eventos.updateStatus(event.id_evento, newStatus, accessToken)
      
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

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative overflow-hidden">
        {event.imagen ? (
          <Image
            src={event.imagen}
            alt={event.titulo}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <Calendar className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          {getStatusBadge(event.id_estado_evento, event.nombre_estado)}
          {getCategoryBadge(event.nombre_categoria)}
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
                onClick={() => handleStatusChange(3)}
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
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1 text-green-600 border-green-600 hover:bg-green-50 flex-1 sm:flex-none"
              onClick={() => handleStatusChange(2)}
              disabled={isUpdating}
            >
              <Check className="h-3 w-3" />
              Reactivar
            </Button>
          )}
        </div>
        <Link href={`/events/${event.id_evento}`} className="w-full sm:w-auto">
          <Button size="sm" className="w-full gap-1">
            <Eye className="h-3 w-3" />
            Ver evento
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
