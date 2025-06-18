"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Edit, Globe, Settings } from "lucide-react";
import Link from "next/link";

export default function OrganizerProfilePage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <User className="h-7 w-7" />
        <div>
          <h1 className="text-2xl font-bold">Mi Perfil</h1>
          <p className="text-sm text-muted-foreground">Gestiona tu información personal y de organización.</p>
        </div>
      </div>

      <Tabs defaultValue="public" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="public" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Perfil Público
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Editar Perfil
          </TabsTrigger>
        </TabsList>

        <TabsContent value="public" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Perfil Público
              </CardTitle>
              <CardDescription>
                Esta es la información que verán los usuarios en tu perfil público.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Gestiona cómo te ven los usuarios en tu perfil público de organizador.
                </p>
                <Link href="/organizers/dashboard/profile/public">
                  <Button className="w-full md:w-auto">
                    <Globe className="mr-2 h-4 w-4" />
                    Ver Perfil Público
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Editar Perfil
              </CardTitle>
              <CardDescription>
                Actualiza tu información personal y de organización.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Modifica los datos de tu perfil de organizador.
                </p>
                <Link href="/organizers/dashboard/profile-edit">
                  <Button className="w-full md:w-auto">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Perfil
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/organizers/dashboard/profile/public">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
                <Globe className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Ver Perfil Público</div>
                  <div className="text-sm text-muted-foreground">Cómo te ven los usuarios</div>
                </div>
              </Button>
            </Link>
            <Link href="/organizers/dashboard/profile-edit">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
                <Edit className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Editar Perfil</div>
                  <div className="text-sm text-muted-foreground">Modificar información</div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 