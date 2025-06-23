import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix default marker icon issue in Leaflet
if (typeof window !== 'undefined' && L.Icon.Default) {
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  });
}

interface EventMapPickerProps {
  latitud: number | null;
  longitud: number | null;
  onChange: (lat: number, lng: number) => void;
}

function LocationMarker({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function EventMapPicker({ latitud, longitud, onChange }: EventMapPickerProps) {
  // Centrar el mapa en la ubicación seleccionada o en una por defecto
  const position = latitud && longitud ? [latitud, longitud] : [-36.82, -73.05]; // Concepción, CL

  useEffect(() => {
    // Si no hay lat/lng, centra el mapa en la posición por defecto
    if (!latitud || !longitud) {
      onChange(-36.82, -73.05);
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{ height: 300, width: '100%' }}>
      <MapContainer center={position as [number, number]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {latitud && longitud && <Marker position={[latitud, longitud] as [number, number]} />}
        <LocationMarker onChange={onChange} />
      </MapContainer>
    </div>
  );
} 