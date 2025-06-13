"use client";

import { AdminOrganizerTable } from "@/components/admin/admin-organizer-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Loader2, AlertCircle, PlusCircle } from "lucide-react";
import { useAdminOrganizers } from "@/lib/hooks/useAdminOrganizers"; // Asegúrate que la ruta a tu hook sea correcta
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OrganizersPage() {
  // 1. Usamos el hook para obtener toda la lógica y los datos.
  //    Cambiamos el nombre de la función de actualización para que sea más claro.
  const { organizers, loading, error, updateAccreditation } = useAdminOrganizers();

  // 2. Filtramos los datos de forma segura, solo después de que hayan cargado
  //    y asegurándonos de que `organizers` no sea nulo.
  const pending = loading ? [] : organizers.filter(o => o.estadoAcreditacionActual?.nombre_estado === 'Pendiente');
  const accredited = loading ? [] : organizers.filter(o => o.estadoAcreditacionActual?.nombre_estado === 'Aprobado');
  const rejected = loading ? [] : organizers.filter(o => o.estadoAcreditacionActual?.nombre_estado === 'Rechazado');

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

      <Card>
        <CardHeader>
          <CardTitle>Lista de Organizadores</CardTitle>
          <CardDescription>
            Filtra por estado para ver los perfiles y realizar acciones de moderación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 3. Manejo de estados de Carga y Error centralizado */}
          {loading ? (
             <div className="flex flex-col items-center justify-center p-10 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
                <p>Cargando organizadores...</p>
             </div>
          ) : error ? (
            <div className="p-4">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{error}</AlertTitle>
                </Alert>
            </div>
          ) : (
            // 4. El contenido se renderiza solo si no hay carga ni error
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                <TabsTrigger value="pending">Pendientes ({pending.length})</TabsTrigger>
                <TabsTrigger value="accredited">Acreditados ({accredited.length})</TabsTrigger>
                <TabsTrigger value="rejected">Rechazados ({rejected.length})</TabsTrigger>
                <TabsTrigger value="all">Todos ({organizers.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="mt-4">
                <AdminOrganizerTable organizers={pending} onUpdate={updateAccreditation} />
              </TabsContent>
              <TabsContent value="accredited" className="mt-4">
                <AdminOrganizerTable organizers={accredited} onUpdate={updateAccreditation} />
              </TabsContent>
              <TabsContent value="rejected" className="mt-4">
                <AdminOrganizerTable organizers={rejected} onUpdate={updateAccreditation} />
              </TabsContent>
              <TabsContent value="all" className="mt-4">
                <AdminOrganizerTable organizers={organizers} onUpdate={updateAccreditation} />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}