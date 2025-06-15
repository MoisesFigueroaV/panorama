"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, Eye, MoreHorizontal, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import type { AdminOrganizer } from "@/lib/hooks/useAdminOrganizers";

const ESTADO_COLORS = {
  'Pendiente': 'bg-yellow-500/20 text-yellow-600 border-yellow-500',
  'Aprobado': 'bg-green-500/20 text-green-600 border-green-500',
} as const;

interface AdminOrganizerTableProps {
  organizers: AdminOrganizer[];
  onUpdate: (orgId: number, newStateId: number, notes: string | null) => Promise<void>;
}

export function AdminOrganizerTable({ organizers, onUpdate }: AdminOrganizerTableProps) {
  const [selectedOrg, setSelectedOrg] = useState<AdminOrganizer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'pending'>('approve');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!organizers || organizers.length === 0) {
    return <p className="text-center text-muted-foreground p-8">No hay organizadores en esta categoría.</p>;
  }

  const handleAction = async (orgId: number, action: 'approve' | 'pending') => {
    const org = organizers.find(o => o.id_organizador === orgId);
    if (!org) return;

    console.log('Selected organization:', org);
    console.log('Action type:', action);
    setSelectedOrg(org);
    setActionType(action);
    setIsDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedOrg || isUpdating) return;

    setIsUpdating(true);
    try {
      const newStateId = Number(actionType === 'approve' ? 2 : 1);
      console.log('Confirming action:', {
        orgId: selectedOrg.id_organizador,
        currentState: selectedOrg.estadoAcreditacionActual,
        newStateId,
        actionType,
        tipoDeDato: typeof newStateId
      });
      
      const orgId = Number(selectedOrg.id_organizador);
      await onUpdate(orgId, newStateId, null);
      console.log('Action confirmed and update completed');
      
      setIsDialogOpen(false);
      setSelectedOrg(null);
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organización</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Fecha de Registro</TableHead>
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
                {org.usuario?.fecha_registro ? new Date(org.usuario.fecha_registro).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }) : 'N/A'}
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={ESTADO_COLORS[org.estadoAcreditacionActual?.nombre_estado as keyof typeof ESTADO_COLORS] ?? 'bg-gray-500/20 text-gray-600 border-gray-500'}
                >
                  {org.estadoAcreditacionActual?.nombre_estado ?? 'Pendiente'}
                </Badge>
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Button variant="ghost" className="w-full justify-start" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver detalles
                      </Button>
                    </DropdownMenuItem>
                    
                    {/* Acciones según el estado actual */}
                    {org.estadoAcreditacionActual?.nombre_estado === 'Pendiente' && (
                      <DropdownMenuItem asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-green-600 hover:text-green-600 hover:bg-green-50" 
                          size="sm"
                          onClick={() => handleAction(org.id_organizador, 'approve')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aprobar
                        </Button>
                      </DropdownMenuItem>
                    )}
                    
                    {org.estadoAcreditacionActual?.nombre_estado === 'Aprobado' && (
                      <DropdownMenuItem asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-yellow-600 hover:text-yellow-600 hover:bg-yellow-50" 
                          size="sm"
                          onClick={() => handleAction(org.id_organizador, 'pending')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Volver a Pendiente
                        </Button>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Aprobar Organizador' : 'Volver a Pendiente'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' ? 
                `¿Estás seguro de que deseas aprobar a ${selectedOrg?.nombre_organizacion}?` :
                `¿Estás seguro de que deseas volver a estado pendiente a ${selectedOrg?.nombre_organizacion}?`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button 
              variant="default"
              onClick={handleConfirmAction}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                actionType === 'approve' ? 'Confirmar Aprobación' : 'Confirmar Cambio'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}