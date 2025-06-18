"use client";

import { useState, useEffect, useCallback } from 'react';
import { apiClient, getAccessToken } from '@/lib/api/apiClient';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Este tipo debe coincidir con la respuesta del backend desde admin.services.ts
export interface AdminUser {
  id_usuario: number;
  nombre_usuario: string;
  correo: string;
  fecha_registro: string;
  id_rol: number;
  rol: { id_rol: number; nombre_rol: string; } | null;
}

export interface PaginatedResponse<T> {
  users: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const useAdminUsers = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<PaginatedResponse<AdminUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(async (currentPage: number) => {
    // Verificar que el usuario es admin
    if (!user || user.rol?.id_rol !== 1) { // 1 es el ID del rol de administrador
      router.push('/login');
      return;
    }

    // Verificar que tenemos un token de acceso
    const token = getAccessToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<PaginatedResponse<AdminUser>>(`/admin/users?page=${currentPage}&pageSize=10`);
      setUsers(response.data);
      setTotalPages(Math.ceil(response.data.total / response.data.pageSize));
    } catch (err: any) {
      console.error("Error fetching users:", err);
      
      // Extraer el mensaje de error correctamente
      let errorMessage = "No se pudieron cargar los usuarios.";
      
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
        router.push('/login');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [user, router]);

  useEffect(() => {
    fetchUsers(page);
  }, [page, fetchUsers]);

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return { users, loading, error, page, totalPages, goToPage };
};