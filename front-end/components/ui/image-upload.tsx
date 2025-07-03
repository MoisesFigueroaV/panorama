"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ImagePlus, X, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

export interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void
  currentImage?: string
  className?: string
  setIsUploading?: (uploading: boolean) => void
  folder: string
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  currentImage,
  className,
  setIsUploading,
  folder
}) => {
  const [isUploading, setIsUploadingState] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { accessToken } = useAuth()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setIsUploadingState(true)
    if (typeof setIsUploading === 'function') setIsUploading(true)
    try {
      const result = await api.upload.uploadImage(file, accessToken!, folder)
      onImageUpload(result.imageUrl || result.url || result.publicUrl)
      toast.success('Imagen subida exitosamente')
    } catch (error: any) {
      console.error('Error al subir imagen:', error)
      toast.error(error.message || 'Error al subir la imagen')
      setPreview(null)
    } finally {
      setIsUploadingState(false)
      if (typeof setIsUploading === 'function') setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    onImageUpload('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="gap-2"
        >
          {isUploading ? (
            <>
              <Upload className="h-4 w-4 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <ImagePlus className="h-4 w-4" />
              Seleccionar imagen
            </>
          )}
        </Button>
        
        {preview && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveImage}
            className="gap-2 text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
            Eliminar
          </Button>
        )}
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*,image/avif,.avif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview && (
        <div className="relative w-full h-48 border rounded-lg overflow-hidden">
          <img
            src={preview}
            alt="Vista previa"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Formatos soportados: JPG, PNG, GIF, AVIF. Máximo 5MB.
      </p>
    </div>
  )
} 