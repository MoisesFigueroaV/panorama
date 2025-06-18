"use client"

import { useState, useEffect } from "react"
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
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"

// Esquema de validación para el formulario de perfil público
const publicProfileSchema = z.object({
  nombre_organizacion: z.string().min(2, {
    message: "El nombre de la organización debe tener al menos 2 caracteres.",
  }),
  descripcion: z.string().max(500, {
    message: "La descripción no puede tener más de 500 caracteres.",
  }),
  sitio_web: z
    .string()
    .url({
      message: "Por favor ingresa una URL válida.",
    })
    .optional()
    .or(z.literal("")),
  ubicacion: z.string().min(2, {
    message: "La ubicación debe tener al menos 2 caracteres.",
  }),
  anio_fundacion: z.string().regex(/^\d{4}$/, {
    message: "Por favor ingresa un año válido (4 dígitos).",
  }),
  telefono_organizacion: z.string().optional(),
  tipo_organizacion: z.string().optional(),
  redes_sociales: z.array(
    z.object({
      plataforma: z.string(),
      url: z.string().url({
        message: "Por favor ingresa una URL válida.",
      }),
    }),
  ),
})

// Tipo para los valores del formulario de perfil público
type PublicProfileFormValues = z.infer<typeof publicProfileSchema>

interface OrganizadorPublicProfile {
  id_organizador: number;
  nombre_organizacion: string;
  descripcion: string | null;
  ubicacion: string | null;
  anio_fundacion: number | null;
  sitio_web: string | null;
  imagen_portada: string | null;
  logo_organizacion: string | null;
  tipo_organizacion: string | null;
  telefono_organizacion: string | null;
  redes_sociales: Array<{
    id_red: number;
    plataforma: string;
    url: string;
  }>;
  total_eventos: number;
  usuario: {
    id_usuario: number;
    nombre_usuario: string;
    correo: string;
  } | null;
}

export default function PublicProfilePage() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true)
  const [profileData, setProfileData] = useState<OrganizadorPublicProfile | null>(null)
  const [coverImage, setCoverImage] = useState<string>("/placeholder.svg?height=320&width=1920&text=Portada")
  const [logoImage, setLogoImage] = useState<string>("/placeholder.svg?height=128&width=128&text=ES")
  const { accessToken } = useAuth()

  // Formulario de perfil público
  const form = useForm<PublicProfileFormValues>({
    resolver: zodResolver(publicProfileSchema),
    defaultValues: {
      nombre_organizacion: "",
      descripcion: "",
      sitio_web: "",
      ubicacion: "",
      anio_fundacion: "",
      telefono_organizacion: "",
      tipo_organizacion: "",
      redes_sociales: [],
    },
    mode: "onChange",
  })

  // Cargar datos del perfil
  useEffect(() => {
    const loadProfileData = async () => {
      if (!accessToken) return;

      try {
        setIsLoadingData(true);
        const response = await api.organizadores.getPublicProfile(accessToken);
        setProfileData(response);
        
        // Actualizar imágenes si existen
        if (response.imagen_portada) {
          setCoverImage(response.imagen_portada);
        }
        if (response.logo_organizacion) {
          setLogoImage(response.logo_organizacion);
        }

        // Actualizar formulario con datos existentes
        form.reset({
          nombre_organizacion: response.nombre_organizacion || "",
          descripcion: response.descripcion || "",
          sitio_web: response.sitio_web || "",
          ubicacion: response.ubicacion || "",
          anio_fundacion: response.anio_fundacion?.toString() || "",
          telefono_organizacion: response.telefono_organizacion || "",
          tipo_organizacion: response.tipo_organizacion || "",
          redes_sociales: response.redes_sociales.map((red: any) => ({
            plataforma: red.plataforma,
            url: red.url,
          })),
        });
      } catch (error: any) {
        console.error('Error al cargar perfil:', error);
        toast({
          title: "Error",
          description: error.message || "Error al cargar el perfil",
          variant: "destructive",
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    loadProfileData();
  }, [accessToken, form]);

  // Función para manejar el envío del formulario de perfil público
  async function onSubmit(data: PublicProfileFormValues) {
    if (!accessToken) {
      toast({
        title: "Error",
        description: "No hay token de autenticación",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.organizadores.updatePublicProfile(accessToken, {
        ...data,
        anio_fundacion: data.anio_fundacion ? parseInt(data.anio_fundacion) : undefined,
      });

      console.log('Perfil actualizado:', response);
      toast({
        title: "Perfil público actualizado",
        description: "Tu perfil público ha sido actualizado correctamente.",
      });
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      toast({
        title: "Error",
        description: error.message || "Error al actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Función para añadir un nuevo enlace social
  function addSocialLink() {
    const currentLinks = form.getValues("redes_sociales") || []
    form.setValue("redes_sociales", [...currentLinks, { plataforma: "facebook", url: "" }])
  }

  // Función para eliminar un enlace social
  function removeSocialLink(index: number) {
    const currentLinks = form.getValues("redes_sociales") || []
    form.setValue(
      "redes_sociales",
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

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Perfil Público</h1>
          <p className="text-muted-foreground">Cargando datos del perfil...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded-md animate-pulse" />
                <div className="h-32 w-32 bg-gray-200 rounded-xl animate-pulse mx-auto" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                    <div className="h-10 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Perfil Público</h1>
          <p className="text-muted-foreground">Personaliza cómo se ve tu perfil para los asistentes a eventos.</p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link href={`/organizers/${profileData?.id_organizador}`} target="_blank">
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
                  name="nombre_organizacion"
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

                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe tu organización, misión, visión..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Cuéntanos sobre tu organización. Máximo 500 caracteres.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ubicacion"
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
                    name="anio_fundacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Año de fundación</FormLabel>
                        <FormControl>
                          <Input placeholder="2020" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sitio_web"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sitio web</FormLabel>
                        <FormControl>
                          <Input placeholder="https://tuorganizacion.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telefono_organizacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="+56 9 1234 5678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="tipo_organizacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de organización</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el tipo de organización" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="empresa">Empresa</SelectItem>
                          <SelectItem value="ong">ONG</SelectItem>
                          <SelectItem value="colectivo">Colectivo</SelectItem>
                          <SelectItem value="independiente">Independiente</SelectItem>
                          <SelectItem value="institucion">Institución</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Redes sociales */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Redes sociales</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSocialLink}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar red social
                    </Button>
                  </div>

                  {form.watch("redes_sociales")?.map((_, index) => (
                    <div key={index} className="flex gap-2">
                      <FormField
                        control={form.control}
                        name={`redes_sociales.${index}.plataforma`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Plataforma" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="facebook">Facebook</SelectItem>
                                <SelectItem value="twitter">Twitter</SelectItem>
                                <SelectItem value="instagram">Instagram</SelectItem>
                                <SelectItem value="linkedin">LinkedIn</SelectItem>
                                <SelectItem value="youtube">YouTube</SelectItem>
                                <SelectItem value="tiktok">TikTok</SelectItem>
                                <SelectItem value="otro">Otro</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`redes_sociales.${index}.url`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder="URL de la red social" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeSocialLink(index)}
                        className="flex-shrink-0"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
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
