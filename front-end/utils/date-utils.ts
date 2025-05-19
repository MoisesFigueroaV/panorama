// Utilidades para manejo de fechas
export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export const formatTime = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const formatDateTime = (date: Date | string): string => {
  return `${formatDate(date)} - ${formatTime(date)}`
}

export const isEventSoon = (date: Date | string): boolean => {
  const eventDate = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffTime = eventDate.getTime() - now.getTime()
  const diffDays = diffTime / (1000 * 3600 * 24)
  return diffDays <= 7 && diffDays > 0
}
