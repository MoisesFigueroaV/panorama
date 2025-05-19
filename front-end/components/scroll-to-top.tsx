"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // Cuando cambia la ruta, desplazar al inicio de la página
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Usar "instant" en lugar de "smooth" para evitar animaciones extrañas
    })
  }, [pathname])

  return null // Este componente no renderiza nada
}
