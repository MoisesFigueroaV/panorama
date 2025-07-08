"use client";

import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, Search, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AdminUser } from "@/lib/hooks/useAdminDashboard";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface AdminUserTableProps {
  users: AdminUser[];
}

type SortField = 'nombre' | 'email' | 'rol' | 'fecha';
type SortOrder = 'asc' | 'desc';

export function AdminUserTable({ users }: AdminUserTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('fecha');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Obtener roles únicos para el filtro
  const uniqueRoles = useMemo(() => {
    const roles = new Set(users.map(user => user.rol?.nombre_rol ?? 'Sin rol'));
    return Array.from(roles);
  }, [users]);

  // Filtrar y ordenar usuarios
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Aplicar búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.nombre_usuario.toLowerCase().includes(searchLower) ||
        user.correo.toLowerCase().includes(searchLower)
      );
    }

    // Aplicar filtro de rol
    if (selectedRole !== 'all') {
      result = result.filter(user => user.rol?.nombre_rol === selectedRole);
    }

    // Filtro por estado
    if (selectedState !== 'all') {
      result = result.filter(user => (selectedState === 'activo' ? user.activo !== false : user.activo === false));
    }

    // Aplicar ordenamiento
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'nombre':
          comparison = a.nombre_usuario.localeCompare(b.nombre_usuario);
          break;
        case 'email':
          comparison = a.correo.localeCompare(b.correo);
          break;
        case 'rol':
          comparison = (a.rol?.nombre_rol ?? '').localeCompare(b.rol?.nombre_rol ?? '');
          break;
        case 'fecha':
          comparison = new Date(a.fecha_registro).getTime() - new Date(b.fecha_registro).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [users, searchTerm, selectedRole, selectedState, sortField, sortOrder]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  // Manejadores de ordenamiento
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Cambiar estado de usuario (suspender/reactivar) en modo local
  const handleToggleUserState = async (id_usuario: number, activo: boolean) => {
    // Solo modo local
    const usuariosRaw = localStorage.getItem('usuarios');
    let usuarios = usuariosRaw ? JSON.parse(usuariosRaw) : null;
    if (!usuarios) {
      // Si no hay en localStorage, cargar del mock
      const usuariosMock = await import('@/mocks/usuarios.json');
      usuarios = usuariosMock.default || usuariosMock;
    }
    const idx = usuarios.findIndex((u: any) => u.id_usuario === id_usuario);
    if (idx !== -1) {
      usuarios[idx].activo = activo;
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
      toast({ title: activo ? 'Usuario reactivado' : 'Usuario suspendido', description: activo ? 'El usuario ha sido reactivado.' : 'El usuario ha sido suspendido.' });
      window.location.reload(); // Forzar recarga para reflejar el cambio (puedes optimizar esto con estado)
    }
  };

  if (!users || users.length === 0) {
    return <p className="text-sm text-center text-muted-foreground py-8">No hay usuarios para mostrar.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            {uniqueRoles.map(role => (
              <SelectItem key={role} value={role}>{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedState} onValueChange={setSelectedState}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="suspendido">Suspendido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('nombre')} className="font-medium">
                  Usuario
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('email')} className="font-medium">
                  Email
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('rol')} className="font-medium">
                  Rol
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                Estado
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('fecha')} className="font-medium">
                  Fecha de Registro
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow key={user.id_usuario}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{user.nombre_usuario.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{user.nombre_usuario}</div>
                  </div>
                </TableCell>
                <TableCell>{user.correo}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      user.rol?.nombre_rol === "Administrador"
                        ? "bg-primary text-white border-primary"
                        : user.rol?.nombre_rol === "Organizador"
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-secondary text-secondary-foreground border-secondary"
                    }
                  >
                    {user.rol?.nombre_rol ?? 'Sin rol'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold",
                      user.activo !== false
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-red-100 text-red-700 border border-red-200"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block w-2 h-2 rounded-full",
                        user.activo !== false ? "bg-green-500" : "bg-red-500"
                      )}
                    />
                    {user.activo !== false ? "Activo" : "Suspendido"}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(user.fecha_registro).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      {user.activo !== false ? (
                        <DropdownMenuItem className="text-red-500" onClick={() => handleToggleUserState(user.id_usuario, false)}>
                          Suspender
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem className="text-green-600" onClick={() => handleToggleUserState(user.id_usuario, true)}>
                          Reactivar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredUsers.length)} de {filteredUsers.length} usuarios
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}