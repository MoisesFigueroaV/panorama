import type React from "react"
import Link from "next/link"

interface CategoryCardProps {
  id: string
  name: string
  count: number
  icon: React.ReactNode
  color: string
}

export default function CategoryCard({ id, name, count, icon }: CategoryCardProps) {
  // Map category IDs to their background and text colors
  const categoryColors: Record<string, { bg: string; text: string }> = {
    music: { bg: "#fde8e5", text: "#f47c6c" }, // Coral
    sports: { bg: "#e0f2f6", text: "#a3d7e0" }, // Turquesa
    food: { bg: "#fef2e8", text: "#f9a05d" }, // Naranja
    art: { bg: "#fdf8e6", text: "#f1c84b" }, // Amarillo
    tech: { bg: "#fde8e5", text: "#f47c6c" }, // Coral
    outdoor: { bg: "#e0f2f6", text: "#a3d7e0" }, // Turquesa
  }

  const colors = categoryColors[id] || { bg: "#F5F7FF", text: "#4C74FF" }

  return (
    <Link
      href={`/events?category=${id}`}
      className="category-card bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden"
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110"
        style={{ backgroundColor: colors.bg }}
      >
        <div style={{ color: colors.text }}>{icon}</div>
      </div>
      <h3 className="font-medium text-lg group-hover:text-primary transition-colors">{name}</h3>
      <p className="text-muted-foreground text-sm">{count} eventos</p>
      <div className="loading-bar"></div>
    </Link>
  )
}
