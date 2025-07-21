"use client"

import Image from 'next/image'
import { useState } from 'react'
import { shouldUseLocalData } from '@/lib/hooks/useLocalData'

interface SmartImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  fallbackSrc?: string
}

export function SmartImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  fallbackSrc = '/placeholder.svg'
}: SmartImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)
  const isLocalMode = shouldUseLocalData()

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(fallbackSrc)
    }
  }

  // Si estamos en modo local y la imagen es una URL externa que no funciona
  const finalSrc = isLocalMode && hasError ? fallbackSrc : imgSrc

  const imageProps = {
    src: finalSrc,
    alt,
    className,
    onError: handleError,
    ...(fill ? { fill } : { width, height })
  }

  return <Image {...imageProps} />
} 