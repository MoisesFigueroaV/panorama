import type React from "react"
import Link from "next/link"
import Image from "next/image"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex items-center justify-center">{children}</div>
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-r from-primary via-accent to-highlight relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12">
          <Link href="/" className="absolute top-8 left-8 flex items-center gap-2">
            <span className="font-bold text-2xl">Panorama</span>
          </Link>
          <div className="max-w-md text-center">
            <h1 className="text-3xl font-bold mb-6">Descubre eventos increíbles cerca de ti</h1>
            <p className="text-lg mb-8">
              Únete a nuestra comunidad y encuentra los mejores eventos, conciertos, talleres y más.
            </p>
            <Image
              src="/placeholder.svg?height=300&width=400&text=Eventos+Increíbles"
              alt="Eventos"
              width={400}
              height={300}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
