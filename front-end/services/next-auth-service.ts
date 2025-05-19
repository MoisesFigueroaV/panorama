import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
// Remove PrismaAdapter import since we don't have Prisma set up yet
// import { PrismaAdapter } from "@next-auth/prisma-adapter"
// import { db } from "@/lib/db"
// import { compare } from "bcrypt"
import type { UserRole } from "@/types/user"

export const authOptions: NextAuthOptions = {
  // Remove adapter for now
  // adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    // Only add OAuth providers if environment variables are available
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
      ? [
          FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // For demo purposes, use hardcoded users
        // In a real app, you would check against your database
        const users = [
          {
            id: "1",
            name: "User",
            email: "user@example.com",
            password: "password",
            role: "user",
          },
          {
            id: "2",
            name: "Organizer",
            email: "organizer@example.com",
            password: "password",
            role: "organizer",
          },
          {
            id: "3",
            name: "Admin",
            email: "admin@example.com",
            password: "password",
            role: "admin",
          },
        ]

        const user = users.find((user) => user.email === credentials.email)

        if (!user || user.password !== credentials.password) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as UserRole
        session.user.id = token.id as string
      }
      return session
    },
  },
  // Add a secret for development if NEXTAUTH_SECRET is not set
  secret: process.env.NEXTAUTH_SECRET || "development-secret",
}
