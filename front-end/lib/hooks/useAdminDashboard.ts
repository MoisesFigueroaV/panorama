"use client";

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api/apiClient';
import { PaginatedResponse } from './useAdminUsers';
import { shouldUseLocalData } from '@/lib/hooks/useLocalData';

// --- Tipos de Datos (Contratos con la API) ---
export interface DashboardKpis {
  totalUsuarios: number;
  totalOrganizadores: number;
  solicitudesPendientes: number;
  eventosActivos: number;
}

export interface AdminUser {
  id_usuario: number;
  nombre_usuario: string;
  correo: string;
  fecha_registro: string;
  rol: { id_rol: number; nombre_rol: string; } | null;
  activo?: boolean;
}

export interface AdminOrganizer {
  id_organizador: number;
  nombre_organizacion: string;
  acreditado: boolean;
  documento_acreditacion: string | null;
  usuario: {
    nombre_usuario: string;
    correo: string;
    fecha_registro: string;
  };
  estadoAcreditacionActual: {
    nombre_estado: string;
  } | null;
}


// --- Hook para el Dashboard Principal ---
export const useAdminDashboard = () => {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [organizers, setOrganizers] = useState<AdminOrganizer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (shouldUseLocalData()) {
        // KPIs
        const kpisMock = await import('@/mocks/dashboard-kpis.json');
        // Usuarios (solo admins y los 5 más recientes), desde localStorage si existe
        let usuariosRaw = null;
        if (typeof window !== 'undefined') {
          usuariosRaw = localStorage.getItem('usuarios');
        }
        let usuariosData;
        let usuariosMock;
        if (usuariosRaw) {
          usuariosData = JSON.parse(usuariosRaw);
        } else {
          usuariosMock = await import('@/mocks/usuarios.json');
          usuariosData = usuariosMock.default || usuariosMock;
        }
        const usersList = usuariosData
          .filter((u: any) => u.id_rol && u.id_rol > 0)
          .slice(-5)
          .map((u: any) => ({
            id_usuario: u.id_usuario,
            nombre_usuario: u.nombre_usuario,
            correo: u.correo,
            fecha_registro: u.fecha_registro,
            rol: u.id_rol ? { id_rol: u.id_rol, nombre_rol: u.id_rol === 1 ? 'Administrador' : (u.id_rol === 2 ? 'Organizador' : 'Usuario') } : null,
            activo: u.activo !== false
          }));
        // Organizadores
        const organizadoresMock = await import('@/mocks/organizadores.json');
        const usuariosFuente = usuariosData || (usuariosMock?.default || usuariosMock);
        const organizersList = (organizadoresMock.default || organizadoresMock).map((o: any) => ({
          id_organizador: o.id_organizador,
          nombre_organizacion: o.nombre_organizacion,
          acreditado: o.acreditado ?? false,
          documento_acreditacion: o.documento_acreditacion ?? null,
          usuario: {
            nombre_usuario: usuariosFuente.find((u: any) => u.id_usuario === o.id_usuario)?.nombre_usuario || '',
            correo: usuariosFuente.find((u: any) => u.id_usuario === o.id_usuario)?.correo || '',
            fecha_registro: usuariosFuente.find((u: any) => u.id_usuario === o.id_usuario)?.fecha_registro || ''
          },
          estadoAcreditacionActual: o.id_estado_acreditacion_actual ? { nombre_estado: 'Acreditado' } : null
        }));
        setKpis({
          totalUsuarios: kpisMock.usuariosRegistrados ?? usersList.length,
          totalOrganizadores: kpisMock.organizadoresActivos ?? organizersList.length,
          solicitudesPendientes: kpisMock.eventosPendientesAprobacion ?? 0,
          eventosActivos: kpisMock.eventosTotales ?? 0
        });
        setUsers(usersList);
        setOrganizers(organizersList);
        setIsLoading(false);
        return;
      }
      // Hacemos las llamadas a la API en paralelo para más eficiencia
      const [kpisResponse, usersResponse, organizersResponse] = await Promise.all([
        apiClient.get<DashboardKpis>('/admin/dashboard/kpis'),
        apiClient.get<PaginatedResponse<AdminUser>>('/admin/users?page=1&pageSize=5'), // Traemos solo los 5 más recientes
        apiClient.get<AdminOrganizer[]>('/admin/organizers')
      ]);

      setKpis(kpisResponse.data);
      setUsers(usersResponse.data.users); // Actualizado para usar la respuesta paginada
      setOrganizers(organizersResponse.data);

    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      
      // Extraer el mensaje de error correctamente
      let errorMessage = "No se pudieron cargar los datos del dashboard.";
      
      if (err.response?.data?.error) {
        // Si el error viene en formato { error: "mensaje" }
        errorMessage = err.response.data.error;
      } else if (err.response?.data) {
        // Si el error es directamente un string
        errorMessage = typeof err.response.data === 'string' ? err.response.data : errorMessage;
      } else if (err.message) {
        // Si hay un mensaje en el error
        errorMessage = err.message;
      }
      
      if (err.response?.status === 401) {
        // No redirigir aquí, dejar que el interceptor maneje la renovación del token
        setError("Error de autenticación. Intentando renovar sesión...");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { kpis, users, organizers, isLoading, error, refetch: fetchDashboardData };
};