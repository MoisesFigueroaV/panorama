"use client"

import { useChat } from "ai/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Clock, Shield } from "lucide-react"

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// Datos de ejemplo para los chats
const chatUsers = [
  { id: 1, name: "María López", role: "Organizador", avatar: "/placeholder.svg?height=40&width=40", unread: 2 },
  { id: 2, name: "Carlos Rodríguez", role: "Usuario", avatar: "/placeholder.svg?height=40&width=40", unread: 0 },
  { id: 3, name: "Ana Martínez", role: "Organizador", avatar: "/placeholder.svg?height=40&width=40", unread: 1 },
  { id: 4, name: "Juan Pérez", role: "Usuario", avatar: "/placeholder.svg?height=40&width=40", unread: 0 },
  { id: 5, name: "Laura Sánchez", role: "Organizador", avatar: "/placeholder.svg?height=40&width=40", unread: 3 },
]

export default function AdminChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chat de Soporte</h1>
        <p className="text-muted-foreground">
          Sistema de chat para brindar soporte a usuarios y organizadores.
        </p>
      </div>

      <Card className="border-dashed border-2 border-muted-foreground/25">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">Funcionalidad en desarrollo</CardTitle>
          <CardDescription className="text-base">
            El sistema de chat de soporte estará disponible próximamente
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Próximamente disponible</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Estamos trabajando en implementar un sistema completo de chat de soporte que te permitirá 
            brindar asistencia en tiempo real a usuarios y organizadores de la plataforma.
          </p>
          <div className="pt-4 space-y-2 text-sm text-muted-foreground">
            <p><strong>Funcionalidades que incluirá:</strong></p>
            <ul className="space-y-1 text-left max-w-sm mx-auto">
              <li>• Chat en tiempo real con usuarios</li>
              <li>• Soporte técnico para organizadores</li>
              <li>• Sistema de tickets de soporte</li>
              <li>• Historial de conversaciones</li>
              <li>• Respuestas automáticas</li>
              <li>• Panel de administración de chats</li>
            </ul>
          </div>
          <div className="pt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>Acceso exclusivo para administradores</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
