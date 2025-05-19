"use client"

import { useState } from "react"
import { Calendar, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  image: string
  category: string
  description: string
  coordinates: [number, number]
}

interface CalendarViewProps {
  events: Event[]
}

export default function CalendarView({ events }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState("Mayo")

  // Días del mes actual (simplificado)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  // Días de la semana
  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

  // Eventos por día (simplificado)
  const getEventsForDay = (day: number) => {
    // Simulamos que algunos días tienen eventos
    if (day === 5 || day === 12 || day === 15 || day === 20 || day === 25) {
      return events.filter((_, index) => index % 5 === day % 5)
    }
    return []
  }

  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-medium">Calendario de eventos</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Hoy
          </Button>
          <Select defaultValue={currentMonth} onValueChange={setCurrentMonth}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Mes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Abril">Abril</SelectItem>
              <SelectItem value="Mayo">Mayo</SelectItem>
              <SelectItem value="Junio">Junio</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b">
        {weekDays.map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-muted">
        {/* Offset para empezar en el día correcto (simplificado) */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-card p-2 min-h-[100px]"></div>
        ))}

        {days.map((day) => {
          const dayEvents = getEventsForDay(day)
          const hasEvents = dayEvents.length > 0
          const isToday = day === 5 // Simulamos que hoy es día 5

          return (
            <div key={day} className={`bg-card p-2 min-h-[100px] ${isToday ? "ring-2 ring-primary ring-inset" : ""}`}>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-sm font-medium ${isToday ? "text-primary" : ""}`}>{day}</span>
                {hasEvents && (
                  <Badge variant="outline" className="text-xs h-5">
                    {dayEvents.length}
                  </Badge>
                )}
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="block text-xs p-1 rounded bg-primary/10 hover:bg-primary/20 truncate transition-colors"
                  >
                    {event.title}
                  </Link>
                ))}

                {dayEvents.length > 2 && (
                  <div className="text-xs text-muted-foreground p-1">+{dayEvents.length - 2} más</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="p-4 border-t">
        <h4 className="font-medium mb-3">Próximos eventos</h4>
        <div className="space-y-2">
          {events.slice(0, 3).map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <CardContent className="p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium text-sm">{event.title}</h5>
                    <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground text-xs mt-0.5">
                      <Clock className="h-3 w-3" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground text-xs mt-0.5">
                      <MapPin className="h-3 w-3" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <Badge
                    className={`category-badge-${event.category.toLowerCase() === "música" ? "music" : event.category.toLowerCase() === "deportes" ? "sports" : "art"}`}
                  >
                    {event.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
