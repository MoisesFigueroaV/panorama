import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

// Función para formatear fechas para la base de datos (YYYY-MM-DD)
export function formatDateForDB(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

// Función para formatear fechas para mostrar al usuario
export function formatDateForDisplay(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'PPP', { locale: es })
}

// Función para formatear fechas cortas (ej: "15 dic 2024")
export function formatShortDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'd MMM yyyy', { locale: es })
}

// Función para obtener solo la fecha sin zona horaria
export function getLocalDateOnly(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Función para crear una fecha local sin zona horaria
export function createLocalDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day)
}

// Función para verificar si una fecha es válida
export function isValidDate(date: any): boolean {
  if (!date) return false
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return !isNaN(dateObj.getTime())
}

// Función para formatear fecha y hora
export function formatDateTime(date: Date | string, time?: string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const dateStr = format(dateObj, 'PPP', { locale: es })
  return time ? `${dateStr} a las ${time}` : dateStr
} 