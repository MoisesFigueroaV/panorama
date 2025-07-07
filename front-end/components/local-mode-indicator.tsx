"use client"

import { Badge } from '@/components/ui/badge'
import { useDataMode } from '@/lib/hooks/useLocalData'
import { Database, Wifi, WifiOff } from 'lucide-react'

export function LocalModeIndicator() {
  const { isLocalMode } = useDataMode()

  if (!isLocalMode) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Badge variant="secondary" className="gap-2 bg-orange-100 text-orange-800 border-orange-200">
        <Database className="h-3 w-3" />
        <WifiOff className="h-3 w-3" />
        Modo Local
      </Badge>
    </div>
  )
} 