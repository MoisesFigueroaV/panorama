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
    id_estado_acreditacion: number;
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
      console.log('🔄 Fetching organizers...');
      const response = await apiClient.get<AdminOrganizer[]>('/admin/organizers');
      console.log('📥 Organizers fetched:', response.data.map(org => ({
        id: org.id_organizador,
        nombre: org.nombre_organizacion,
        estado: org.estadoAcreditacionActual
      })));
      setOrganizers(response.data);
    } catch (err) {
      console.error('❌ Error fetching organizers:', err);
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
      const orgBeforeUpdate = organizers.find(o => o.id_organizador === orgId);
      console.log('🔄 Updating accreditation:', { 
        orgId, 
        newStateId,
        tipoDeDatoOrgId: typeof orgId,
        tipoDeDatoNewStateId: typeof newStateId,
        notes,
        tipoDeDatoNotes: typeof notes,
        estadoActual: orgBeforeUpdate?.estadoAcreditacionActual,
        organizador: orgBeforeUpdate?.nombre_organizacion
      });

      // Aseguramos que los datos sean del tipo correcto
      const payload = {
        id_estado_acreditacion: Number(newStateId),
        notas_admin: notes || '' // Enviamos string vacío en lugar de null
      };

      console.log('📤 Payload:', payload);

      const response = await apiClient.patch(`/admin/organizers/${Number(orgId)}/acreditation`, payload);
      
      console.log('📥 Update response:', response.data);
      
      toast({
        title: "Éxito",
        description: "El estado del organizador ha sido actualizado.",
      });

      // Esperamos un momento antes de recargar para asegurar que la DB se haya actualizado
      console.log('⏳ Esperando 500ms antes de recargar...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('🔄 Reloading organizers after update...');
      await fetchOrganizers();
      
      // Verificamos el cambio
      const orgAfterUpdate = organizers.find(o => o.id_organizador === orgId);
      console.log('📊 Estado después de la actualización:', {
        antes: orgBeforeUpdate?.estadoAcreditacionActual,
        despues: orgAfterUpdate?.estadoAcreditacionActual
      });
    } catch (err: any) {
      console.error('❌ Error updating accreditation:', err.response?.data || err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "No se pudo actualizar el estado del organizador.",
      });
    }
  };

  return { 
    organizers, 
    loading, 
    error, 
    updateAccreditation,
    fetchOrganizers // Exponemos la función para recargar los datos
  };
};