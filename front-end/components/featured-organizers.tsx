import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

interface OrganizadorVerificado {
  id_organizador: number;
  nombre_organizacion: string;
  descripcion: string | null;
  ubicacion: string | null;
  imagen_portada: string | null;
  logo_organizacion: string | null;
  tipo_organizacion: string | null;
  anio_fundacion: number | null;
  sitio_web: string | null;
  total_eventos: number;
}

interface FeaturedOrganizersProps {
  organizadores: OrganizadorVerificado[];
  loading?: boolean;
}

export default function FeaturedOrganizers({ organizadores, loading = false }: FeaturedOrganizersProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden border-black/5">
            <div className="h-40 bg-gray-200 animate-pulse" />
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (organizadores.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay organizadores verificados disponibles.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {organizadores.map((organizer) => (
        <Card
          key={organizer.id_organizador}
          className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden border-black/5"
        >
          <div className="relative h-40">
            <Image
              src={organizer.imagen_portada || "/placeholder.svg"}
              alt={organizer.nombre_organizacion}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

            {/* Etiqueta de verificado en la esquina superior derecha */}
            <div className="absolute top-3 right-3 z-30">
              <Badge className="bg-[#a3d7e0] text-white h-6 font-medium shadow-sm">Verificado</Badge>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-50 flex-shrink-0">
                  <Image
                    src={organizer.logo_organizacion || "/placeholder.svg"}
                    alt={organizer.nombre_organizacion}
                    width={40}
                    height={40}
                    className="object-cover"
                    style={{ backgroundColor: getOrganizerColor(organizer.id_organizador) }}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-white text-sm truncate">{organizer.nombre_organizacion}</h3>
                  <p className="text-xs text-white/80">{organizer.total_eventos} eventos</p>
                </div>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-4">
              {organizer.descripcion || "Sin descripción disponible"}
            </p>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{organizer.ubicacion || "Ubicación no especificada"}</span>
                {organizer.anio_fundacion && (
                  <span>• Fundado {organizer.anio_fundacion}</span>
                )}
              </div>
              <Link href={`/organizers/${organizer.id_organizador}`}>
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  Ver perfil
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Actualizar los colores de los organizadores
function getOrganizerColor(id: number) {
  const colors = ["#f47c6c", "#f9a05d", "#a3d7e0", "#f1c84b"]
  const colorIndex = id % colors.length
  return colors[colorIndex]
}
