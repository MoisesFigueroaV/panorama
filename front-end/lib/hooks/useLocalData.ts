import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/api/apiClient';

// Variable global para controlar el modo de datos
let useLocalDataMode = process.env.NEXT_PUBLIC_USE_LOCAL_DATA === 'true';

// Hook para controlar el modo de datos
export function useDataMode() {
  const [isLocalMode, setIsLocalMode] = useState(useLocalDataMode);

  const toggleMode = () => {
    useLocalDataMode = !useLocalDataMode;
    setIsLocalMode(useLocalDataMode);
    
    // Guardar preferencia en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('useLocalData', useLocalDataMode.toString());
    }
  };

  const setLocalMode = (local: boolean) => {
    useLocalDataMode = local;
    setIsLocalMode(useLocalDataMode);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('useLocalData', useLocalDataMode.toString());
    }
  };

  useEffect(() => {
    // Cargar preferencia desde localStorage al inicializar
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('useLocalData');
      if (saved !== null) {
        const shouldUseLocal = saved === 'true';
        useLocalDataMode = shouldUseLocal;
        setIsLocalMode(shouldUseLocal);
      }
    }
  }, []);

  return {
    isLocalMode,
    toggleMode,
    setLocalMode
  };
}

// Función helper para verificar si usar datos locales
export function shouldUseLocalData(): boolean {
  return useLocalDataMode;
}

// Hook para inicializar datos locales
export function useLocalDataInitializer() {
  const { isLocalMode } = useDataMode();

  useEffect(() => {
    const initializeLocalData = async () => {
      if (isLocalMode && typeof window !== 'undefined') {
        try {
          console.log('🚀 Inicializando datos locales...');
          const { localDataManager } = await import('@/lib/localStorage/localDataManager');
          await localDataManager.initializeWithMocks();
          console.log('✅ Datos locales inicializados correctamente');
        } catch (error) {
          console.error('❌ Error inicializando datos locales:', error);
        }
      }
    };

    initializeLocalData();
  }, [isLocalMode]);

  return { isLocalMode };
}

// Hook para cargar datos con fallback automático
export function useDataWithFallback<T>(
  fetchLocal: () => Promise<T>,
  fetchRemote: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLocalMode } = useDataMode();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (isLocalMode) {
          console.log('📁 Cargando datos desde mocks locales...');
          const localData = await fetchLocal();
          setData(localData);
        } else {
          console.log('☁️ Cargando datos desde Supabase...');
          try {
            const remoteData = await fetchRemote();
            setData(remoteData);
          } catch (remoteError) {
            console.warn('⚠️ Error al cargar datos remotos, fallback a locales:', remoteError);
            // Fallback a datos locales si falla la conexión remota
            const localData = await fetchLocal();
            setData(localData);
          }
        }
      } catch (err: any) {
        console.error('❌ Error al cargar datos:', err);
        setError(err.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLocalMode, ...dependencies]);

  return { data, loading, error };
}

// Hook específico para eventos
export function useEventosData() {
  const { isLocalMode } = useDataMode();
  
  const fetchLocalEventos = async () => {
    // Leer primero de localStorage si existe
    if (typeof window !== 'undefined') {
      const eventosStr = localStorage.getItem('local_eventos');
      if (eventosStr) {
        try {
          const eventos = JSON.parse(eventosStr);
          if (Array.isArray(eventos)) return eventos;
        } catch {}
      }
    }
    // Si no hay en localStorage, usar el mock original
    const { default: eventosMock } = await import('@/mocks/eventos.json');
    return eventosMock;
  };

  const fetchRemoteEventos = async () => {
    const { api } = await import('@/lib/api');
    return api.public.getEventosDestacados();
  };

  return useDataWithFallback(fetchLocalEventos, fetchRemoteEventos);
}

// Hook específico para organizadores
export function useOrganizadoresData() {
  const { isLocalMode } = useDataMode();
  
  const fetchLocalOrganizadores = async () => {
    const { default: organizadoresMock } = await import('@/mocks/organizadores.json');
    return organizadoresMock;
  };

  const fetchRemoteOrganizadores = async () => {
    const { api } = await import('@/lib/api');
    return api.public.getOrganizadoresVerificados();
  };

  return useDataWithFallback(fetchLocalOrganizadores, fetchRemoteOrganizadores);
}

// Hook específico para categorías
export function useCategoriasData() {
  const { isLocalMode } = useDataMode();
  
  const fetchLocalCategorias = async () => {
    const { default: categoriasMock } = await import('@/mocks/categorias.json');
    return categoriasMock;
  };

  const fetchRemoteCategorias = async () => {
    const { api } = await import('@/lib/api');
    return api.public.getCategorias();
  };

  return useDataWithFallback(fetchLocalCategorias, fetchRemoteCategorias);
} 

export function useSyncPendingOnReconnect() {
  const [wasLocal, setWasLocal] = useState(shouldUseLocalData());

  useEffect(() => {
    if (!shouldUseLocalData() && wasLocal) {
      // Pasamos de local a online
      // Sincronizar usuarios
      const pendingUsers = JSON.parse(localStorage.getItem('pending_users') || '[]');
      pendingUsers.forEach(async (item: any) => {
        try {
          if (item.action === 'update') {
            await api.users.update(item.id, item);
          } else if (item.action === 'delete') {
            await api.users.delete(item.id);
          } else {
            await api.users.create(item);
          }
          console.log('✔️ Sincronizado pendiente (users):', item);
        } catch (err) {
          console.error('❌ Error al sincronizar pendiente (users):', item, err);
        }
      });
      localStorage.removeItem('pending_users');
      // Sincronizar eventos
      const pendingEvents = JSON.parse(localStorage.getItem('pending_events') || '[]');
      const token = getAccessToken();
      pendingEvents.forEach(async (item: any) => {
        if (!token) {
          console.warn('⚠️ No hay token para sincronizar evento:', item);
          return;
        }
        try {
          if (item.action === 'update') {
            await api.eventos.update(item.id, item, token);
          } else if (item.action === 'delete') {
            await api.eventos.delete(item.id, token);
          } else {
            await api.eventos.create(item, token);
          }
          console.log('✔️ Sincronizado pendiente (events):', item);
        } catch (err) {
          console.error('❌ Error al sincronizar pendiente (events):', item, err);
        }
      });
      localStorage.removeItem('pending_events');
      // Sincronizar organizadores
      const pendingOrgs = JSON.parse(localStorage.getItem('pending_organizadores') || '[]');
      pendingOrgs.forEach(async (item: any) => {
        try {
          if (item.action === 'update') {
            await api.organizadores.update(item.id, item);
          } else if (item.action === 'delete') {
            await api.organizadores.delete(item.id);
          } else {
            await api.organizadores.create(item);
          }
          console.log('✔️ Sincronizado pendiente (organizadores):', item);
        } catch (err) {
          console.error('❌ Error al sincronizar pendiente (organizadores):', item, err);
        }
      });
      localStorage.removeItem('pending_organizadores');
      // Sincronizar notificaciones
      const pendingNotifs = JSON.parse(localStorage.getItem('pending_notificaciones') || '[]');
      pendingNotifs.forEach(async (item: any) => {
        try {
          if (item.action === 'update') {
            await api.notificaciones.update(item.id, item);
          } else if (item.action === 'delete') {
            await api.notificaciones.delete(item.id);
          } else {
            await api.notificaciones.create(item);
          }
          console.log('✔️ Sincronizado pendiente (notificaciones):', item);
        } catch (err) {
          console.error('❌ Error al sincronizar pendiente (notificaciones):', item, err);
        }
      });
      localStorage.removeItem('pending_notificaciones');
    }
    setWasLocal(shouldUseLocalData());
  }, [shouldUseLocalData()]);
} 

// Agrega un evento al mock de eventos en localStorage (modo local)
export async function addLocalEvent(evento: any) {
  let eventos: any[] = [];
  // Leer los eventos actuales de localStorage
  if (typeof window !== 'undefined') {
    const eventosStr = localStorage.getItem('local_eventos');
    if (eventosStr) {
      try {
        eventos = JSON.parse(eventosStr);
      } catch {
        eventos = [];
      }
    }
  }
  // Generar un id único
  const maxId = eventos.reduce((max, ev) => Math.max(max, ev.id_evento || 0), 0);
  // Forzar estado pendiente SIEMPRE
  const nuevoEvento = { ...evento, id_evento: maxId + 1, id_estado_evento: 1 };
  eventos.push(nuevoEvento);
  // Guardar en localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('local_eventos', JSON.stringify(eventos));
  }
} 