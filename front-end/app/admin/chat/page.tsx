"use client"

import { useChat } from "@ai-sdk/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

// Datos de ejemplo para los chats
const chatUsers = [
  { id: 1, name: "María López", role: "Organizador", avatar: "/placeholder.svg?height=40&width=40", unread: 2 },
  { id: 2, name: "Carlos Rodríguez", role: "Usuario", avatar: "/placeholder.svg?height=40&width=40", unread: 0 },
  { id: 3, name: "Ana Martínez", role: "Organizador", avatar: "/placeholder.svg?height=40&width=40", unread: 1 },
  { id: 4, name: "Juan Pérez", role: "Usuario", avatar: "/placeholder.svg?height=40&width=40", unread: 0 },
  { id: 5, name: "Laura Sánchez", role: "Organizador", avatar: "/placeholder.svg?height=40&width=40", unread: 3 },
]

export default function AdminChat() {
  const [activeChat, setActiveChat] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  // Filtrar usuarios según la pestaña activa
  const filteredUsers = chatUsers.filter((user) => {
    if (activeTab === "all") return true
    if (activeTab === "organizers") return user.role === "Organizador"
    if (activeTab === "users") return user.role === "Usuario"
    return true
  })

  // Configuración del chat con AI SDK
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    id: activeChat ? `chat-${activeChat}` : undefined,
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Centro de Mensajes</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Panel de contactos */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Conversaciones</CardTitle>
            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="organizers">Organizadores</TabsTrigger>
                <TabsTrigger value="users">Usuarios</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-320px)]">
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${activeChat === user.id ? "bg-gray-100" : ""}`}
                    onClick={() => setActiveChat(user.id)}
                  >
                    <Avatar>
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">{user.name}</p>
                        {user.unread > 0 && (
                          <span className="bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {user.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{user.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Panel de chat */}
        <Card className="md:col-span-2">
          {activeChat ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={chatUsers.find((u) => u.id === activeChat)?.avatar || "/placeholder.svg"}
                      alt={chatUsers.find((u) => u.id === activeChat)?.name}
                    />
                    <AvatarFallback>{chatUsers.find((u) => u.id === activeChat)?.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{chatUsers.find((u) => u.id === activeChat)?.name}</CardTitle>
                    <p className="text-sm text-gray-500">{chatUsers.find((u) => u.id === activeChat)?.role}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-420px)] py-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">No hay mensajes. Comienza la conversación.</div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.role === "user"
                                ? "bg-primary text-white rounded-tr-none"
                                : "bg-gray-100 rounded-tl-none"
                            }`}
                          >
                            {message.content}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="border-t p-3">
                <form onSubmit={handleSubmit} className="flex w-full gap-2">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Escribe un mensaje..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading || !input.trim()}>
                    Enviar
                  </Button>
                </form>
              </CardFooter>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Selecciona una conversación para comenzar
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
