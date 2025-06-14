"use client"

// Create this file for the admin event card component
import { Calendar, MapPin, Check, X, Flag, Star, Eye } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface Event {
  id: string
  title: string
  category: string
  date: string
  time: string
  location: string
  image?: string
}

interface AdminEventCardProps {
  event: Event
  status: "pending" | "reported" | "featured"
}

export function AdminEventCard({ event, status }: AdminEventCardProps) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative aspect-[16/9] w-full">
        <Image 
          src={event.image || "/placeholder.svg"} 
          alt={event.title} 
          fill 
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={status === "pending" || status === "reported"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-2 left-2 z-10">
          <Badge
            className={`category-badge-${
              event.category.toLowerCase() === "música"
                ? "music"
                : event.category.toLowerCase() === "deportes"
                  ? "sports"
                  : event.category.toLowerCase() === "gastronomía"
                    ? "food"
                    : event.category.toLowerCase() === "arte y cultura"
                      ? "art"
                      : event.category.toLowerCase() === "tecnología"
                        ? "tech"
                        : "outdoor"
            }`}
          >
            {event.category}
          </Badge>
        </div>
        {status === "pending" && (
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="outline" className="bg-yellow-500/20 text-yellow-600 border-yellow-500">
              Pendiente
            </Badge>
          </div>
        )}
        {status === "reported" && (
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="outline" className="bg-red-500/20 text-red-600 border-red-500">
              Reportado
            </Badge>
          </div>
        )}
        {status === "featured" && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-primary text-white">Destacado</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4 flex-grow">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{event.title}</h3>
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Calendar className="h-4 w-4 text-accent flex-shrink-0" />
          <span className="text-sm truncate">
            {event.date} • {event.time}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground mb-3">
          <MapPin className="h-4 w-4 text-accent flex-shrink-0" />
          <span className="text-sm truncate">{event.location}</span>
        </div>

        {status === "reported" && (
          <div className="mt-2 p-2 bg-red-50 rounded-md border border-red-200 text-sm text-red-700">
            <div className="flex items-start gap-2">
              <Flag className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Motivo del reporte:</p>
                <p className="line-clamp-2">Contenido inapropiado o engañoso</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
        <div className="flex flex-wrap gap-2 flex-1">
          {status === "pending" && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-green-600 border-green-600 hover:bg-green-50 flex-1 sm:flex-none"
              >
                <Check className="h-3 w-3" />
                Aprobar
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 gap-1 text-red-600 border-red-600 hover:bg-red-50 flex-1 sm:flex-none"
              >
                <X className="h-3 w-3" />
                Rechazar
              </Button>
            </>
          )}
          {status === "reported" && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-green-600 border-green-600 hover:bg-green-50 flex-1 sm:flex-none"
              >
                <Check className="h-3 w-3" />
                Aprobar
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 gap-1 text-red-600 border-red-600 hover:bg-red-50 flex-1 sm:flex-none"
              >
                <X className="h-3 w-3" />
                Eliminar
              </Button>
            </>
          )}
          {status === "featured" && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1 flex-1 sm:flex-none"
            >
              <Star className="h-3 w-3" />
              Quitar destacado
            </Button>
          )}
        </div>
        <Link href={`/events/${event.id}`} className="w-full sm:w-auto">
          <Button size="sm" className="w-full gap-1">
            <Eye className="h-3 w-3" />
            Ver evento
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
