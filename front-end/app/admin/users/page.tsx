"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, MoreHorizontal, Search, UserPlus, Filter, Download, Loader2, AlertCircle } from "lucide-react";
import { useAdminUsers } from "@/lib/hooks/useAdminUsers";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminUsersPage() {
  const { users, loading, error, page, totalPages, goToPage } = useAdminUsers();
  
  const [searchTerm, setSearchTerm] = useState("");

  // La lógica de filtrado ahora se aplica sobre los datos traídos de la API
  const filteredUsers = users?.users?.filter((user) =>
    (user?.nombre_usuario?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user?.correo?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Gestión de Usuarios</h1>
        <Button className="flex items-center gap-2">
          <UserPlus size={16} />
          <span>Añadir Usuario</span>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por nombre o email..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-10 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
          ) : error ? (
            <div className="p-6"><Alert variant="destructive"><AlertCircle className="h-4 w-4" />{error}</Alert></div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Fecha de registro</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <TableRow key={user?.id_usuario || `user-${index}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{user.nombre_usuario?.charAt(0).toUpperCase() || ''}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.nombre_usuario || ''}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.correo || ''}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.rol?.nombre_rol ?? 'Sin Rol'}</Badge>
                      </TableCell>
                      <TableCell>{new Date(user.fecha_registro).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Suspender</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-sm text-gray-500">
                  Mostrando {filteredUsers.length} de {users?.total || 0} usuarios
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => goToPage(page - 1)} disabled={page === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm">Página {page} de {totalPages || 1}</div>
                  <Button variant="outline" size="icon" onClick={() => goToPage(page + 1)} disabled={page === totalPages || totalPages === 0}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}