"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, FileText } from "lucide-react";
import type { AdminOrganizer } from "@/lib/hooks/useAdminOrganizers";

// Constantes para los IDs de los estados (idealmente, impórtalas de un archivo central)
const ESTADOS_ACREDITACION_IDS = {
  PENDIENTE: 1,
  APROBADO: 2,
  RECHAZADO: 3, // Asegúrate de que este ID exista en tu DB
};

interface AdminOrganizerTableProps {
  organizers: AdminOrganizer[];
  onUpdate: (orgId: number, newStateId: number, notes: string | null) => Promise<void>;
}

export function AdminOrganizerTable({ organizers, onUpdate }: AdminOrganizerTableProps) {
  if (!organizers || organizers.length === 0) {
    return <p className="text-center text-muted-foreground p-8">No hay organizadores en esta categoría.</p>;
  }

  const handleUpdate = async (orgId: number, newStateId: number) => {
    let notes: string | null = null;
    if (newStateId === ESTADOS_ACREDITACION_IDS.RECHAZADO) {
      notes = prompt("Por favor, introduce la razón del rechazo (opcional):");
      if (notes === null) return; // El admin canceló el prompt
    }
    await onUpdate(orgId, newStateId, notes);
  };
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Organización</TableHead>
          <TableHead>Contacto</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-center">Documento</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {organizers.map((org) => (
          <TableRow key={org.id_organizador}>
            <TableCell className="font-medium">{org.nombre_organizacion}</TableCell>
            <TableCell>
                <div>{org.usuario?.nombre_usuario ?? 'N/A'}</div>
                <div className="text-sm text-muted-foreground">{org.usuario?.correo ?? 'N/A'}</div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{org.estadoAcreditacionActual?.nombre_estado ?? 'Pendiente'}</Badge>
            </TableCell>
            <TableCell className="text-center">
              {org.documento_acreditacion ? (
                <Button variant="outline" size="sm" asChild>
                  <a href={org.documento_acreditacion} target="_blank" rel="noopener noreferrer" className="gap-2">
                    <FileText className="h-4 w-4" /> Ver
                  </a>
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">No adjunto</span>
              )}
            </TableCell>
            <TableCell className="text-right">
              {org.estadoAcreditacionActual?.nombre_estado === 'Pendiente' && (
                <div className="flex justify-end gap-2">
                  <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => handleUpdate(org.id_organizador, ESTADOS_ACREDITACION_IDS.APROBADO)}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Aprobar
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleUpdate(org.id_organizador, ESTADOS_ACREDITACION_IDS.RECHAZADO)}>
                    <XCircle className="h-4 w-4 mr-1" /> Rechazar
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}