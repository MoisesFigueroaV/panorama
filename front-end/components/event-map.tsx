"use client"

// Componente EventMap temporalmente deshabilitado para evitar errores de SSR con Leaflet
// import { useState, useEffect } from "react"
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
// import "leaflet/dist/leaflet.css"
// import { Button } from "@/components/ui/button"
// import { Calendar, MapPin } from "lucide-react"
// import Link from "next/link"
// import { Badge } from "@/components/ui/badge"

// // Fix for Leaflet marker icons in Next.js
// import L from "leaflet"
// import { useMobile } from "@/hooks/use-mobile"

// // Fix Leaflet default icon issue
// const icon = L.icon({
//   iconUrl: "/marker-icon.png",
//   shadowUrl: "/marker-shadow.png",
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
//   shadowSize: [41, 41],
// })

interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  image: string
  category: string
  description: string
  coordinates: [number, number]
}

interface EventMapProps {
  events: Event[]
}

export default function EventMap({ events }: EventMapProps) {
  return (
    <div className="h-full bg-muted flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground mb-2">Mapa temporalmente deshabilitado</p>
        <p className="text-sm text-muted-foreground">Próximamente disponible</p>
      </div>
    </div>
  )

  // Código original comentado:
  /*
  const [mounted, setMounted] = useState(false)
  const isMobile = useMobile()

  useEffect(() => {
    setMounted(true)

    // Create marker icon images for client-side rendering
    const markerIcon = document.createElement("img")
    markerIcon.src = "/marker-icon.png"
    const markerShadow = document.createElement("img")
    markerShadow.src = "/marker-shadow.png"
  }, [])

  if (!mounted) return <div className="h-full bg-muted flex items-center justify-center">Cargando mapa...</div>

  // Santiago, Chile coordinates as default center
  const defaultCenter: [number, number] = [-33.4489, -70.6693]

  return (
    <MapContainer center={defaultCenter} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {events.map((event) => (
        <Marker key={event.id} position={event.coordinates} icon={icon}>
          <Popup className="leaflet-popup" minWidth={isMobile ? 200 : 300} maxWidth={isMobile ? 250 : 350}>
            <div className="p-1">
              <div className="mb-2">
                <Badge className="mb-2">{event.category}</Badge>
                <h3 className="font-semibold text-base">{event.title}</h3>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1 text-xs">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span>
                  {event.date} • {event.time}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground mb-3 text-xs">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span>{event.location}</span>
              </div>
              <Link href={`/events/${event.id}`} className="w-full">
                <Button size="sm" className="w-full">
                  Ver detalles
                </Button>
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
  */
}
