"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { AdminUser } from "@/lib/hooks/useAdminDashboard"; // Usamos el tipo del hook

interface AdminUserTableProps {
  users: AdminUser[];
}

export function AdminUserTable({ users }: AdminUserTableProps) {
  if (!users || users.length === 0) {
    return <p className="text-sm text-center text-muted-foreground py-8">No hay usuarios para mostrar.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Fecha de Registro</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
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
                <Badge variant="outline">{user.rol?.nombre_rol ?? 'Sin rol'}</Badge>
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
                    <DropdownMenuItem className="text-red-500">Suspender</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}