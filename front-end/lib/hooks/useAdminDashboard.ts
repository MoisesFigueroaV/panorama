"use client";

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api/apiClient';
import { PaginatedResponse } from './useAdminUsers';

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