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
          console.log('[useEventosDestacados] Cargando datos desde JSON local');
          const { default: eventosMock } = await import('@/mocks/eventos.json');
          // Transformar los datos para que sean compatibles con EventoDestacado
          const hoy = new Date();
          const eventosTransformados = eventosMock.map((evento: any) => {
            const fechaInicio = new Date(evento.fecha_inicio);
            const fechaFin = new Date(evento.fecha_fin);
            
            const eventoTransformado = {
              ...evento,
              nombre_categoria: evento.categoria_evento?.nombre_categoria || null,
              nombre_organizacion: evento.organizador?.nombre_organizacion || null,
              logo_organizacion: evento.organizador?.logo_organizacion || null,
              en_curso: fechaInicio <= hoy && fechaFin >= hoy,
              proximo: fechaInicio > hoy,
              ya_realizado: fechaFin < hoy,
            };
            
            console.log('🔍 Transformación de evento:', {
              titulo: evento.titulo,
              categoria_original: evento.categoria_evento?.nombre_categoria,
              categoria_transformada: eventoTransformado.nombre_categoria
            });
            
            return eventoTransformado;
          }) as EventoDestacado[];
          
          // Log para verificar que los estados se calculen correctamente
          console.log('🔍 Estados calculados en useEventosDestacados:', eventosTransformados.slice(0, 3).map(e => ({
            titulo: e.titulo,
            nombre_categoria: e.nombre_categoria,
            fecha_inicio: e.fecha_inicio,
            fecha_fin: e.fecha_fin,
            en_curso: e.en_curso,
            proximo: e.proximo,
            ya_realizado: e.ya_realizado
          })));
          setEventos(eventosTransformados.slice(0, limit || eventosTransformados.length) as any);
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
          setOrganizadores(
            organizadoresMock
              .slice(0, limit || organizadoresMock.length)
              .map((org: any) => ({
                total_eventos: 0,
                ...org,
              }))
          );
        } else {
          console.log('[useOrganizadoresVerificados] Cargando datos desde Supabase');
          try {
            const response = await api.public.getOrganizadoresVerificados(limit);
            setOrganizadores(response);
          } catch (remoteError) {
            console.warn('⚠️ Error al cargar datos remotos, fallback a locales:', remoteError);
            const { default: organizadoresMock } = await import('@/mocks/organizadores.json');
            setOrganizadores(
              organizadoresMock
                .slice(0, limit || organizadoresMock.length)
                .map((org: any) => ({
                  total_eventos: 0,
                  ...org,
                }))
            );
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
  const { isLocalMode } = useDataMode();

  useEffect(() => {
    const fetchEvento = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (isLocalMode) {
          console.log('[useEventoById] Cargando evento desde JSON local');
          const { default: eventosMock } = await import('@/mocks/eventos.json');
          const eventoEncontrado = eventosMock.find((e: any) => e.id_evento === eventoId);
          if (eventoEncontrado) {
            setEvento({
              ...eventoEncontrado,
              nombre_categoria: eventoEncontrado.categoria_evento?.nombre_categoria || null,
              nombre_organizacion: eventoEncontrado.organizador?.nombre_organizacion || null,
              logo_organizacion: eventoEncontrado.organizador?.logo_organizacion || null,
            });
          } else {
            setError('Evento no encontrado');
          }
        } else {
          console.log('[useEventoById] Cargando evento desde API remota');
          try {
            const response = await api.public.getEventoById(eventoId);
            setEvento(response);
          } catch (remoteError) {
            console.warn('⚠️ Error al cargar evento remoto, fallback a local:', remoteError);
            // Fallback a datos locales si falla la conexión remota
            const { default: eventosMock } = await import('@/mocks/eventos.json');
            const eventoEncontrado = eventosMock.find((e: any) => e.id_evento === eventoId);
            if (eventoEncontrado) {
              setEvento({
                ...eventoEncontrado,
                nombre_categoria: eventoEncontrado.categoria_evento?.nombre_categoria || null,
                nombre_organizacion: eventoEncontrado.organizador?.nombre_organizacion || null,
                logo_organizacion: eventoEncontrado.organizador?.logo_organizacion || null,
              });
            } else {
              setError('Evento no encontrado');
            }
          }
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
  }, [eventoId, isLocalMode]);

  return { evento, loading, error };
} 