"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"
import EventCard from "@/components/event-card"
import { api } from "@/lib/api"
import { getEventosFiltrados } from "@/lib/api/apiClient"
import { useCategorias, useEventosDestacados } from '@/lib/hooks/usePublicData'
import { shouldUseLocalData } from '@/lib/hooks/useLocalData'

interface Categoria {
  id_categoria: number
  nombre_categoria: string
}

// Usar el tipo EventoDestacado que ya está definido en usePublicData
import type { EventoDestacado } from '@/lib/hooks/usePublicData'

export default function MiniEventFilter() {
  const [searchText, setSearchText] = useState("")
  const [categoria, setCategoria] = useState("")
  const [estado, setEstado] = useState("")
  const [eventos, setEventos] = useState<EventoDestacado[]>([])
  const { categorias, loading: loadingCategorias, error: errorCategorias } = useCategorias();
  const { eventos: todosEventos } = useEventosDestacados(100); // Obtener todos los eventos para filtrar localmente
  const [loading, setLoading] = useState(false)
  const [hasFiltered, setHasFiltered] = useState(false)
  const isLocalMode = shouldUseLocalData();

  // Removemos este useEffect ya que useCategorias ya maneja la obtención de categorías
  // con fallback automático a datos locales

  useEffect(() => {
    if (!searchText && !categoria && !estado) {
      setEventos([])
      setHasFiltered(false)
      return
    }

    const fetchEventos = async () => {
      try {
        setLoading(true)
        setHasFiltered(true)

        if (isLocalMode && todosEventos) {
          // Filtrar localmente usando los datos ya cargados
          console.log('🔍 Filtrando eventos localmente...')
          let eventosFiltrados = [...todosEventos]

          // Filtro por búsqueda
          if (searchText) {
            eventosFiltrados = eventosFiltrados.filter(evento =>
              evento.titulo.toLowerCase().includes(searchText.toLowerCase()) ||
              evento.descripcion?.toLowerCase().includes(searchText.toLowerCase())
            )
          }

          // Filtro por categoría
          if (categoria) {
            eventosFiltrados = eventosFiltrados.filter(evento => {
              // Buscar la categoría por ID en el array de categorías
              const categoriaSeleccionada = categorias.find(cat => cat.id_categoria.toString() === categoria)
              return evento.nombre_categoria === categoriaSeleccionada?.nombre_categoria
            })
            console.log('🔍 Filtrado por categoría:', categoria, 'eventos encontrados:', eventosFiltrados.length)
          }

          // Filtro por estado (simplificado para modo local)
          if (estado) {
            const ahora = new Date()
            eventosFiltrados = eventosFiltrados.filter(evento => {
              const fechaEvento = new Date(evento.fecha_inicio)
              switch (estado) {
                case 'activo':
                  return fechaEvento > ahora
                case 'finalizado':
                  return fechaEvento < ahora
                case 'cancelado':
                  return false // No tenemos estado cancelado en mocks
                default:
                  return true
              }
            })
          }

          setEventos(eventosFiltrados.slice(0, 3))
        } else {
          // Usar API remota
          const filtros: Record<string, any> = {
            search: searchText,
            limit: 10,
          }

          if (categoria) filtros.categoria = categoria
          if (estado) filtros.estado = estado

          const data = await getEventosFiltrados(filtros)
          setEventos((data.eventos || []).slice(0, 3))
        }
      } catch (err) {
        console.error("Error al filtrar eventos:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchEventos()
  }, [searchText, categoria, estado, isLocalMode, todosEventos])

  const construirUrlEventos = () => {
    const params = new URLSearchParams()

    if (searchText) params.set("search", searchText)
    if (categoria) params.set("categoria", categoria)
    if (estado) params.set("estado", estado)

    return `/events?${params.toString()}`
  }

  return (
    <div className="bg-white shadow-lg rounded-2xl relative z-30 p-6 border border-black/5">
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos..."
            className="pl-10 bg-card border-gray-100"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <Select value={categoria} onValueChange={setCategoria}>
          <SelectTrigger className="border-gray-100 bg-card">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-accent" />
              <SelectValue placeholder="Categoría" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {categorias.map((cat) => (
              <SelectItem
                key={cat.id_categoria}
                value={cat.id_categoria.toString()}
              >
                {cat.nombre_categoria}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={estado} onValueChange={setEstado}>
          <SelectTrigger className="border-gray-100 bg-card">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="finalizado">Finalizado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Resultados */}
      <div className="mt-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : hasFiltered && eventos.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No se encontraron eventos con estos filtros.
          </p>
        ) : (
          eventos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {eventos.map((event) => {
                const eventoSinFechaUbicacion = {
                  ...event,
                  fecha_inicio: "",
                  fecha_fin: "",
                  ubicacion: null,
                }
                return (
                  <EventCard
                    key={event.id_evento}
                    event={eventoSinFechaUbicacion}
                  />
                )
              })}
            </div>
          )
        )}
      </div>

      {/* CTA */}
      {eventos.length >= 0 && (
        <div className="flex justify-center mt-6">
          <Button
            asChild
            variant="outline"
            className="gap-2 border-primary text-primary hover:bg-primary hover:text-white"
          >
            <a href={construirUrlEventos()}>Ver más eventos</a>
          </Button>
        </div>
      )}
    </div>
  )
}
