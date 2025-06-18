import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface EventoDestacado {
  id_evento: number;
  titulo: string;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  ubicacion: string | null;
  imagen: string | null;
  capacidad: number;
  nombre_organizacion: string | null;
  logo_organizacion: string | null;
  nombre_categoria: string | null;
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

export function useEventosDestacados(limit?: number) {
  const [eventos, setEventos] = useState<EventoDestacado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.public.getEventosDestacados(limit);
        setEventos(response);
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
    const fetchOrganizadores = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.public.getOrganizadoresVerificados(limit);
        setOrganizadores(response);
      } catch (err: any) {
        console.error('Error al obtener organizadores verificados:', err);
        setError(err.message || 'Error al obtener organizadores verificados');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizadores();
  }, [limit]);

  return { organizadores, loading, error };
}

export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.public.getCategorias();
        setCategorias(response);
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
    const fetchEventos = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.public.getEventosByCategoria(categoriaId, limit);
        setEventos(response);
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
    const fetchEvento = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.public.getEventoById(eventoId);
        setEvento(response);
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