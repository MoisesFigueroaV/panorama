// Create this file for the organizer event card component
import { Calendar, MapPin, Edit, BarChart, Trash2, Eye } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface OrganizerEventCardProps {
  event: {
    id: string
    title: string
    date: string
    time: string
    location: string
    image: string
    category: string
    description: string
  }
  status: "active" | "draft" | "past"
}

export function OrganizerEventCard({ event, status }: OrganizerEventCardProps) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-48">
        <Image
          src={event.image || "/placeholder.svg"}
          alt={event.title}
          fill
          className={`object-cover ${status === "draft" ? "opacity-70" : ""}`}
        />
        <div className="absolute top-2 left-2">
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
        {status === "active" && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-500 text-white">Activo</Badge>
          </div>
        )}
        {status === "draft" && (
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-muted/50 backdrop-blur-sm">
              Borrador
            </Badge>
          </div>
        )}
        {status === "past" && (
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-muted/50 backdrop-blur-sm">
              Finalizado
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4 flex-grow">
        <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Calendar className="h-4 w-4 text-accent" />
          <span className="text-sm">
            {event.date} • {event.time}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground mb-3">
          <MapPin className="h-4 w-4 text-accent" />
          <span className="text-sm">{event.location}</span>
        </div>

        {status === "active" && (
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">125</span> tickets vendidos
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">$1,250</span> ingresos
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <div className="flex gap-2">
          {status === "active" && (
            <Link href={`/organizer/events/${event.id}/analytics`}>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <BarChart className="h-3 w-3" />
                <span className="sr-only md:inline-block">Analíticas</span>
              </Button>
            </Link>
          )}
          <Link href={`/organizer/events/${event.id}/edit`}>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Edit className="h-3 w-3" />
              <span className="sr-only md:inline-block">Editar</span>
            </Button>
          </Link>
          {status === "draft" && (
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Trash2 className="h-3 w-3" />
              <span className="sr-only md:inline-block">Eliminar</span>
            </Button>
          )}
        </div>
        <Link href={`/events/${event.id}`}>
          <Button size="sm" className="gap-1">
            <Eye className="h-3 w-3" />
            Ver evento
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
