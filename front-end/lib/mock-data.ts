export interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  coordinates: [number, number];
  image: string;
  category: string;
  price: number | null;
  organizer: string;
  attendees: number;
}

export const events: EventData[] = [
  {
    id: "1",
    title: "Festival de Jazz",
    description: "Gran festival de jazz con artistas internacionales",
    date: "2024-05-15",
    time: "20:00",
    location: "Teatro Municipal, Santiago",
    coordinates: [-33.4372, -70.6506],
    image: "/placeholder.svg?height=400&width=600",
    category: "music",
    price: 25000,
    organizer: "Jazz Club Chile",
    attendees: 120
  },
  {
    id: "2",
    title: "Maratón Urbana",
    description: "Carrera por las calles de Santiago",
    date: "2024-06-01",
    time: "08:00",
    location: "Parque Forestal, Santiago",
    coordinates: [-33.4333, -70.6333],
    image: "/placeholder.svg?height=400&width=600",
    category: "sports",
    price: 15000,
    organizer: "Corre Santiago",
    attendees: 500
  },
  {
    id: "3",
    title: "Exposición de Arte Moderno",
    description: "Exposición de artistas contemporáneos chilenos",
    date: "2024-05-20",
    time: "10:00",
    location: "Museo de Bellas Artes, Santiago",
    coordinates: [-33.4350, -70.6428],
    image: "/placeholder.svg?height=400&width=600",
    category: "art",
    price: 5000,
    organizer: "Museo Nacional",
    attendees: 75
  }
]; 