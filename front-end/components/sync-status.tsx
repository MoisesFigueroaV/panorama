"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDataMode } from '@/lib/hooks/useLocalData'
import { localDataManager } from '@/lib/localStorage/localDataManager'
import { Upload, Download, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export function SyncStatus() {
  const { isLocalMode } = useDataMode()
  const [pendingChanges, setPendingChanges] = useState<{
    eventos: number
    organizadores: number
    notificaciones: number
  }>({ eventos: 0, organizadores: 0, notificaciones: 0 })
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    const checkPendingChanges = async () => {
      if (isLocalMode) {
        try {
          const changes = await localDataManager.getPendingChanges()
          setPendingChanges({
            eventos: changes.eventos.length,
            organizadores: changes.organizadores.length,
            notificaciones: changes.notificaciones.length
          })
        } catch (error) {
          console.error('Error checking pending changes:', error)
        }
      }
    }

    checkPendingChanges()
    // Verificar cada 30 segundos
    const interval = setInterval(checkPendingChanges, 30000)
    return () => clearInterval(interval)
  }, [isLocalMode])

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const changes = await localDataManager.getPendingChanges()
      const totalChanges = changes.eventos.length + changes.organizadores.length + changes.notificaciones.length
      
      if (totalChanges === 0) {
        toast.info('No hay cambios pendientes para sincronizar')
        return
      }

      // Aquí iría la lógica de sincronización real con el servidor
      // Por ahora solo simulamos
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success(`Sincronizados ${totalChanges} cambios con el servidor`)
      
      // Limpiar datos locales después de sincronizar
      await localDataManager.clearLocalData()
      setPendingChanges({ eventos: 0, organizadores: 0, notificaciones: 0 })
      
    } catch (error) {
      console.error('Error syncing:', error)
      toast.error('Error al sincronizar cambios')
    } finally {
      setIsSyncing(false)
    }
  }

  if (!isLocalMode) {
    return null
  }

  const totalPending = pendingChanges.eventos + pendingChanges.organizadores + pendingChanges.notificaciones

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Estado de Sincronización
        </CardTitle>
        <CardDescription>
          Cambios pendientes de sincronización con el servidor
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Eventos:</span>
            <Badge variant={pendingChanges.eventos > 0 ? "destructive" : "secondary"}>
              {pendingChanges.eventos}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Organizadores:</span>
            <Badge variant={pendingChanges.organizadores > 0 ? "destructive" : "secondary"}>
              {pendingChanges.organizadores}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Notificaciones:</span>
            <Badge variant={pendingChanges.notificaciones > 0 ? "destructive" : "secondary"}>
              {pendingChanges.notificaciones}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {totalPending > 0 ? (
            <AlertCircle className="h-4 w-4 text-orange-500" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          <span className="text-sm">
            {totalPending > 0 
              ? `${totalPending} cambios pendientes`
              : 'Todo sincronizado'
            }
          </span>
        </div>

        {totalPending > 0 && (
          <Button 
            onClick={handleSync} 
            disabled={isSyncing}
            className="w-full"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Sincronizar Cambios
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
} 