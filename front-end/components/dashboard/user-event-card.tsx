// Create this file for the user event card component
import { Calendar, MapPin, ExternalLink, Heart, Share2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface UserEventCardProps {
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
  type: "upcoming" | "saved" | "past"
}

export function UserEventCard({ event, type }: UserEventCardProps) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-48">
        <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
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
        {type === "upcoming" && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-primary text-white">
              Próximo
            </Badge>
          </div>
        )}
        {type === "past" && (
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-muted/50 backdrop-blur-sm">
              Pasado
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
        <p className="text-muted-foreground text-sm line-clamp-2">{event.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
            <Heart className="h-4 w-4" />
            <span className="sr-only">Guardar</span>
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
            <Share2 className="h-4 w-4" />
            <span className="sr-only">Compartir</span>
          </Button>
        </div>
        <Link href={`/events/${event.id}`}>
          <Button size="sm" className="gap-1">
            <ExternalLink className="h-3 w-3" />
            Ver detalles
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
