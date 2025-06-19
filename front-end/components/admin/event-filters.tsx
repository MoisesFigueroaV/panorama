"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Filter, Calendar, Search, Building2, Tag } from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

interface FilterOptions {
  categorias: Array<{ id_categoria: number; nombre_categoria: string }>
  estados: Array<{ id_estado_evento: number; nombre_estado: string }>
  organizadores: Array<{ id_organizador: number; nombre_organizacion: string }>
}

interface EventFiltersProps {
  filters: {
    search: string
    estado: number | null
    categoria: number | null
    organizador: number | null
    fechaDesde: string
    fechaHasta: string
    sortBy: string
    sortOrder: 'asc' | 'desc'
  }
  onFiltersChange: (filters: any) => void
  onClearFilters: () => void
}

export function EventFilters({ filters, onFiltersChange, onClearFilters }: EventFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null)
  const [loading, setLoading] = useState(false)
  const { accessToken } = useAuth()

  useEffect(() => {
    if (isOpen && !filterOptions) {
      loadFilterOptions()
    }
  }, [isOpen, filterOptions])

  const loadFilterOptions = async () => {
    if (!accessToken) return
    
    setLoading(true)
    try {
      const options = await api.eventos.getFilterOptions(accessToken)
      setFilterOptions(options)
    } catch (error) {
      console.error("Error al cargar opciones de filtros:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const hasActiveFilters = filters.search || 
    filters.estado || 
    filters.categoria || 
    filters.organizador || 
    filters.fechaDesde || 
    filters.fechaHasta

  const activeFiltersCount = [
    filters.search,
    filters.estado,
    filters.categoria,
    filters.organizador,
    filters.fechaDesde,
    filters.fechaHasta
  ].filter(Boolean).length

  return (
    <div className="space-y-4">
      {/* Barra de filtros rápida */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={isOpen ? "default" : "outline"}
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Panel de filtros avanzados */}
      {isOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros Avanzados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">
                Cargando opciones de filtros...
              </div>
            ) : (
              <>
                {/* Búsqueda */}
                <div className="space-y-2">
                  <Label htmlFor="search" className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Búsqueda
                  </Label>
                  <Input
                    id="search"
                    placeholder="Buscar por título..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Estado */}
                  <div className="space-y-2">
                    <Label htmlFor="estado" className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Estado
                    </Label>
                    <Select
                      value={filters.estado?.toString() || "all"}
                      onValueChange={(value) => handleFilterChange('estado', value && value !== 'all' ? parseInt(value) : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        {filterOptions?.estados.map((estado) => (
                          <SelectItem key={estado.id_estado_evento} value={estado.id_estado_evento.toString()}>
                            {estado.nombre_estado}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Categoría */}
                  <div className="space-y-2">
                    <Label htmlFor="categoria" className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Categoría
                    </Label>
                    <Select
                      value={filters.categoria?.toString() || "all"}
                      onValueChange={(value) => handleFilterChange('categoria', value && value !== 'all' ? parseInt(value) : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las categorías" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        {filterOptions?.categorias.map((categoria) => (
                          <SelectItem key={categoria.id_categoria} value={categoria.id_categoria.toString()}>
                            {categoria.nombre_categoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Organizador */}
                  <div className="space-y-2">
                    <Label htmlFor="organizador" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Organizador
                    </Label>
                    <Select
                      value={filters.organizador?.toString() || "all"}
                      onValueChange={(value) => handleFilterChange('organizador', value && value !== 'all' ? parseInt(value) : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los organizadores" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los organizadores</SelectItem>
                        {filterOptions?.organizadores.map((organizador) => (
                          <SelectItem key={organizador.id_organizador} value={organizador.id_organizador.toString()}>
                            {organizador.nombre_organizacion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fechaDesde" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha desde
                    </Label>
                    <Input
                      id="fechaDesde"
                      type="date"
                      value={filters.fechaDesde}
                      onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fechaHasta" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha hasta
                    </Label>
                    <Input
                      id="fechaHasta"
                      type="date"
                      value={filters.fechaHasta}
                      onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
                    />
                  </div>
                </div>

                {/* Ordenamiento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sortBy">Ordenar por</Label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value) => handleFilterChange('sortBy', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fecha_registro">Fecha de registro</SelectItem>
                        <SelectItem value="titulo">Título</SelectItem>
                        <SelectItem value="fecha_inicio">Fecha de inicio</SelectItem>
                        <SelectItem value="capacidad">Capacidad</SelectItem>
                        <SelectItem value="organizador">Organizador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sortOrder">Orden</Label>
                    <Select
                      value={filters.sortOrder}
                      onValueChange={(value: 'asc' | 'desc') => handleFilterChange('sortOrder', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Descendente</SelectItem>
                        <SelectItem value="asc">Ascendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
} 