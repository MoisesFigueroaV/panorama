"use client";

import { useState, useEffect, useCallback } from 'react';
import { apiClient, getAccessToken } from '@/lib/api/apiClient';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { shouldUseLocalData } from '@/lib/hooks/useLocalData';

// Este tipo debe coincidir con la respuesta del backend desde admin.services.ts
export interface AdminUser {
  id_usuario: number;
  nombre_usuario: string;
  correo: string;
  fecha_registro: string;
  id_rol: number;
  rol: { id_rol: number; nombre_rol: string; } | null;
  activo?: boolean;
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
    if (shouldUseLocalData()) {
      // Cargar usuarios desde localStorage si existen, si no desde el mock
      let usuariosRaw = null;
      if (typeof window !== 'undefined') {
        usuariosRaw = localStorage.getItem('usuarios');
      }
      let usuariosData;
      if (usuariosRaw) {
        usuariosData = JSON.parse(usuariosRaw);
      } else {
        const usuariosMock = await import('@/mocks/usuarios.json');
        usuariosData = usuariosMock.default || usuariosMock;
      }
      const allUsers = usuariosData
        .filter((u: any) => u.id_rol && u.id_rol > 0)
        .map((u: any) => ({
          id_usuario: u.id_usuario,
          nombre_usuario: u.nombre_usuario,
          correo: u.correo,
          fecha_registro: u.fecha_registro,
          id_rol: u.id_rol,
          rol: u.id_rol ? { id_rol: u.id_rol, nombre_rol: u.id_rol === 1 ? 'Administrador' : (u.id_rol === 2 ? 'Organizador' : 'Usuario') } : null,
          activo: u.activo !== false // por defecto true si no existe
        }));
      const pageSize = 10;
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      setUsers({
        users: allUsers.slice(start, end),
        total: allUsers.length,
        page: currentPage,
        pageSize
      });
      setTotalPages(Math.ceil(allUsers.length / pageSize));
      setLoading(false);
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