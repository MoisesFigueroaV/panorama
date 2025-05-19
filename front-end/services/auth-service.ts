// Servicio para autenticación
import { fetchApi } from "./api"
import type { User } from "@/types/user"

export type LoginCredentials = {
  email: string
  password: string
}

export type RegisterData = {
  name: string
  email: string
  password: string
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    return fetchApi<{ user: User }>("/auth/login", {
      method: "POST",
      body: credentials,
    })
  },

  register: async (data: RegisterData) => {
    return fetchApi<{ user: User }>("/auth/register", {
      method: "POST",
      body: data,
    })
  },

  registerOrganizer: async (data: RegisterData & { organizationName: string }) => {
    return fetchApi<{ user: User }>("/auth/register/organizer", {
      method: "POST",
      body: data,
    })
  },

  logout: async () => {
    return fetchApi("/auth/logout", {
      method: "POST",
    })
  },

  getCurrentUser: async () => {
    return fetchApi<{ user: User }>("/auth/me")
  },
}
