"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
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
}

interface PromotedEventsCarouselProps {
  events: Event[]
}

export default function PromotedEventsCarousel({ events }: PromotedEventsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const nextSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const prevSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + events.length) % events.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [currentIndex, isAnimating])

  return (
    <div className="relative overflow-hidden rounded-2xl border shadow-lg bg-card">
      <div className="absolute top-4 right-4 z-10">
        <Badge className="bg-primary/90 backdrop-blur-sm">Evento Promocionado</Badge>
      </div>

      <div className="absolute top-1/2 left-4 z-10 -translate-y-1/2">
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full opacity-70 hover:opacity-100"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-6 w-6" />
          <span className="sr-only">Anterior</span>
        </Button>
      </div>

      <div className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full opacity-70 hover:opacity-100"
          onClick={nextSlide}
        >
          <ChevronRight className="h-6 w-6" />
          <span className="sr-only">Siguiente</span>
        </Button>
      </div>

      <div className="relative h-[400px] md:h-[500px]">
        {events.map((event, index) => (
          <div
            key={event.id}
            className={`carousel-item ${index === currentIndex ? "carousel-item-active" : "carousel-item-inactive"}`}
            style={{
              zIndex: index === currentIndex ? 1 : 0,
              transform: `translateX(${(index - currentIndex) * 100}%)`,
            }}
          >
            <div className="relative h-full w-full">
              <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    className={`category-badge-${
                      event.category.toLowerCase() === "música"
                        ? "music"
                        : event.category.toLowerCase() === "deportes"
                          ? "sports"
                          : event.category.toLowerCase() === "gastronomía"
                            ? "food"
                            : event.category.toLowerCase() === "arte y cultura"
                              ? "art"
                              : event.category.toLowerCase() === "tecnología"
                                ? "tech"
                                : "outdoor"
                    }`}
                  >
                    {event.category}
                  </Badge>
                  <div className="flex items-center gap-1 ml-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  </div>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold mb-2">{event.title}</h2>
                <p className="text-white/80 mb-4 max-w-2xl line-clamp-2">{event.description}</p>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 p-2 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-calendar"
                      >
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                        <line x1="16" x2="16" y1="2" y2="6" />
                        <line x1="8" x2="8" y1="2" y2="6" />
                        <line x1="3" x2="21" y1="10" y2="10" />
                      </svg>
                    </div>
                    <span>
                      {event.date} • {event.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 p-2 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-map-pin"
                      >
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <span>{event.location}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href={`/events/${event.id}`}>
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                      Ver detalles
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="text-white border-white bg-white/10 hover:bg-white/20">
                    Comprar entradas
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {events.map((_, index) => (
          <button
            key={index}
            className={`carousel-indicator ${index === currentIndex ? "carousel-indicator-active" : ""}`}
            onClick={() => {
              setIsAnimating(true)
              setCurrentIndex(index)
              setTimeout(() => setIsAnimating(false), 500)
            }}
            aria-label={`Ir al slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
