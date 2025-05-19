// Servicio para eventos
import { fetchApi } from "./api"

export type Event = {
  id: string
  title: string
  description: string
  date: string
  location: string
  category: string
  image: string
  price: number
  organizerId: string
  featured?: boolean
}

export const eventsService = {
  getAllEvents: async () => {
    return fetchApi<{ events: Event[] }>("/events")
  },

  getEventById: async (id: string) => {
    return fetchApi<{ event: Event }>(`/events/${id}`)
  },

  getEventsByCategory: async (category: string) => {
    return fetchApi<{ events: Event[] }>(`/events?category=${category}`)
  },

  getFeaturedEvents: async () => {
    return fetchApi<{ events: Event[] }>("/events/featured")
  },

  createEvent: async (eventData: Omit<Event, "id">) => {
    return fetchApi<{ event: Event }>("/events", {
      method: "POST",
      body: eventData,
    })
  },

  updateEvent: async (id: string, eventData: Partial<Event>) => {
    return fetchApi<{ event: Event }>(`/events/${id}`, {
      method: "PUT",
      body: eventData,
    })
  },

  deleteEvent: async (id: string) => {
    return fetchApi(`/events/${id}`, {
      method: "DELETE",
    })
  },
}
