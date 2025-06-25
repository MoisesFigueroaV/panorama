"use client"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import L from "leaflet"
import { useMobile } from "@/hooks/use-mobile"
import type { EventoDestacado } from '@/lib/hooks/usePublicData'

// Fix default marker icon issue in Leaflet
if (typeof window !== 'undefined' && L.Icon.Default) {
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  });
}

// Icono personalizado para la ubicación del usuario
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Icono personalizado para eventos
const eventIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface EventMapProps {
  center?: { lat: number; lng: number };
  userLocation?: { lat: number; lng: number } | null;
  events: EventoDestacado[];
}

// Componente para actualizar el centro del mapa
function ChangeView({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], 13);
  }, [center, map]);
  return null;
}

export default function EventMap({ center = { lat: -36.82, lng: -73.05 }, userLocation = null, events }: EventMapProps) {
  const isMobile = useMobile()

  // Filtrar eventos con coordenadas válidas
  const validEvents = events.filter(event => 
    event.latitud !== null && 
    event.longitud !== null && 
    !isNaN(event.latitud) && 
    !isNaN(event.longitud)
  );

  // Filtrar eventos cercanos (dentro de un radio de ~10km)
  const nearbyEvents = userLocation ? validEvents.filter(event => {
    const distance = L.latLng(userLocation.lat, userLocation.lng)
      .distanceTo(L.latLng(event.latitud!, event.longitud!));
    return distance <= 10000; // 10km en metros
  }) : validEvents;

  return (
    <div style={{ height: 400, width: '100%', marginBottom: '2rem' }}>
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
      <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
        <ChangeView center={center} />
        
        {/* Marcador de ubicación del usuario */}
        {userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            icon={userIcon}
          >
            <Popup>
              Tu ubicación actual
            </Popup>
          </Marker>
        )}

        {/* Marcadores de eventos */}
        {nearbyEvents.map((event) => (
          <Marker
            key={event.id_evento}
            position={[event.latitud!, event.longitud!]}
            icon={eventIcon}
          >
            <Popup minWidth={isMobile ? 200 : 300} maxWidth={isMobile ? 250 : 350}>
            <div className="p-1">
              <div className="mb-2">
                  <Badge className="mb-2">{event.nombre_categoria}</Badge>
                  <h3 className="font-semibold text-base">{event.titulo}</h3>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1 text-xs">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span>
                    {event.fecha_inicio} • {event.hora_inicio}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground mb-3 text-xs">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span>{event.ubicacion}</span>
              </div>
                <Link href={`/events/${event.id_evento}`} className="w-full">
                <Button size="sm" className="w-full">
                  Ver detalles
                </Button>
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
    </div>
  )
}
