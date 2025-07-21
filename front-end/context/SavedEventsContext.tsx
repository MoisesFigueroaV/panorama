// front-end/context/SavedEventsContext.tsx
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

// Usaremos una interfaz simplificada del evento para el contexto
interface EventoGuardado {
  id_evento: number;
  titulo: string;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  hora_inicio: string;
  hora_fin: string;
  ubicacion: string | null;
  imagen: string | null;
  nombre_categoria: string | null;
  nombre_organizacion: string | null;
  logo_organizacion: string | null;
}

interface SavedEventsContextType {
  savedEvents: EventoGuardado[];
  addSavedEvent: (event: EventoGuardado) => void;
  removeSavedEvent: (eventId: number) => void;
  isEventSaved: (eventId: number) => boolean;
}

const SavedEventsContext = createContext<SavedEventsContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'savedEvents';

export const SavedEventsProvider = ({ children }: { children: ReactNode }) => {
  const [savedEvents, setSavedEvents] = useState<EventoGuardado[]>([]);
  const { user } = useAuth();

  // Cargar eventos guardados desde localStorage al iniciar
  useEffect(() => {
    try {
      const items = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (items) {
        setSavedEvents(JSON.parse(items));
      }
    } catch (error) {
      console.error("Error al cargar eventos guardados de localStorage", error);
    }
  }, []);

  // Guardar eventos en localStorage cada vez que cambien
  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedEvents));
    } catch (error) {
      console.error("Error al guardar eventos en localStorage", error);
    }
  }, [savedEvents]);

  const addSavedEvent = useCallback(async (event: EventoGuardado) => {
    setSavedEvents((prevEvents) => {
      // Evitar duplicados
      if (prevEvents.find(e => e.id_evento === event.id_evento)) {
        return prevEvents;
      }
      toast.success(`'${event.titulo}' guardado en tus favoritos.`);
      return [...prevEvents, event];
    });

    // Simulación de notificaciones en modo local
    try {
      const { shouldUseLocalData } = await import("@/lib/hooks/useLocalData");
      if (shouldUseLocalData && shouldUseLocalData() && user?.id_usuario) {
        const { localDataManager } = await import("@/lib/localStorage/localDataManager");
        const now = new Date();
        const fechaInicio = new Date(`${event.fecha_inicio}T${event.hora_inicio}`);
        // Notificación inmediata
        await localDataManager.createNotificacion({
          id_usuario: user.id_usuario,
          mensaje: `¡Has guardado el evento '${event.titulo}'!`,
          fecha_envio: now.toISOString(),
          tipo: 'evento',
          nombre_estado: 'No leída',
          leido: false
        });
        // Notificaciones programadas
        const programaciones = [
          { dias: 7, texto: '¡Falta 1 semana para el evento' },
          { dias: 3, texto: '¡Faltan 3 días para el evento' },
          { horas: 1, texto: '¡Falta 1 hora para el evento' }
        ];
        for (const prog of programaciones) {
          let fechaNoti = new Date(fechaInicio);
          if (prog.dias) fechaNoti.setDate(fechaNoti.getDate() - prog.dias);
          if (prog.horas) fechaNoti.setHours(fechaNoti.getHours() - prog.horas);
          if (fechaNoti > now) {
            await localDataManager.createNotificacion({
              id_usuario: user.id_usuario,
              mensaje: `${prog.texto} '${event.titulo}'!`,
              fecha_envio: fechaNoti.toISOString(),
              tipo: 'evento',
              nombre_estado: 'No leída',
              leido: false
            });
          }
        }
      }
    } catch (e) {
      // No hacer nada si falla la simulación local
      console.error('Error simulando notificaciones locales:', e);
    }
  }, [user]);

  const removeSavedEvent = useCallback((eventId: number) => {
    setSavedEvents((prevEvents) => {
      const eventToRemove = prevEvents.find(e => e.id_evento === eventId);
      if (eventToRemove) {
        toast.info(`'${eventToRemove.titulo}' eliminado de tus favoritos.`);
      }
      return prevEvents.filter((event) => event.id_evento !== eventId);
    });
  }, []);

  const isEventSaved = useCallback((eventId: number) => {
    return savedEvents.some((event) => event.id_evento === eventId);
  }, [savedEvents]);

  return (
    <SavedEventsContext.Provider value={{ savedEvents, addSavedEvent, removeSavedEvent, isEventSaved }}>
      {children}
    </SavedEventsContext.Provider>
  );
};

export const useSavedEvents = (): SavedEventsContextType => {
  const context = useContext(SavedEventsContext);
  if (context === undefined) {
    throw new Error('useSavedEvents debe ser usado dentro de un SavedEventsProvider');
  }
  return context;
};