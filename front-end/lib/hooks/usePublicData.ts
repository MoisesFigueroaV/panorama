import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface EventoDestacado {
  id_evento: number;
  titulo: string;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  hora_inicio: string;
  hora_fin: string;
  ubicacion: string | null;
  imagen: string | null;
  capacidad: number;
  nombre_organizacion: string | null;
  logo_organizacion: string | null;
  nombre_categoria: string | null;
  ya_realizado: boolean;
  proximo: boolean;
  en_curso: boolean;
  latitud: number | null;
  longitud: number | null;
}

interface OrganizadorVerificado {
  id_organizador: number;
  nombre_organizacion: string;
  descripcion: string | null;
  ubicacion: string | null;
  imagen_portada: string | null;
  logo_organizacion: string | null;
  tipo_organizacion: string | null;
  anio_fundacion: number | null;
  sitio_web: string | null;
  total_eventos: number;
}

interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
}

import { events as mockEvents } from '@/lib/mock-data';
import { CATEGORIAS as mockCategorias } from '@/constants/categorias';

export function useEventosDestacados(limit?: number) {
  const [eventos, setEventos] = useState<EventoDestacado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventos = () => {
      try {
        setLoading(true);
        setError(null);
        
        const adaptedEvents = mockEvents.map(event => ({
          id_evento: parseInt(event.id),
          titulo: event.title,
          descripcion: event.description,
          fecha_inicio: event.date,
          fecha_fin: event.date,
          hora_inicio: event.time,
          hora_fin: event.time,
          ubicacion: event.location,
          imagen: event.image,
          capacidad: event.attendees,
          nombre_organizacion: event.organizer,
          logo_organizacion: null,
          nombre_categoria: event.category,
          ya_realizado: false,
          proximo: true,
          en_curso: false,
          latitud: event.coordinates[0],
          longitud: event.coordinates[1],
        }));

        setEventos(limit ? adaptedEvents.slice(0, limit) : adaptedEvents);
      } catch (err: any) {
        console.error('Error al obtener eventos destacados:', err);
        setError(err.message || 'Error al obtener eventos destacados');
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, [limit]);

  return { eventos, loading, error };
}

export function useOrganizadoresVerificados(limit?: number) {
  const [organizadores, setOrganizadores] = useState<OrganizadorVerificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setOrganizadores([]);
    setLoading(false);
  }, [limit]);

  return { organizadores, loading, error };
}

export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategorias = () => {
      try {
        setLoading(true);
        setError(null);
        
        const adaptedCategorias = mockCategorias.map(categoria => ({
          id_categoria: categoria.id,
          nombre_categoria: categoria.nombre,
        }));

        setCategorias(adaptedCategorias);
      } catch (err: any) {
        console.error('Error al obtener categorías:', err);
        setError(err.message || 'Error al obtener categorías');
      } finally {
        setLoading(false);
      }
    };

    fetchCategorias();
  }, []);

  return { categorias, loading, error };
}

// Hook para obtener eventos por categoría
export function useEventosByCategoria(categoriaId: number, limit: number = 6) {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventos = () => {
      try {
        setLoading(true);
        setError(null);
        const category = mockCategorias.find(c => c.id === categoriaId);
        if (category) {
          const filteredEvents = mockEvents.filter(event => event.category.toLowerCase() === category.nombre.toLowerCase());
          setEventos(limit ? filteredEvents.slice(0, limit) : filteredEvents);
        } else {
          setEventos([]);
        }
      } catch (err: any) {
        console.error('Error al obtener eventos por categoría:', err);
        setError(err.message || 'Error al cargar eventos');
      } finally {
        setLoading(false);
      }
    };

    if (categoriaId) {
      fetchEventos();
    }
  }, [categoriaId, limit]);

  return { eventos, loading, error };
}

// Hook para obtener un evento específico por ID
export function useEventoById(eventoId: number) {
  const [evento, setEvento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvento = () => {
      try {
        setLoading(true);
        setError(null);
        const foundEvent = mockEvents.find(event => parseInt(event.id) === eventoId);
        if (foundEvent) {
          const adaptedEvent = {
            id_evento: parseInt(foundEvent.id),
            titulo: foundEvent.title,
            descripcion: foundEvent.description,
            fecha_inicio: foundEvent.date,
            fecha_fin: foundEvent.date,
            hora_inicio: foundEvent.time,
            hora_fin: foundEvent.time,
            ubicacion: foundEvent.location,
            imagen: foundEvent.image,
            capacidad: foundEvent.attendees,
            nombre_organizacion: foundEvent.organizer,
            logo_organizacion: null,
            nombre_categoria: foundEvent.category,
            ya_realizado: false,
            proximo: true,
            en_curso: false,
            latitud: foundEvent.coordinates[0],
            longitud: foundEvent.coordinates[1],
          };
          setEvento(adaptedEvent);
        } else {
          setEvento(null);
        }
      } catch (err: any) {
        console.error('Error al obtener evento:', err);
        setError(err.message || 'Error al cargar evento');
      } finally {
        setLoading(false);
      }
    };

    if (eventoId) {
      fetchEvento();
    }
  }, [eventoId]);

  return { evento, loading, error };
} 