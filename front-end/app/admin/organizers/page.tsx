"use client";

import { AdminOrganizerTable } from "@/components/admin/admin-organizer-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Loader2, AlertCircle, PlusCircle, ShieldAlert, ShieldCheck } from "lucide-react";
import { useAdminOrganizers } from "@/lib/hooks/useAdminOrganizers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";

export default function OrganizersPage() {
  const { organizers, loading, error, updateAccreditation, fetchOrganizers } = useAdminOrganizers();

  // Recargamos los datos cuando se actualiza un estado
  useEffect(() => {
    console.log('🔄 Recargando organizadores...');
    fetchOrganizers();
  }, [fetchOrganizers]);

  // Función wrapper para updateAccreditation que asegura la recarga
  const handleUpdateAccreditation = async (orgId: number, newStateId: number, notes: string | null) => {
    console.log('🔄 Iniciando actualización de estado:', { orgId, newStateId, notes });
    await updateAccreditation(orgId, newStateId, notes);
    console.log('✅ Estado actualizado, recargando datos...');
    await fetchOrganizers(); // Forzamos una recarga inmediata
  };

  // Log detallado de todos los organizadores
  useEffect(() => {
    if (!loading && organizers.length > 0) {
      console.log('📋 LISTA COMPLETA DE ORGANIZADORES:', organizers.map(org => ({
        id: org.id_organizador,
        nombre: org.nombre_organizacion,
        estado: org.estadoAcreditacionActual,
        estadoNombre: org.estadoAcreditacionActual?.nombre_estado,
        estadoId: org.estadoAcreditacionActual?.id_estado_acreditacion
      })));
    }
  }, [organizers, loading]);

  // Filtramos los datos de forma segura y consistente
  const pending = loading ? [] : organizers.filter(o => {
    const estadoId = o.estadoAcreditacionActual?.id_estado_acreditacion;
    const estadoNombre = o.estadoAcreditacionActual?.nombre_estado;
    const isPending = estadoId === 1 || !estadoId || estadoNombre === 'Pendiente';
    console.log('🔍 Filtrado PENDIENTE:', {
      id: o.id_organizador,
      nombre: o.nombre_organizacion,
      estadoId,
      estadoNombre,
      isPending,
      estadoCompleto: o.estadoAcreditacionActual
    });
    return isPending;
  });

  const accredited = loading ? [] : organizers.filter(o => {
    const estadoId = o.estadoAcreditacionActual?.id_estado_acreditacion;
    const estadoNombre = o.estadoAcreditacionActual?.nombre_estado;
    const isAccredited = estadoId === 2 || estadoNombre === 'Aprobado';
    console.log('🔍 Filtrado ACREDITADO:', {
      id: o.id_organizador,
      nombre: o.nombre_organizacion,
      estadoId,
      estadoNombre,
      isAccredited,
      estadoCompleto: o.estadoAcreditacionActual
    });
    return isAccredited;
  });

  console.log('📊 RESUMEN FINAL:', {
    total: organizers.length,
    pendientes: pending.length,
    acreditados: accredited.length,
    estados: {
      pendientes: pending.map(p => ({ id: p.id_organizador, nombre: p.nombre_organizacion, estado: p.estadoAcreditacionActual })),
      acreditados: accredited.map(a => ({ id: a.id_organizador, nombre: a.nombre_organizacion, estado: a.estadoAcreditacionActual }))
    }
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className="h-7 w-7" />
          <div>
            <h1 className="text-2xl font-bold">Gestión de Organizadores</h1>
            <p className="text-sm text-muted-foreground">Administra y verifica los perfiles de los organizadores.</p>
          </div>
        </div>
        <Link href="/admin/organizers/create">
          <Button className="w-full md:w-auto gap-2">
            <PlusCircle className="h-4 w-4" />
            Añadir Organizador
          </Button>
        </Link>
      </div>

      {/* Resumen de estados */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <ShieldAlert className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pending.length}</div>
            <p className="text-xs text-muted-foreground">Por revisar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acreditados</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accredited.length}</div>
            <p className="text-xs text-muted-foreground">Activos</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Organizadores</CardTitle>
          <CardDescription>
            Filtra por estado para ver los perfiles y realizar acciones de moderación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center p-10 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
              <p>Cargando organizadores...</p>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending" className="relative">
                  Pendientes
                  {pending.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {pending.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="accredited" className="relative">
                  Acreditados
                  {accredited.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {accredited.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="all" className="relative">
                  Todos
                  {organizers.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {organizers.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="mt-4">
                {pending.length > 0 ? (
                  <AdminOrganizerTable organizers={pending} onUpdate={handleUpdateAccreditation} />
                ) : (
                  <p className="text-center text-muted-foreground p-8">No hay organizadores pendientes.</p>
                )}
              </TabsContent>
              <TabsContent value="accredited" className="mt-4">
                {accredited.length > 0 ? (
                  <AdminOrganizerTable organizers={accredited} onUpdate={handleUpdateAccreditation} />
                ) : (
                  <p className="text-center text-muted-foreground p-8">No hay organizadores acreditados.</p>
                )}
              </TabsContent>
              <TabsContent value="all" className="mt-4">
                {organizers.length > 0 ? (
                  <AdminOrganizerTable organizers={organizers} onUpdate={handleUpdateAccreditation} />
                ) : (
                  <p className="text-center text-muted-foreground p-8">No hay organizadores registrados.</p>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}