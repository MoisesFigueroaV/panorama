"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Calendar, MapPin, Globe, Phone, Mail, ExternalLink, Building2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { api } from '@/lib/api'
import { DynamicHeader } from '@/components/dynamic-header'
import SiteFooter from '@/components/site-footer'
import EventCard from '@/components/event-card'
import Link from 'next/link'

interface OrganizadorPublico {
  id_organizador: number
  nombre_organizacion: string
  descripcion: string | null
  ubicacion: string | null
  imagen_portada: string | null
  logo_organizacion: string | null
  tipo_organizacion: string | null
  anio_fundacion: number | null
  sitio_web: string | null
  telefono_organizacion: string | null
  redes_sociales: Array<{
    plataforma: string
    url: string
  }>
  total_eventos: number
  usuario: {
    id_usuario: number
    nombre_usuario: string
    correo: string
  } | null
}

interface EventoOrganizador {
  id_evento: number
  titulo: string
  descripcion: string | null
  fecha_inicio: string
  fecha_fin: string
  ubicacion: string | null
  imagen: string | null
  nombre_categoria: string | null
  nombre_organizacion: string | null
  logo_organizacion: string | null
}

export default function OrganizadorPublicPage() {
  const params = useParams()
  const organizadorId = params.id as string
  
  const [organizador, setOrganizador] = useState<OrganizadorPublico | null>(null)
  const [eventos, setEventos] = useState<EventoOrganizador[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrganizador = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Obtener perfil del organizador
        const organizadorData = await api.public.getOrganizadorPublicProfile(parseInt(organizadorId))
        setOrganizador(organizadorData)
        
        // Obtener eventos del organizador
        const eventosData = await api.public.getEventosByOrganizador(parseInt(organizadorId))
        setEventos(eventosData)
      } catch (err: any) {
        console.error('Error al obtener datos del organizador:', err)
        setError(err.message || 'Error al cargar el perfil del organizador')
      } finally {
        setLoading(false)
      }
    }

    if (organizadorId) {
      fetchOrganizador()
    }
  }, [organizadorId])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <DynamicHeader />
        <main className="flex-1">
          <div className="container py-8">
            <div className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded-lg mb-8" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  if (error || !organizador) {
    return (
      <div className="flex min-h-screen flex-col">
        <DynamicHeader />
        <main className="flex-1">
          <div className="container py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
              <p className="text-muted-foreground">{error || 'Organizador no encontrado'}</p>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-64 md:h-80 overflow-hidden">
        <Image
          src={organizador.imagen_portada || "/placeholder.svg"}
          alt={organizador.nombre_organizacion}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white flex-shrink-0">
                <Image
                  src={organizador.logo_organizacion || "/placeholder.svg"}
                  alt={organizador.nombre_organizacion}
                  width={80}
                  height={80}
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{organizador.nombre_organizacion}</h1>
                <div className="flex items-center gap-4 text-sm">
                  <Badge className="bg-green-600">Verificado</Badge>
                  <span>{organizador.total_eventos} eventos</span>
                  {organizador.ubicacion && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {organizador.ubicacion}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Botón para volver */}
        <div className="absolute top-6 left-6">
          <Link href="/">
            <Button variant="outline" className="bg-white/90 text-gray-900 hover:bg-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </section>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información del organizador */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold">Sobre {organizador.nombre_organizacion}</h2>
              </CardHeader>
              <CardContent className="space-y-6">
                {organizador.descripcion && (
                  <p className="text-muted-foreground leading-relaxed">
                    {organizador.descripcion}
                  </p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {organizador.tipo_organizacion && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{organizador.tipo_organizacion}</span>
                    </div>
                  )}
                  
                  {organizador.anio_fundacion && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Fundado en {organizador.anio_fundacion}</span>
                    </div>
                  )}
                  
                  {organizador.sitio_web && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={organizador.sitio_web} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Sitio web
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  
                  {organizador.telefono_organizacion && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{organizador.telefono_organizacion}</span>
                    </div>
                  )}
                </div>

                {/* Redes sociales */}
                {organizador.redes_sociales && organizador.redes_sociales.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Redes sociales</h3>
                    <div className="flex gap-2">
                      {organizador.redes_sociales.map((red, index) => (
                        <a
                          key={index}
                          href={red.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
                        >
                          {red.plataforma}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Estadísticas</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total eventos</span>
                    <span className="font-semibold">{organizador.total_eventos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado</span>
                    <Badge className="bg-green-600">Verificado</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {organizador.usuario && (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Contacto</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{organizador.usuario.correo}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Eventos del organizador */}
        {eventos.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Eventos de {organizador.nombre_organizacion}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventos.map((evento) => (
                <EventCard key={evento.id_evento} event={evento} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
} 