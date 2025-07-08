'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  getNotificacionesPorUsuario,
  marcarNotificacionComoLeida,
} from '@/lib/api/notificaciones'

// Extiende el tipo para aceptar local_id
interface NotificacionDropdown {
  id_notificacion?: number;
  local_id?: string;
  [key: string]: any;
}

interface NotificationsDropdownProps {
  idUsuario: number
  rolUsuario: 'Administrador' | 'Organizador' | 'Usuario'
}

export default function NotificationsDropdown({
  idUsuario,
  rolUsuario,
}: NotificationsDropdownProps) {
  const router = useRouter()
  const [notificaciones, setNotificaciones] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)

  useEffect(() => {
    if (!idUsuario) return
    getNotificacionesPorUsuario(idUsuario).then((data) => {
      setNotificaciones(data)
      setUnreadCount(data.filter((n: any) => !n.leido).length)
    })
  }, [idUsuario])

  async function manejarClickNotificacion(id: number) {
    try {
      await marcarNotificacionComoLeida(id)
      setNotificaciones((prev) =>
        prev.map((n) => (n.id_notificacion === id ? { ...n, leido: true } : n))
      )
      setUnreadCount((prev) => Math.max(prev - 1, 0))

      if (rolUsuario === 'Usuario') {
        router.push('/users/profile')
      }
    } catch (error) {
      console.error('❌ Error al marcar notificación como leída:', error)
    }
  }

  function verTodasLasNotificaciones() {
    if (rolUsuario === 'Usuario') {
      router.push('/users/profile')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex justify-center items-center"
            >
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Ver notificaciones</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {notificaciones.length === 0 && (
            <DropdownMenuItem disabled className="text-sm text-muted-foreground">
              Sin notificaciones
            </DropdownMenuItem>
          )}
          {notificaciones.slice(0, 5).map((n: NotificacionDropdown, idx: number) => (
            <DropdownMenuItem
              key={n.id_notificacion ?? n.local_id ?? `noti-${idx}`}
              onClick={typeof n.id_notificacion === 'number' ? () => manejarClickNotificacion(n.id_notificacion as number) : () => {}}
              className="flex flex-col items-start gap-1 p-4 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <span className="font-medium">
                  {n.tipo === 'evento' ? '📅 Evento' : '⚙️ Sistema'}{' '}
                  - {n.nombre_estado || 'No leída'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{n.mensaje}</p>
              <span className="text-xs text-muted-foreground">{formatoTiempo(n.fecha_envio)}</span>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="justify-center text-primary cursor-pointer"
          onClick={verTodasLasNotificaciones}
        >
          Ver todas las notificaciones
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function formatoTiempo(fechaISO: string) {
  const fecha = new Date(fechaISO)
  const ahora = new Date()
  const diff = Math.floor((ahora.getTime() - fecha.getTime()) / 1000 / 60)

  if (diff < 1) return 'Justo ahora'
  if (diff < 60) return `Hace ${diff} min`
  const horas = Math.floor(diff / 60)
  if (horas < 24) return `Hace ${horas} h`
  const dias = Math.floor(horas / 24)
  return `Hace ${dias} día${dias !== 1 ? 's' : ''}`
}
