"use client"

import { useState, useEffect, use } from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  ArrowLeft,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Globe,
  Share2,
  Mail,
  Heart,
} from "lucide-react"
import { events } from "@/lib/data"
// import EventCard from "@/components/event-card" // Comentado temporalmente por incompatibilidad de tipos
import { motion } from "framer-motion"

export default function OrganizerProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  // En un caso real, buscaríamos el organizador por su ID en la base de datos
  const organizer = organizers.find((org) => org.id === id) || organizers[0]

  // Estado para el filtro de eventos
  const [sortOrder, setSortOrder] = useState("newest")
  const [isFollowing, setIsFollowing] = useState(false)

  // Animación para la entrada de elementos
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  // Filtramos eventos que pertenecen a este organizador (simulado)
  // En un caso real, esto vendría de la base de datos
  const organizerEvents = events.slice(0, 5).sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    } else if (sortOrder === "oldest") {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    } else {
      return b.attendees - a.attendees
    }
  })

  // Efecto para el scroll
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-[#fdf1e8]/30">
      {/* Botón para volver atrás (posición fija) */}
      <div className="fixed bottom-8 left-8 z-[100]">
        <Button
          variant="default"
          size="sm"
          className="group flex items-center gap-1 bg-[#f47c6c] hover:bg-[#f47c6c]/90 text-white shadow-lg rounded-full px-4 py-6"
          asChild
        >
          <Link href="/events">
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">Volver</span>
          </Link>
        </Button>
      </div>

      {/* Portada con efecto parallax */}
      <div className="relative h-72 md:h-96 w-full overflow-hidden">
        <div className="absolute inset-0 bg-[#f47c6c]/10 z-10"></div>
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <Image
            src={organizer.coverImage || "/placeholder.svg?height=320&width=1920&text=Portada"}
            alt={`Portada de ${organizer.name}`}
            fill
            className="object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-20"></div>
        {/* Botón para volver atrás (parte superior izquierda) */}
        <div className="absolute top-4 left-4 z-30">
          <Button
            variant="ghost"
            size="sm"
            className="group flex items-center gap-1 bg-white/80 backdrop-blur-sm hover:bg-white text-[#f47c6c] rounded-full px-3 py-1 shadow-md border border-[#f47c6c]/10"
            asChild
          >
            <Link href="/events">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Volver</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Información del organizador */}
      <div className="container relative -mt-32 z-30">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-[#f47c6c]/10"
        >
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Logo y nombre */}
            <div className="flex flex-col items-center md:items-start">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-28 h-28 rounded-xl overflow-hidden border-4 border-white shadow-lg mb-4"
              >
                <Image
                  src={organizer.logo || "/placeholder.svg?height=112&width=112"}
                  alt={organizer.name}
                  width={112}
                  height={112}
                  className="object-cover"
                  style={{ backgroundColor: getOrganizerColor(organizer.id) }}
                />
              </motion.div>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-[#f47c6c]">{organizer.name}</h1>
                {organizer.verified && (
                  <Badge className="bg-[#a3d7e0] hover:bg-[#a3d7e0]/90 text-white transition-all">
                    <CheckCircle className="h-3 w-3 mr-1" /> Verificado
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-[#f9a05d]" />
                  <span>Desde 2023</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-[#f9a05d]" />
                  <span>Santiago, Chile</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-[#f9a05d]" />
                  <span>{organizer.followersCount}K seguidores</span>
                </div>
              </div>

              <p className="text-gray-700 mb-6">{organizer.description}</p>

              {/* Redes sociales */}
              <div className="flex flex-wrap gap-3 mb-6">
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  href={organizer.socialLinks?.facebook || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#f47c6c]/10 hover:bg-[#f47c6c]/20 p-2 rounded-full text-[#f47c6c] transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  href={organizer.socialLinks?.twitter || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#a3d7e0]/10 hover:bg-[#a3d7e0]/20 p-2 rounded-full text-[#a3d7e0] transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  href={organizer.socialLinks?.instagram || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#f9a05d]/10 hover:bg-[#f9a05d]/20 p-2 rounded-full text-[#f9a05d] transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  href={organizer.socialLinks?.linkedin || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#f1c84b]/10 hover:bg-[#f1c84b]/20 p-2 rounded-full text-[#f1c84b] transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  href={organizer.website || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-700 transition-colors"
                >
                  <Globe className="h-5 w-5" />
                </motion.a>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  className={`${isFollowing ? "bg-[#f47c6c]/20 text-[#f47c6c]" : "bg-[#f47c6c] text-white"} hover:bg-[#f47c6c]/90 transition-all`}
                  onClick={() => setIsFollowing(!isFollowing)}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isFollowing ? "fill-[#f47c6c]" : ""}`} />
                  {isFollowing ? "Siguiendo" : "Seguir"}
                </Button>
                <Button
                  variant="outline"
                  className="border-[#f47c6c] text-[#f47c6c] hover:bg-[#f47c6c]/10 transition-all"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contactar
                </Button>
                <Button variant="ghost" className="text-[#f47c6c] hover:bg-[#f47c6c]/10 transition-all">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Estadísticas */}
      <div className="container mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -5 }}
          >
            <Card className="p-6 bg-gradient-to-br from-[#f47c6c]/5 to-[#f47c6c]/10 border-[#f47c6c]/20 hover:shadow-md hover:border-[#f47c6c]/30 transition-all">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-[#f47c6c]">{organizer.eventsCount}</h3>
                <p className="text-muted-foreground">Eventos organizados</p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -5 }}
          >
            <Card className="p-6 bg-gradient-to-br from-[#f9a05d]/5 to-[#f9a05d]/10 border-[#f9a05d]/20 hover:shadow-md hover:border-[#f9a05d]/30 transition-all">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-[#f9a05d]">{organizer.followersCount}K</h3>
                <p className="text-muted-foreground">Seguidores</p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -5 }}
          >
            <Card className="p-6 bg-gradient-to-br from-[#a3d7e0]/5 to-[#a3d7e0]/10 border-[#a3d7e0]/20 hover:shadow-md hover:border-[#a3d7e0]/30 transition-all">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-[#a3d7e0]">4.8</h3>
                <p className="text-muted-foreground">Calificación promedio</p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Eventos del organizador */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="container py-12"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-2 text-[#f47c6c]">Eventos publicados</h2>
            <p className="text-muted-foreground">Descubre los eventos organizados por {organizer.name}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Select defaultValue="newest" onValueChange={(value) => setSortOrder(value)}>
              <SelectTrigger className="w-[180px] border-gray-100 bg-white hover:border-[#f47c6c]/30 transition-colors">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Más recientes</SelectItem>
                <SelectItem value="oldest">Más antiguos</SelectItem>
                <SelectItem value="popular">Más populares</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizerEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              {/* {<EventCard event={event} />} */}
            </motion.div>
          ))}
        </div>

        {organizerEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Este organizador aún no ha publicado eventos.</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// Función para asignar colores a los organizadores basados en su ID
function getOrganizerColor(id: string) {
  const colors = ["#f47c6c", "#f9a05d", "#a3d7e0", "#f1c84b"]
  const colorIndex = Number.parseInt(id) % colors.length
  return colors[colorIndex]
}

const organizers = [
  {
    id: "1",
    name: "Eventos Santiago",
    description:
      "Organizadores de los mejores conciertos y festivales de música en Santiago. Contamos con más de 5 años de experiencia creando experiencias inolvidables para todo tipo de público. Nuestro equipo está formado por profesionales apasionados por la música y el entretenimiento.",
    eventsCount: 42,
    followersCount: 1.2,
    verified: true,
    logo: "/placeholder.svg?height=48&width=48&text=ES",
    coverImage: "/placeholder.svg?height=160&width=320&text=Eventos+Santiago",
    socialLinks: {
      facebook: "https://facebook.com/eventossantiago",
      twitter: "https://twitter.com/eventossantiago",
      instagram: "https://instagram.com/eventossantiago",
      linkedin: "https://linkedin.com/company/eventossantiago",
    },
    website: "https://eventossantiago.cl",
  },
  {
    id: "2",
    name: "Cultura Viva",
    description:
      "Promovemos el arte y la cultura a través de exposiciones, talleres y conferencias. Nuestra misión es hacer accesible la cultura a todos los públicos y fomentar la creación artística local.",
    eventsCount: 36,
    followersCount: 0.8,
    verified: true,
    logo: "/placeholder.svg?height=48&width=48&text=CV",
    coverImage: "/placeholder.svg?height=160&width=320&text=Cultura+Viva",
    socialLinks: {
      facebook: "https://facebook.com/culturaviva",
      twitter: "https://twitter.com/culturaviva",
      instagram: "https://instagram.com/culturaviva",
      linkedin: "https://linkedin.com/company/culturaviva",
    },
    website: "https://culturaviva.cl",
  },
  {
    id: "3",
    name: "Deportes Activos",
    description:
      "Organizamos competencias deportivas, maratones y eventos al aire libre para toda la familia. Creemos en el poder del deporte para transformar vidas y comunidades.",
    eventsCount: 28,
    followersCount: 0.5,
    verified: false,
    logo: "/placeholder.svg?height=48&width=48&text=DA",
    coverImage: "/placeholder.svg?height=160&width=320&text=Deportes+Activos",
    socialLinks: {
      facebook: "https://facebook.com/deportesactivos",
      twitter: "https://twitter.com/deportesactivos",
      instagram: "https://instagram.com/deportesactivos",
      linkedin: "https://linkedin.com/company/deportesactivos",
    },
    website: "https://deportesactivos.cl",
  },
]
