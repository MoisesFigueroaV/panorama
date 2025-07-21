"use client"

import { useLocalDataInitializer } from '@/lib/hooks/useLocalData'

export function LocalDataInitializer() {
  // Este componente solo inicializa los datos locales
  // No renderiza nada visible
  useLocalDataInitializer()
  
  return null
} 