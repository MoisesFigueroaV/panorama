export enum UserRole {
  USER = "user",
  ORGANIZER = "organizer",
  ADMIN = "admin",
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  image?: string
  createdAt: Date
  updatedAt: Date
}
