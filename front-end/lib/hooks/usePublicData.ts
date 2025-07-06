import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useDataMode } from './useLocalData';

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

export function useEventosDestacados(limit?: number) {
  const [eventos, setEventos] = useState<EventoDestacado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLocalMode } = useDataMode();

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (isLocalMode) {
          console.log('[useEventosDestacados] Cargando datos desde JSON local');
          const { default: eventosMock } = await import('@/mocks/eventos.json');
          setEventos(eventosMock.slice(0, limit || eventosMock.length));
        } else {
          console.log('[useEventosDestacados] Cargando datos desde Supabase');
          try {
            const response = await api.public.getEventosDestacados(limit);
            setEventos(response);
          } catch (remoteError) {
            console.warn('⚠️ Error al cargar datos remotos, fallback a locales:', remoteError);
            const { default: eventosMock } = await import('@/mocks/eventos.json');
            setEventos(eventosMock.slice(0, limit || eventosMock.length));
          }
        }
      } catch (err: any) {
        console.error('Error al obtener eventos destacados:', err);
        setError(err.message || 'Error al obtener eventos destacados');
      } finally {
        setLoading(false);
      }
    };
    fetchEventos();
  }, [limit, isLocalMode]);
  return { eventos, loading, error };
}

export function useOrganizadoresVerificados(limit?: number) {
  const [organizadores, setOrganizadores] = useState<OrganizadorVerificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLocalMode } = useDataMode();

  useEffect(() => {
    const fetchOrganizadores = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (isLocalMode) {
          console.log('[useOrganizadoresVerificados] Cargando datos desde JSON local');
          const { default: organizadoresMock } = await import('@/mocks/organizadores.json');
          setOrganizadores(organizadoresMock.slice(0, limit || organizadoresMock.length));
        } else {
          console.log('[useOrganizadoresVerificados] Cargando datos desde Supabase');
          try {
            const response = await api.public.getOrganizadoresVerificados(limit);
            setOrganizadores(response);
          } catch (remoteError) {
            console.warn('⚠️ Error al cargar datos remotos, fallback a locales:', remoteError);
            const { default: organizadoresMock } = await import('@/mocks/organizadores.json');
            setOrganizadores(organizadoresMock.slice(0, limit || organizadoresMock.length));
          }
        }
      } catch (err: any) {
        console.error('Error al obtener organizadores verificados:', err);
        setError(err.message || 'Error al obtener organizadores verificados');
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizadores();
  }, [limit, isLocalMode]);
  return { organizadores, loading, error };
}

export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLocalMode } = useDataMode();

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (isLocalMode) {
          console.log('[useCategorias] Cargando datos desde JSON local');
          const { default: categoriasMock } = await import('@/mocks/categorias.json');
          setCategorias(categoriasMock);
        } else {
          console.log('[useCategorias] Cargando datos desde Supabase');
          try {
            const response = await api.public.getCategorias();
            setCategorias(response);
          } catch (remoteError) {
            console.warn('⚠️ Error al cargar datos remotos, fallback a locales:', remoteError);
            const { default: categoriasMock } = await import('@/mocks/categorias.json');
            setCategorias(categoriasMock);
          }
        }
      } catch (err: any) {
        console.error('Error al obtener categorías:', err);
        setError(err.message || 'Error al obtener categorías');
      } finally {
        setLoading(false);
      }
    };
    fetchCategorias();
  }, [isLocalMode]);
  return { categorias, loading, error };
}

// Hook para obtener eventos por categoría
export function useEventosByCategoria(categoriaId: number, limit: number = 6) {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLocalMode } = useDataMode();

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true);
        setError(null);
        if (isLocalMode) {
          // Cargar desde mocks locales y filtrar por categoría
          const { default: eventosMock } = await import('@/mocks/eventos.json');
          const filtrados = eventosMock.filter((e: any) => e.id_categoria === categoriaId);
          setEventos(filtrados.slice(0, limit));
        } else {
          const response = await api.public.getEventosByCategoria(categoriaId, limit);
          setEventos(response);
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar eventos');
      } finally {
        setLoading(false);
      }
    };

    if (categoriaId) {
      fetchEventos();
    }
  }, [categoriaId, limit, isLocalMode]);

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