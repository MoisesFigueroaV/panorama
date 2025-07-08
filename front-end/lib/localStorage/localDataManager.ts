// Gestor de datos locales que simula una base de datos
// Permite crear, leer, actualizar y eliminar datos en modo local

import { formatDateForDB } from '@/lib/utils/date-utils'

export interface LocalEvent {
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
  id_estado_evento: number;
  id_categoria: number;
  id_organizador: number;
  latitud: number | null;
  longitud: number | null;
  fecha_registro: string;
  local_id?: string; // ID temporal para datos locales
  is_local?: boolean; // Marca si es un dato local
}

export interface LocalOrganizer {
  id_organizador: number;
  nombre_organizacion: string;
  descripcion: string | null;
  ubicacion: string | null;
  anio_fundacion: number | null;
  sitio_web: string | null;
  imagen_portada: string | null;
  logo_organizacion: string | null;
  tipo_organizacion: string | null;
  telefono_organizacion: string | null;
  id_usuario: number;
  id_estado_acreditacion_actual: number;
  local_id?: string;
  is_local?: boolean;
}

export interface LocalNotification {
  id_notificacion: number;
  id_usuario: number;
  mensaje: string;
  fecha_envio: string;
  tipo: string;
  nombre_estado?: string;
  leido?: boolean;
  local_id?: string;
  is_local?: boolean;
}

class LocalDataManager {
  private static instance: LocalDataManager;
  
  private constructor() {}
  
  static getInstance(): LocalDataManager {
    if (!LocalDataManager.instance) {
      LocalDataManager.instance = new LocalDataManager();
    }
    return LocalDataManager.instance;
  }

  // Generar ID único para datos locales
  private generateLocalId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // EVENTOS
  async getEventos(): Promise<LocalEvent[]> {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem('local_eventos');
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  async createEvento(evento: Omit<LocalEvent, 'id_evento' | 'local_id' | 'is_local'>): Promise<LocalEvent> {
    const eventos = await this.getEventos();
    const newEvento: LocalEvent = {
      ...evento,
      id_evento: Math.max(...eventos.map(e => e.id_evento), 0) + 1,
      local_id: this.generateLocalId(),
      is_local: true,
      fecha_registro: formatDateForDB(new Date())
    };
    
    eventos.push(newEvento);
    localStorage.setItem('local_eventos', JSON.stringify(eventos));
    
    return newEvento;
  }

  async updateEvento(id: number, updates: Partial<LocalEvent>): Promise<LocalEvent | null> {
    const eventos = await this.getEventos();
    const index = eventos.findIndex(e => e.id_evento === id);
    
    if (index === -1) return null;
    
    eventos[index] = { ...eventos[index], ...updates, is_local: true };
    localStorage.setItem('local_eventos', JSON.stringify(eventos));
    
    return eventos[index];
  }

  async deleteEvento(id: number): Promise<boolean> {
    const eventos = await this.getEventos();
    const filtered = eventos.filter(e => e.id_evento !== id);
    
    if (filtered.length === eventos.length) return false;
    
    localStorage.setItem('local_eventos', JSON.stringify(filtered));
    return true;
  }

  async getEventosByOrganizador(organizadorId: number): Promise<LocalEvent[]> {
    const eventos = await this.getEventos();
    return eventos.filter(e => e.id_organizador === organizadorId);
  }

  // ORGANIZADORES
  async getOrganizadores(): Promise<LocalOrganizer[]> {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem('local_organizadores');
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  async createOrganizador(organizador: Omit<LocalOrganizer, 'id_organizador' | 'local_id' | 'is_local'>): Promise<LocalOrganizer> {
    const organizadores = await this.getOrganizadores();
    const newOrganizador: LocalOrganizer = {
      ...organizador,
      id_organizador: Math.max(...organizadores.map(o => o.id_organizador), 0) + 1,
      local_id: this.generateLocalId(),
      is_local: true
    };
    
    organizadores.push(newOrganizador);
    localStorage.setItem('local_organizadores', JSON.stringify(organizadores));
    
    return newOrganizador;
  }

  async updateOrganizador(id: number, updates: Partial<LocalOrganizer>): Promise<LocalOrganizer | null> {
    const organizadores = await this.getOrganizadores();
    const index = organizadores.findIndex(o => o.id_organizador === id);
    
    if (index === -1) return null;
    
    organizadores[index] = { ...organizadores[index], ...updates, is_local: true };
    localStorage.setItem('local_organizadores', JSON.stringify(organizadores));
    
    return organizadores[index];
  }

  async getOrganizadorByUserId(userId: number): Promise<LocalOrganizer | null> {
    const organizadores = await this.getOrganizadores();
    return organizadores.find(o => o.id_usuario === userId) || null;
  }

  // NOTIFICACIONES
  async getNotificaciones(): Promise<LocalNotification[]> {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem('local_notificaciones');
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  async createNotificacion(notificacion: Omit<LocalNotification, 'id_notificacion' | 'local_id' | 'is_local'>): Promise<LocalNotification> {
    const notificaciones = await this.getNotificaciones();
    // Filtrar ids válidos
    const validIds = notificaciones.map(n => n.id_notificacion).filter(id => typeof id === 'number' && !isNaN(id));
    const nextId = validIds.length > 0 ? Math.max(...validIds) + 1 : 1;
    const newNotificacion: LocalNotification = {
      ...notificacion,
      id_notificacion: nextId,
      local_id: this.generateLocalId(),
      is_local: true
    };
    notificaciones.push(newNotificacion);
    localStorage.setItem('local_notificaciones', JSON.stringify(notificaciones));
    return newNotificacion;
  }

  async getNotificacionesByUsuario(userId: number): Promise<LocalNotification[]> {
    const notificaciones = await this.getNotificaciones();
    return notificaciones.filter(n => n.id_usuario === userId);
  }

  async updateNotificacion(id: number, updates: Partial<LocalNotification>): Promise<LocalNotification | null> {
    const notificaciones = await this.getNotificaciones();
    const index = notificaciones.findIndex(n => n.id_notificacion === id);
    
    if (index === -1) return null;
    
    notificaciones[index] = { ...notificaciones[index], ...updates, is_local: true };
    localStorage.setItem('local_notificaciones', JSON.stringify(notificaciones));
    
    return notificaciones[index];
  }

  // SINCRONIZACIÓN
  async getPendingChanges(): Promise<{
    eventos: LocalEvent[];
    organizadores: LocalOrganizer[];
    notificaciones: LocalNotification[];
  }> {
    const eventos = await this.getEventos();
    const organizadores = await this.getOrganizadores();
    const notificaciones = await this.getNotificaciones();
    
    return {
      eventos: eventos.filter(e => e.is_local),
      organizadores: organizadores.filter(o => o.is_local),
      notificaciones: notificaciones.filter(n => n.is_local)
    };
  }

  async clearLocalData(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('local_eventos');
    localStorage.removeItem('local_organizadores');
    localStorage.removeItem('local_notificaciones');
  }

  // INICIALIZAR CON DATOS DE MOCKS
  async initializeWithMocks(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      // Cargar datos de mocks
      const { default: eventosMock } = await import('@/mocks/eventos.json');
      const { default: organizadoresMock } = await import('@/mocks/organizadores.json');
      const { default: notificacionesMock } = await import('@/mocks/notificaciones.json');
      
      // Solo inicializar si no hay datos locales
      const hasLocalEventos = localStorage.getItem('local_eventos');
      const hasLocalOrganizadores = localStorage.getItem('local_organizadores');
      const hasLocalNotificaciones = localStorage.getItem('local_notificaciones');
      
      if (!hasLocalEventos) {
        localStorage.setItem('local_eventos', JSON.stringify(eventosMock));
      }
      
      if (!hasLocalOrganizadores) {
        localStorage.setItem('local_organizadores', JSON.stringify(organizadoresMock));
      }
      
      if (!hasLocalNotificaciones) {
        localStorage.setItem('local_notificaciones', JSON.stringify(notificacionesMock));
      }
      
      console.log('✅ Datos locales inicializados con mocks');
    } catch (error) {
      console.error('❌ Error inicializando datos locales:', error);
    }
  }
}

export const localDataManager = LocalDataManager.getInstance(); 