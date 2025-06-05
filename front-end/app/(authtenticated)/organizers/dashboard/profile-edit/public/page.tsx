"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Eye, Facebook, Globe, Instagram, Linkedin, Plus, Trash, Twitter, Upload } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Esquema de validación para el formulario de perfil público
const publicProfileSchema = z.object({
  organizationName: z.string().min(2, {
    message: "El nombre de la organización debe tener al menos 2 caracteres.",
  }),
  description: z.string().max(500, {
    message: "La descripción no puede tener más de 500 caracteres.",
  }),
  website: z
    .string()
    .url({
      message: "Por favor ingresa una URL válida.",
    })
    .optional()
    .or(z.literal("")),
  location: z.string().min(2, {
    message: "La ubicación debe tener al menos 2 caracteres.",
  }),
  foundedYear: z.string().regex(/^\d{4}$/, {
    message: "Por favor ingresa un año válido (4 dígitos).",
  }),
  socialLinks: z.array(
    z.object({
      platform: z.string(),
      url: z.string().url({
        message: "Por favor ingresa una URL válida.",
      }),
    }),
  ),
})

// Tipo para los valores del formulario de perfil público
type PublicProfileFormValues = z.infer<typeof publicProfileSchema>

// Valores por defecto para el formulario de perfil público
const defaultPublicProfileValues: Partial<PublicProfileFormValues> = {
  organizationName: "Eventos Santiago",
  description:
    "Organizadores de los mejores conciertos y festivales de música en Santiago. Contamos con más de 5 años de experiencia creando experiencias inolvidables para todo tipo de público.",
  website: "https://eventossantiago.cl",
  location: "Santiago, Chile",
  foundedYear: "2018",
  socialLinks: [
    { platform: "facebook", url: "https://facebook.com/eventossantiago" },
    { platform: "twitter", url: "https://twitter.com/eventossantiago" },
    { platform: "instagram", url: "https://instagram.com/eventossantiago" },
    { platform: "linkedin", url: "https://linkedin.com/company/eventossantiago" },
  ],
}

export default function PublicProfilePage() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [coverImage, setCoverImage] = useState<string>("/placeholder.svg?height=320&width=1920&text=Portada")
  const [logoImage, setLogoImage] = useState<string>("/placeholder.svg?height=128&width=128&text=ES")

  // Formulario de perfil público
  const form = useForm<PublicProfileFormValues>({
    resolver: zodResolver(publicProfileSchema),
    defaultValues: defaultPublicProfileValues as PublicProfileFormValues,
    mode: "onChange",
  })

  // Función para manejar el envío del formulario de perfil público
  function onSubmit(data: PublicProfileFormValues) {
    setIsLoading(true)

    // Simulamos una petición a la API
    setTimeout(() => {
      console.log(data)
      setIsLoading(false)
      toast({
        title: "Perfil público actualizado",
        description: "Tu perfil público ha sido actualizado correctamente.",
      })
    }, 1000)
  }

  // Función para añadir un nuevo enlace social
  function addSocialLink() {
    const currentLinks = form.getValues("socialLinks") || []
    form.setValue("socialLinks", [...currentLinks, { platform: "facebook", url: "" }])
  }

  // Función para eliminar un enlace social
  function removeSocialLink(index: number) {
    const currentLinks = form.getValues("socialLinks") || []
    form.setValue(
      "socialLinks",
      currentLinks.filter((_, i) => i !== index),
    )
  }

  // Función para obtener el icono de la plataforma social
  function getSocialIcon(platform: string) {
    switch (platform) {
      case "facebook":
        return <Facebook className="h-4 w-4" />
      case "twitter":
        return <Twitter className="h-4 w-4" />
      case "instagram":
        return <Instagram className="h-4 w-4" />
      case "linkedin":
        return <Linkedin className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Perfil Público</h1>
          <p className="text-muted-foreground">Personaliza cómo se ve tu perfil para los asistentes a eventos.</p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link href={`/organizers/1`} target="_blank">
            <Eye className="h-4 w-4" />
            Ver perfil público
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
        {/* Tarjeta de imágenes */}
        <Card>
          <CardHeader>
            <CardTitle>Imágenes del perfil</CardTitle>
            <CardDescription>Estas imágenes serán visibles en tu perfil público.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cover-image">Imagen de portada</Label>
              <div className="relative h-32 w-full overflow-hidden rounded-md border">
                <img src={coverImage || "/placeholder.svg"} alt="Portada" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Button variant="secondary" size="sm" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Cambiar portada
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Recomendado: 1920x320px. Máximo 2MB.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo-image">Logo o avatar</Label>
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32 rounded-xl overflow-hidden border">
                  <img src={logoImage || "/placeholder.svg"} alt="Logo" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="sm" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Cambiar logo
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Recomendado: 400x400px. Máximo 1MB.</p>
            </div>
          </CardContent>
        </Card>

        {/* Formulario de información general */}
        <Card>
          <CardHeader>
            <CardTitle>Información general</CardTitle>
            <CardDescription>Esta información será visible en tu perfil público.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="organizationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la organización</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre de tu organización" {...field} />
                      </FormControl>
                      <FormDescription>Este es el nombre que se mostrará en tu perfil público.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ubicación</FormLabel>
                        <FormControl>
                          <Input placeholder="Ciudad, País" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="foundedYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Año de fundación</FormLabel>
                        <FormControl>
                          <Input placeholder="2023" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sitio web</FormLabel>
                      <FormControl>
                        <Input placeholder="https://tuorganizacion.com" {...field} />
                      </FormControl>
                      <FormDescription>URL completa de tu sitio web (incluye https://).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe tu organización..."
                          className="resize-none min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Esta descripción aparecerá en tu perfil público. Máximo 500 caracteres.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Redes sociales</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addSocialLink} className="gap-1">
                      <Plus className="h-4 w-4" />
                      Añadir red social
                    </Button>
                  </div>

                  {form.watch("socialLinks")?.map((_, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`socialLinks.${index}.platform`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona una plataforma" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="facebook">Facebook</SelectItem>
                                <SelectItem value="twitter">Twitter</SelectItem>
                                <SelectItem value="instagram">Instagram</SelectItem>
                                <SelectItem value="linkedin">LinkedIn</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`socialLinks.${index}.url`}
                        render={({ field }) => (
                          <FormItem className="flex-[3]">
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSocialLink(index)}
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? "Guardando..." : "Guardar cambios"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
