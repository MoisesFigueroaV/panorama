"use client"

import { useSession } from "next-auth/react"
import { UserRole } from "@/types/user"

export function useAuth() {
  const { data: session, status } = useSession()

  return {
    user: session?.user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    isUser: session?.user?.role === UserRole.USER,
    isOrganizer: session?.user?.role === UserRole.ORGANIZER || session?.user?.role === UserRole.ADMIN,
    isAdmin: session?.user?.role === UserRole.ADMIN,
  }
}
