import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Clock } from "lucide-react"

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mensajes</h1>
        <p className="text-muted-foreground">
          Sistema de mensajería para comunicarte con usuarios y otros organizadores.
        </p>
      </div>

      <Card className="border-dashed border-2 border-muted-foreground/25">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">Funcionalidad en desarrollo</CardTitle>
          <CardDescription className="text-base">
            El sistema de mensajería estará disponible próximamente
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Próximamente disponible</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Estamos trabajando en implementar un sistema completo de mensajería que te permitirá 
            comunicarte directamente con usuarios interesados en tus eventos y otros organizadores.
          </p>
          <div className="pt-4 space-y-2 text-sm text-muted-foreground">
            <p><strong>Funcionalidades que incluirá:</strong></p>
            <ul className="space-y-1 text-left max-w-sm mx-auto">
              <li>• Chat en tiempo real con usuarios</li>
              <li>• Notificaciones de mensajes nuevos</li>
              <li>• Historial de conversaciones</li>
              <li>• Mensajes grupales para eventos</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
