import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/AuthContext"
import { SavedEventsProvider } from "@/context/SavedEventsContext"
import { ScrollToTop } from "@/components/scroll-to-top"
import { Toaster } from "sonner"
import { LocalDataInitializer } from "@/components/local-data-initializer"
import { LocalModeIndicator } from "@/components/local-mode-indicator"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Panorama - Eventos y Cultura",
  description: "Descubre y organiza eventos culturales, deportivos y de entretenimiento en tu ciudad.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <SavedEventsProvider>
              <LocalDataInitializer />
              <LocalModeIndicator />
            <ScrollToTop />
            {children}
            <Toaster />
            </SavedEventsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
