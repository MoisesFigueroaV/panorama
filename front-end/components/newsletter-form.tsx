"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check } from "lucide-react"

export default function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      // Aquí iría la lógica para enviar el email a un servicio
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="bg-primary/10 rounded-lg p-4 flex items-center gap-3 max-w-md mx-auto">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
          <Check className="w-4 h-4" />
        </div>
        <p className="text-sm">¡Gracias por suscribirte! Pronto recibirás nuestro boletín con los mejores eventos.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <Input
        type="email"
        placeholder="Tu correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="bg-white border-0"
      />
      <Button type="submit" className="bg-primary text-white">
        Suscribirme
      </Button>
    </form>
  )
}
