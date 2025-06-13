"use client";

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api/apiClient';
import { useToast } from '@/components/ui/use-toast'; // Asumiendo que usas los toasts de shadcn

// Este tipo debe coincidir con la respuesta del backend
export interface AdminOrganizer {
  id_organizador: number;
  nombre_organizacion: string;
  acreditado: boolean;
  documento_acreditacion: string | null;
  usuario: {
    nombre_usuario: string;
    correo: string;
    fecha_registro: string;
  } | null; // El usuario puede ser nulo
  estadoAcreditacionActual: {
    nombre_estado: string;
  } | null;
}

export const useAdminOrganizers = () => {
  const [organizers, setOrganizers] = useState<AdminOrganizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOrganizers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<AdminOrganizer[]>('/admin/organizers');
      setOrganizers(response.data);
    } catch (err) {
      setError('No se pudo cargar la lista de organizadores.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizers();
  }, [fetchOrganizers]);

  const updateAccreditation = async (orgId: number, newStateId: number, notes: string | null) => {
    try {
      await apiClient.patch(`/admin/organizers/${orgId}/acreditation`, {
        id_estado_acreditacion: newStateId,
        notas_admin: notes,
      });
      toast({
        title: "Éxito",
        description: "El estado del organizador ha sido actualizado.",
      });
      // Volvemos a cargar los datos para ver el cambio reflejado
      await fetchOrganizers();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el estado del organizador.",
      });
    }
  };

  return { organizers, loading, error, updateAccreditation };
};