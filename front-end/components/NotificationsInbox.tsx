'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bell, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getNotificacionesPorUsuario, marcarNotificacionComoLeida } from '@/lib/api/notificaciones'

interface Notificacion {
  id_notificacion: number
  id_usuario: number
  mensaje: string
  tipo: 'evento' | 'sistema'
  fecha_envio: string
  nombre_estado?: string | null
  leido?: boolean
  local_id?: string
}

interface NotificationsInboxProps {
  idUsuario: number
}

export default function NotificationsInbox({ idUsuario }: NotificationsInboxProps) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [filtro, setFiltro] = useState<'todas' | 'no_leidas' | 'evento' | 'sistema'>('todas')

  useEffect(() => {
    if (!idUsuario) return

    getNotificacionesPorUsuario(idUsuario)
      .then((lista: Notificacion[]) => {
        setNotificaciones(lista.map(n => ({
          ...n,
          leido: n.nombre_estado?.toLowerCase() === 'leída'
        })))
      })
      .catch(err => {
        console.error('❌ Error cargando notificaciones:', err)
      })
  }, [idUsuario])

  const notificacionesFiltradas = useMemo(() => {
    if (filtro === 'todas') return notificaciones
    if (filtro === 'evento' || filtro === 'sistema') {
      return notificaciones.filter(n => n.tipo?.toLowerCase().trim() === filtro)
    }
    if (filtro === 'no_leidas') return notificaciones.filter(n => !n.leido)
    return []
  }, [filtro, notificaciones])

  async function marcarComoLeida(id: number) {
    try {
      await marcarNotificacionComoLeida(id)
      setNotificaciones(prev =>
        prev.map(n => (n.id_notificacion === id ? { ...n, leido: true } : n))
      )
    } catch (error) {
      console.error('❌ Error al marcar como leída:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button variant={filtro === 'todas' ? 'default' : 'outline'} onClick={() => setFiltro('todas')}>
          Todas
        </Button>
        <Button variant={filtro === 'no_leidas' ? 'default' : 'outline'} onClick={() => setFiltro('no_leidas')}>
          No leídas
        </Button>
        <Button variant={filtro === 'evento' ? 'default' : 'outline'} onClick={() => setFiltro('evento')}>
          Eventos
        </Button>
        <Button variant={filtro === 'sistema' ? 'default' : 'outline'} onClick={() => setFiltro('sistema')}>
          Sistema
        </Button>
      </div>

      <div className="space-y-4">
        {notificacionesFiltradas.length === 0 ? (
          <p className="text-muted-foreground text-sm">No hay notificaciones para este filtro.</p>
        ) : (
          notificacionesFiltradas.map((n, idx) => (
            <div
              key={n.id_notificacion ?? n.local_id ?? `noti-${idx}`}
              className={`flex items-start gap-4 p-4 rounded-lg border transition ${
                n.leido ? 'bg-muted' : 'bg-white'
              }`}
            >
              <div className="rounded-full bg-primary/10 p-2">
                {n.leido ? (
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Bell className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <p className={`text-sm ${n.leido ? 'text-muted-foreground' : 'font-semibold'}`}>
                  {n.tipo === 'evento' ? '🔔 Evento' : '⚙️ Sistema'}
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Estado: {n.nombre_estado ?? 'No leída'}
                </p>
                <p className="text-sm text-muted-foreground">{n.mensaje}</p>
                <p className="text-xs text-muted-foreground">{formatoTiempo(n.fecha_envio)}</p>
              </div>
              {!n.leido ? (
                <Button variant="ghost" size="sm" onClick={() => marcarComoLeida(n.id_notificacion)}>
                  Marcar como leída
                </Button>
              ) : (
                <Badge variant="outline" className="text-xs mt-1">Leída</Badge>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function formatoTiempo(fechaISO: string) {
  const fecha = new Date(fechaISO)
  if (isNaN(fecha.getTime())) return 'Fecha inválida'

  const ahora = new Date()
  const diff = Math.floor((ahora.getTime() - fecha.getTime()) / 1000 / 60)

  if (diff < 1) return 'Justo ahora'
  if (diff < 60) return `Hace ${diff} min`
  const horas = Math.floor(diff / 60)
  if (horas < 24) return `Hace ${horas} h`
  const dias = Math.floor(horas / 24)
  return `Hace ${dias} día${dias !== 1 ? 's' : ''}`
}
