import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"

export default function SiteFooter() {
  return (
    <footer className="w-full border-t border-primary/30 bg-gradient-to-r from-primary/90 via-accent/90 to-highlight/90 text-white">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Panorama</h3>
            <p className="text-white/80 mb-4">
              Descubre los mejores eventos cerca de ti. Conciertos, festivales, conferencias y mucho más.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-white/80 hover:text-white">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-white/80 hover:text-white">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-white/80 hover:text-white">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Explorar</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/events" className="text-white/80 hover:text-white">
                  Todos los eventos
                </Link>
              </li>
              <li>
                <Link href="/map" className="text-white/80 hover:text-white">
                  Mapa de eventos
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-white/80 hover:text-white">
                  Categorías
                </Link>
              </li>
              <li>
                <Link href="/featured" className="text-white/80 hover:text-white">
                  Destacados
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Organizadores</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/create-event" className="text-white/80 hover:text-white">
                  Crear evento
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-white/80 hover:text-white">
                  Precios
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-white/80 hover:text-white">
                  Recursos
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-white/80 hover:text-white">
                  Preguntas frecuentes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Empresa</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-white/80 hover:text-white">
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/80 hover:text-white">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/80 hover:text-white">
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/80 hover:text-white">
                  Términos y condiciones
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-10 pt-6 text-center text-white/60">
          <p>© {new Date().getFullYear()} Panorama. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
