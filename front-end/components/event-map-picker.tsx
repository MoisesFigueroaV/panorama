import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';

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
  direccion?: string;
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

export default function EventMapPicker({ latitud, longitud, direccion, onChange }: EventMapPickerProps) {
  const [lastDireccion, setLastDireccion] = useState<string | undefined>(undefined);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Centrar el mapa en la ubicación seleccionada o en una por defecto
  const position = latitud && longitud ? [latitud, longitud] : [-36.82, -73.05]; // Concepción, CL

  useEffect(() => {
    if (direccion && direccion !== lastDireccion) {
      setLastDireccion(direccion);
      setGeoError(null);
      let direccionCompleta = direccion;
      const lower = direccion.toLowerCase();
      if (!lower.includes('biobio') && !lower.includes('biobío') && !lower.includes('concepción') && !lower.includes('chile')) {
        direccionCompleta = `${direccion}, Región del Biobío, Chile`;
      }
      console.log('[MAP] Buscando dirección:', direccionCompleta);
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccionCompleta)}`, {
        headers: {
          'User-Agent': 'panorama-app/1.0 (contacto@panorama-app.com)',
          'Accept-Language': 'es'
        }
      })
        .then(res => {
          if (!res.ok) throw new Error('Error de red o límite de peticiones');
          return res.json();
        })
        .then(data => {
          if (data && data.length > 0) {
            const { lat, lon, display_name } = data[0];
            console.log('[MAP] Resultado encontrado:', display_name, lat, lon);
            onChange(parseFloat(lat), parseFloat(lon));
            setGeoError(null);
          } else {
            setGeoError('No se encontró la dirección. Ajusta o sé más específico.');
            console.warn('[MAP] No se encontró la dirección:', direccionCompleta);
          }
        })
        .catch(err => {
          setGeoError('Error al buscar la dirección. Intenta de nuevo más tarde.');
          console.error('[MAP] Error en la geocodificación:', err);
        });
    }
    // eslint-disable-next-line
  }, [direccion]);

  useEffect(() => {
    if ((!latitud || !longitud) && !direccion) {
      onChange(-36.82, -73.05);
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{ height: 300, width: '100%' }}>
      {geoError && (
        <div style={{ color: 'red', marginBottom: 8, fontWeight: 'bold' }}>{geoError}</div>
      )}
      <MapContainer center={position as [number, number]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {latitud && longitud && <Marker position={[latitud, longitud] as [number, number]} />}
        <LocationMarker onChange={onChange} />
      </MapContainer>
    </div>
  );
} 