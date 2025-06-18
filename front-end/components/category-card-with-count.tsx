import type React from "react"
import Link from "next/link"
import { useEventosByCategoria } from "@/lib/hooks/usePublicData"

interface CategoryCardWithCountProps {
  id: string
  name: string
  categoriaId: number
  icon: React.ReactNode
  color: string
}

export default function CategoryCardWithCount({ id, name, categoriaId, icon }: CategoryCardWithCountProps) {
  const { eventos, loading } = useEventosByCategoria(categoriaId, 1000) // Obtener todos para contar

  // Mapeo de IDs de categoría a nombres para mostrar
  const getCategoryConfig = (nombre: string) => {
    const lowerName = nombre.toLowerCase();
    if (lowerName.includes('música') || lowerName.includes('musica')) {
      return { id: 'music', nombre: nombre };
    } else if (lowerName.includes('deporte')) {
      return { id: 'sports', nombre: nombre };
    } else if (lowerName.includes('gastronomía') || lowerName.includes('gastronomia') || lowerName.includes('comida')) {
      return { id: 'food', nombre: nombre };
    } else if (lowerName.includes('arte') || lowerName.includes('cultura')) {
      return { id: 'art', nombre: nombre };
    } else if (lowerName.includes('tecnología') || lowerName.includes('tecnologia')) {
      return { id: 'tech', nombre: nombre };
    } else if (lowerName.includes('aire libre') || lowerName.includes('outdoor')) {
      return { id: 'outdoor', nombre: nombre };
    } else if (lowerName.includes('educación') || lowerName.includes('educacion')) {
      return { id: 'education', nombre: nombre };
    } else {
      return { id: 'other', nombre: nombre };
    }
  };

  // Obtener el ID correcto para el enlace
  const config = getCategoryConfig(name);
  const linkId = config.id;

  // Map category IDs to their background and text colors
  const categoryColors: Record<string, { bg: string; text: string }> = {
    music: { bg: "#fde8e5", text: "#f47c6c" }, // Coral
    sports: { bg: "#e0f2f6", text: "#a3d7e0" }, // Turquesa
    food: { bg: "#fef2e8", text: "#f9a05d" }, // Naranja
    art: { bg: "#fdf8e6", text: "#f1c84b" }, // Amarillo
    tech: { bg: "#f0f4ff", text: "#6366f1" }, // Índigo
    outdoor: { bg: "#f0fdf4", text: "#22c55e" }, // Verde
    education: { bg: "#fef3f2", text: "#ef4444" }, // Rojo para educación
    other: { bg: "#F5F7FF", text: "#4C74FF" }, // Azul por defecto
  }

  const colors = categoryColors[linkId] || { bg: "#F5F7FF", text: "#4C74FF" }

  return (
    <Link
      href={`/events?category=${linkId}`}
      className="category-card bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden"
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110"
        style={{ backgroundColor: colors.bg }}
      >
        <div style={{ color: colors.text }}>{icon}</div>
      </div>
      <h3 className="font-medium text-lg group-hover:text-primary transition-colors">{name}</h3>
      <p className="text-muted-foreground text-sm">
        {loading ? "..." : `${eventos.length} eventos`}
      </p>
      <div className="loading-bar"></div>
    </Link>
  )
} 