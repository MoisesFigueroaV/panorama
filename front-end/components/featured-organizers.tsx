import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function FeaturedOrganizers() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {organizers.map((organizer) => (
        <Card
          key={organizer.id}
          className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden border-black/5"
        >
          <div className="relative h-40">
            <Image
              src={organizer.coverImage || "/placeholder.svg"}
              alt={organizer.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

            {/* Etiqueta de verificado en la esquina superior derecha */}
            {organizer.verified && (
              <div className="absolute top-3 right-3 z-30">
                <Badge className="bg-[#a3d7e0] text-white h-6 font-medium shadow-sm">Verificado</Badge>
              </div>
            )}

            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-50 flex-shrink-0">
                  <Image
                    src={organizer.logo || "/placeholder.svg"}
                    alt={organizer.name}
                    width={40}
                    height={40}
                    className="object-cover"
                    style={{ backgroundColor: getOrganizerColor(organizer.id) }}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-white text-sm truncate">{organizer.name}</h3>
                  <p className="text-xs text-white/80">{organizer.eventsCount} eventos</p>
                </div>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-4">{organizer.description}</p>
            <div className="flex justify-between items-center">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border border-white flex items-center justify-center text-xs"
                    style={{
                      backgroundColor: i === 1 ? "#f47c6c" : i === 2 ? "#f9a05d" : "#a3d7e0",
                      color: "white",
                    }}
                  >
                    {i}
                  </div>
                ))}
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                  +{organizer.followersCount}
                </div>
              </div>
              <Link href={`/organizers/${organizer.id}`}>
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  Ver perfil
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Actualizar los colores de los organizadores
function getOrganizerColor(id: string) {
  const colors = ["#f47c6c", "#f9a05d", "#a3d7e0", "#f1c84b"]
  const colorIndex = Number.parseInt(id) % colors.length
  return colors[colorIndex]
}

const organizers = [
  {
    id: "1",
    name: "Eventos Santiago",
    description: "Organizadores de los mejores conciertos y festivales de música en Santiago.",
    eventsCount: 42,
    followersCount: 1.2,
    verified: true,
    logo: "/placeholder.svg?height=48&width=48&text=ES",
    coverImage: "/placeholder.svg?height=160&width=320&text=Eventos+Santiago",
  },
  {
    id: "2",
    name: "Cultura Viva",
    description: "Promovemos el arte y la cultura a través de exposiciones, talleres y conferencias.",
    eventsCount: 36,
    followersCount: 0.8,
    verified: true,
    logo: "/placeholder.svg?height=48&width=48&text=CV",
    coverImage: "/placeholder.svg?height=160&width=320&text=Cultura+Viva",
  },
  {
    id: "3",
    name: "Deportes Activos",
    description: "Organizamos competencias deportivas, maratones y eventos al aire libre para toda la familia.",
    eventsCount: 28,
    followersCount: 0.5,
    verified: false,
    logo: "/placeholder.svg?height=48&width=48&text=DA",
    coverImage: "/placeholder.svg?height=160&width=320&text=Deportes+Activos",
  },
]
