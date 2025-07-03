"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Loader2, Upload } from "lucide-react"

type ImageUploadProps = {
  onImageUpload: (url: string | null) => void
  currentImage?: string
  folder: string
}

export function ImageUpload({ onImageUpload, currentImage, folder }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const fileName = `${folder}/${Date.now()}-${file.name}`
      const formData = new FormData()
      formData.append("file", file)
      formData.append("path", fileName)

      // Reemplaza esta URL por tu endpoint real de subida (API local o Supabase)
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Error al subir la imagen")
      }

      const data = await response.json()
      onImageUpload(data.url) // Supón que devuelve { url: "https://..." }
    } catch (error) {
      console.error(error)
      onImageUpload(null)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {currentImage && (
        <div className="relative h-48 w-48">
          <Image
            src={currentImage}
            alt="Imagen actual"
            fill
            className="rounded-md object-cover border"
          />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <Button type="button" onClick={handleClick} disabled={isUploading}>
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Subiendo...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            {currentImage ? "Cambiar imagen" : "Subir imagen"}
          </>
        )}
      </Button>
    </div>
  )
}
