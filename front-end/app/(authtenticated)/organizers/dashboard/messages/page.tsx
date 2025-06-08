"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Send, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  sender: string
  text: string
  time: string
}

type MessageData = Record<string, Message[]>

// Datos de ejemplo para las conversaciones
const conversations = [
  {
    id: "1",
    name: "Juan Pérez",
    lastMessage: "Hola, tengo una pregunta sobre el evento",
    time: "10:30",
    unread: true,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "María López",
    lastMessage: "¿Cuál es la ubicación exacta?",
    time: "Ayer",
    unread: false,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    name: "Carlos Rodríguez",
    lastMessage: "Gracias por la información",
    time: "Lun",
    unread: false,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    name: "Ana Martínez",
    lastMessage: "¿Puedo comprar entradas en la puerta?",
    time: "Dom",
    unread: true,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "5",
    name: "Roberto Sánchez",
    lastMessage: "¿Hay estacionamiento disponible?",
    time: "Sáb",
    unread: false,
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

// Datos de ejemplo para los mensajes
const messageData: MessageData = {
  "1": [
    { id: "1", sender: "user", text: "Hola, tengo una pregunta sobre el evento", time: "10:30" },
    { id: "2", sender: "me", text: "Claro, dime en qué puedo ayudarte", time: "10:31" },
    { id: "3", sender: "user", text: "¿El evento es apto para niños?", time: "10:32" },
    { id: "4", sender: "me", text: "Sí, tenemos actividades para todas las edades", time: "10:33" },
    { id: "5", sender: "user", text: "Perfecto, ¿y hay algún descuento para grupos?", time: "10:34" },
  ],
  "2": [
    { id: "1", sender: "user", text: "Hola, ¿cuál es la ubicación exacta del evento?", time: "Ayer" },
    {
      id: "2",
      sender: "me",
      text: "El evento se realizará en el Centro de Convenciones, Av. Principal 123",
      time: "Ayer",
    },
    { id: "3", sender: "user", text: "Gracias, ¿hay transporte público cerca?", time: "Ayer" },
    {
      id: "4",
      sender: "me",
      text: "Sí, hay una estación de metro a 2 cuadras y varias paradas de autobús",
      time: "Ayer",
    },
  ],
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [newMessage, setNewMessage] = useState("")
  const [messages, setMessages] = useState(messageData[selectedConversation.id] || [])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const newMsg = {
      id: String(Date.now()),
      sender: "me",
      text: newMessage,
      time: "Ahora",
    }

    setMessages([...messages, newMsg])
    setNewMessage("")
  }

  const handleSelectConversation = (conversation: (typeof conversations)[0]) => {
    setSelectedConversation(conversation)
    setMessages(messageData[conversation.id] || [])
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mensajes</h1>
        <p className="text-muted-foreground">Gestiona tus conversaciones con asistentes y otros organizadores</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        {/* Lista de conversaciones */}
        <Card className="md:col-span-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Buscar conversación..." className="pl-8 bg-background" />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                    selectedConversation.id === conversation.id && "bg-muted",
                  )}
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.name} />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{conversation.name}</span>
                      <span className="text-xs text-muted-foreground">{conversation.time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                      {conversation.unread && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Área de chat */}
        <Card className="md:col-span-2 flex flex-col overflow-hidden">
          <div className="p-4 border-b flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedConversation.avatar || "/placeholder.svg"} alt={selectedConversation.name} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{selectedConversation.name}</h3>
              <p className="text-xs text-muted-foreground">En línea</p>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={cn("flex", message.sender === "me" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2",
                      message.sender === "me" ? "bg-primary text-primary-foreground" : "bg-muted",
                    )}
                  >
                    <p>{message.text}</p>
                    <p className="text-xs mt-1 opacity-70">{message.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Escribe un mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
                <span className="sr-only">Enviar mensaje</span>
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
