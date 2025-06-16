"use client"

import { useChat } from "ai/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

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

export default function ChatPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="bg-card rounded-lg border p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Chat temporalmente deshabilitado</h1>
        <p className="text-muted-foreground">
          El sistema de chat está en desarrollo y no estará disponible por el momento.
        </p>
      </div>
    </div>
  )
}
