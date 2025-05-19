// Create this file for the admin user table component
"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, UserCheck, UserX } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AdminUserTable() {
  // Sample user data
  const [users] = useState([
    {
      id: "1",
      name: "Carlos Rodríguez",
      email: "carlos@example.com",
      role: "user",
      status: "active",
      createdAt: "2023-05-01",
    },
    {
      id: "2",
      name: "María González",
      email: "maria@example.com",
      role: "organizer",
      status: "active",
      createdAt: "2023-05-02",
    },
    {
      id: "3",
      name: "Juan Pérez",
      email: "juan@example.com",
      role: "user",
      status: "suspended",
      createdAt: "2023-05-03",
    },
    {
      id: "4",
      name: "Ana Martínez",
      email: "ana@example.com",
      role: "user",
      status: "active",
      createdAt: "2023-05-04",
    },
    {
      id: "5",
      name: "Pedro Sánchez",
      email: "pedro@example.com",
      role: "organizer",
      status: "active",
      createdAt: "2023-05-05",
    },
  ])

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha de registro</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                <div>
                  <div>{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
              </TableCell>
              <TableCell>
                {user.role === "admin" ? (
                  <Badge className="bg-primary">Admin</Badge>
                ) : user.role === "organizer" ? (
                  <Badge variant="outline" className="border-accent text-accent">
                    Organizador
                  </Badge>
                ) : (
                  <Badge variant="outline">Usuario</Badge>
                )}
              </TableCell>
              <TableCell>
                {user.status === "active" ? (
                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                    Activo
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                    Suspendido
                  </Badge>
                )}
              </TableCell>
              <TableCell>{user.createdAt}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                    <DropdownMenuItem>Editar usuario</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {user.status === "active" ? (
                      <DropdownMenuItem className="text-red-600">
                        <UserX className="mr-2 h-4 w-4" />
                        Suspender usuario
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem className="text-green-600">
                        <UserCheck className="mr-2 h-4 w-4" />
                        Activar usuario
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
  )
}
