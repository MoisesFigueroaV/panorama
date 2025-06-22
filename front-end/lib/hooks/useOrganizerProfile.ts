import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface OrganizerProfile {
  hasProfile: boolean;
  organizador: {
    id_organizador: number;
    nombre_organizacion: string;
    estado_acreditacion: number;
  } | null;
}

export function useOrganizerProfile() {
  const [profile, setProfile] = useState<OrganizerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { accessToken, isLoadingSession, isAuthenticated } = useAuth();

  useEffect(() => {
    const checkProfile = async () => {
      console.log('🔍 useOrganizerProfile - Estado actual:', {
        isLoadingSession,
        isAuthenticated,
        hasAccessToken: !!accessToken
      });

      // Esperar a que la sesión se cargue completamente
      if (isLoadingSession) {
        console.log('⏳ Esperando a que se cargue la sesión...');
        return;
      }

      // Verificar si el usuario está autenticado
      if (!isAuthenticated || !accessToken) {
        console.error('❌ Usuario no autenticado o sin token');
        setError('No hay token de autenticación');
        setLoading(false);
        return;
      }

      try {
        console.log('🚀 Verificando perfil de organizador...');
        setLoading(true);
        setError(null);
        
        const response = await api.organizadores.checkProfile(accessToken);
        console.log('✅ Perfil verificado:', response);
        setProfile(response);
      } catch (err: any) {
        console.error('❌ Error al verificar perfil:', err);
        setError(err.message || 'Error al verificar perfil de organizador');
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [accessToken, isLoadingSession, isAuthenticated]);

  return { profile, loading, error };
} 