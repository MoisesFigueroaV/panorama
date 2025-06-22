"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, ImagePlus, MapPin, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import { CATEGORIAS_EVENTO, CATEGORIAS_MAPPING } from "@/lib/evento-constants"
import { toast } from "sonner"
import { useOrganizerProfile } from "@/lib/hooks/useOrganizerProfile"
import { AlertCircle } from "lucide-react"
import { ImageUpload } from "@/components/ui/image-upload"

// Schema de validación que coincide exactamente con el back-end
const eventFormSchema = z.object({
  titulo: z.string().min(3, {
    message: "El título debe tener al menos 3 caracteres",
  }).max(150, {
    message: "El título no puede tener más de 150 caracteres",
  }),
  descripcion: z.string().max(1000, {
    message: "La descripción no puede tener más de 1000 caracteres",
  }).optional(),
  fecha_inicio: z.date({
    required_error: "Por favor selecciona una fecha de inicio",
  }),
  fecha_fin: z.date({
    required_error: "Por favor selecciona una fecha de fin",
  }),
  hora_inicio: z.string().min(1, "Por favor ingresa la hora de inicio"),
  hora_fin: z.string().min(1, "Por favor ingresa la hora de fin"),
  ubicacion: z.string().max(250, {
    message: "La ubicación no puede tener más de 250 caracteres",
  }).optional(),
  capacidad: z.string().min(1, "La capacidad debe ser mayor a 0"),
  id_categoria: z.string().min(1, "Debes seleccionar una categoría"),
  imagen: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  latitud: z.number().optional(),
  longitud: z.number().optional(),
})

type EventFormValues = z.infer<typeof eventFormSchema>

const defaultValues: Partial<EventFormValues> = {
  titulo: "",
  descripcion: "",
  ubicacion: "",
  capacidad: "1",
  id_categoria: "1",
  imagen: "",
  hora_inicio: "09:00",
  hora_fin: "18:00",
}

export default function CreateEventPage() {
  const { accessToken, user, isAuthenticated, isLoadingSession } = useAuth()
  const { profile, loading: profileLoading, error: profileError } = useOrganizerProfile()
  const [activeTab, setActiveTab] = useState("basic")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Logs de diagnóstico de autenticación
  console.log('🔍 Estado de autenticación:', {
    isAuthenticated,
    isLoadingSession,
    hasUser: !!user,
    hasToken: !!accessToken,
    user: user,
    tokenLength: accessToken?.length || 0
  })

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      titulo: "",
      descripcion: "",
      fecha_inicio: undefined,
      fecha_fin: undefined,
      hora_inicio: "09:00",
      hora_fin: "18:00",
      imagen: "",
      ubicacion: "",
      latitud: undefined,
      longitud: undefined,
      capacidad: "50",
      id_categoria: "",
    },
  })

  // Log para verificar el estado del formulario
  console.log('🔍 Estado del formulario:', {
    formState: form.formState,
    errors: form.formState.errors,
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
    values: form.getValues()
  })

  // Mostrar loading mientras se verifica el perfil
  if (profileLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link href="/organizers/dashboard/events" className="inline-block mb-4">
              <Button variant="ghost" className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Volver a eventos
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Crear nuevo evento</h1>
              <p className="text-muted-foreground">Verificando tu perfil de organizador...</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  // Mostrar error si no hay perfil de organizador
  if (profileError || !profile?.hasProfile) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link href="/organizers/dashboard/events" className="inline-block mb-4">
              <Button variant="ghost" className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Volver a eventos
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Crear nuevo evento</h1>
              <p className="text-muted-foreground">No puedes crear eventos sin un perfil de organizador</p>
            </div>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Perfil de organizador requerido</h3>
                <p className="text-muted-foreground max-w-md">
                  {profileError || 'No tienes un perfil de organizador asociado. Debes crear un perfil de organizador antes de poder crear eventos.'}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href="/organizers/profile">
                  <Button className="gap-2">
                    <Calendar className="h-4 w-4" />
                    Crear perfil de organizador
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  async function onSubmit(data: EventFormValues) {
    console.log('🔍 onSubmit llamado con datos:', data)
    console.log('🔍 accessToken:', accessToken ? 'Presente' : 'Ausente')
    console.log('🔍 Estado completo de auth:', { isAuthenticated, user, accessToken })
    
    if (!accessToken) {
      toast.error("No tienes sesión activa. Por favor inicia sesión nuevamente.")
      router.push('/login')
      return
    }

    if (!isAuthenticated) {
      toast.error("No estás autenticado. Por favor inicia sesión.")
      router.push('/login')
      return
    }

    // Validación adicional de campos requeridos
    if (!data.titulo || data.titulo.length < 3) {
      toast.error("El título debe tener al menos 3 caracteres")
      return
    }

    if (!data.fecha_inicio || !data.fecha_fin) {
      toast.error("Debes seleccionar fechas de inicio y fin")
      return
    }

    if (!data.capacidad || parseInt(data.capacidad) < 1) {
      toast.error("La capacidad debe ser mayor a 0")
      return
    }

    if (!data.id_categoria) {
      toast.error("Debes seleccionar una categoría")
      return
    }

    setIsLoading(true)
    try {
      console.log('🔄 Procesando datos del formulario...')
      
      // Preparar datos exactamente como los espera el back-end
      const eventoData: any = {
        titulo: data.titulo,
        descripcion: data.descripcion || undefined,
        fecha_inicio: data.fecha_inicio.toISOString().split('T')[0], // Solo fecha YYYY-MM-DD
        fecha_fin: data.fecha_fin.toISOString().split('T')[0], // Solo fecha YYYY-MM-DD
        hora_inicio: data.hora_inicio || undefined,
        hora_fin: data.hora_fin || undefined,
        ubicacion: data.ubicacion || undefined,
        capacidad: parseInt(data.capacidad), // Convertir a integer como espera el back-end
        id_categoria: parseInt(data.id_categoria), // Convertir a integer como espera el back-end
        id_estado_evento: 1 // Borrador por defecto - requiere aprobación del admin
      }

      // Solo agregar imagen si es una URL válida y no está vacía
      if (data.imagen && data.imagen.trim() !== "") {
        eventoData.imagen = data.imagen.trim()
      }

      // Solo agregar coordenadas si tienen valores válidos
      if (data.latitud !== undefined && data.latitud !== null && data.latitud !== 0) {
        eventoData.latitud = Number(data.latitud)
      }
      if (data.longitud !== undefined && data.longitud !== null && data.longitud !== 0) {
        eventoData.longitud = Number(data.longitud)
      }

      console.log('📤 Enviando datos al API:', eventoData)
      console.log('🌐 URL del API:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000')

      await api.eventos.create(eventoData, accessToken)
      console.log('✅ Evento creado exitosamente')
      toast.success("Evento creado exitosamente como borrador. Espera la aprobación del administrador.")
      router.push("/organizers/dashboard/events")
    } catch (error: any) {
      console.error('❌ Error al crear evento:', error)
      console.error('❌ Detalles del error:', error.response?.data || error.message)
      
      // Manejar diferentes tipos de errores
      let errorMessage = "Error al crear el evento"
      
      if (error.response?.status === 403) {
        errorMessage = "No tienes permisos para crear eventos. Verifica que tengas un perfil de organizador."
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.error || "Datos de entrada inválidos. Verifica la información del formulario."
      } else if (error.response?.status === 500) {
        errorMessage = "Error interno del servidor. Intenta nuevamente más tarde."
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  function onError(errors: any) {
    console.error('❌ Errores de validación del formulario:', errors)
    toast.error("Por favor corrige los errores en el formulario")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/organizers/dashboard/events" className="inline-block mb-4">
            <Button variant="ghost" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Volver a eventos
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Crear nuevo evento</h1>
            <p className="text-muted-foreground">Completa la información para crear tu evento (se creará como borrador)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Botones eliminados para simplificar la interfaz */}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Información básica</TabsTrigger>
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="media">Imagen</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="titulo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título del evento</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Concierto de rock en vivo" {...field} />
                        </FormControl>
                        <FormDescription>Este será el nombre principal de tu evento.</FormDescription>
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
                          <Textarea placeholder="Describe tu evento..." className="min-h-32" {...field} />
                        </FormControl>
                        <FormDescription>Proporciona detalles sobre tu evento para atraer asistentes.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="id_categoria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORIAS_EVENTO.map((categoria) => (
                              <SelectItem key={categoria.id} value={categoria.id.toString()}>
                                {categoria.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Selecciona la categoría que mejor describe tu evento.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => setActiveTab("details")}>Siguiente: Detalles</Button>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fecha_inicio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de inicio</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: es })
                                  ) : (
                                    <span>Selecciona una fecha</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fecha_fin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de fin</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: es })
                                  ) : (
                                    <span>Selecciona una fecha</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="hora_inicio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hora de inicio</FormLabel>
                          <FormControl>
                            <Input 
                              type="time" 
                              placeholder="09:00" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>Hora exacta de inicio del evento.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hora_fin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hora de fin</FormLabel>
                          <FormControl>
                            <Input 
                              type="time" 
                              placeholder="18:00" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>Hora exacta de finalización del evento.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <FormField
                    control={form.control}
                    name="ubicacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ubicación</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Ej. Teatro Municipal, Av. Principal 123" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>Dirección completa donde se realizará el evento.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="capacidad"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacidad</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Ej. 100" min="1" {...field} />
                        </FormControl>
                        <FormDescription>Número máximo de asistentes.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("basic")}>
                Anterior: Información básica
              </Button>
              <Button onClick={() => setActiveTab("media")}>Siguiente: Imagen</Button>
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Imagen del evento</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Sube una imagen que represente tu evento. Es opcional pero recomendado.
                    </p>

                    <ImageUpload
                      onImageUpload={(imageUrl) => {
                        form.setValue('imagen', imageUrl)
                      }}
                      currentImage={form.watch("imagen")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("details")}>
                Anterior: Detalles
              </Button>
              <Button onClick={form.handleSubmit(onSubmit, onError)} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando evento...
                  </>
                ) : (
                  "Publicar evento"
                )}
              </Button>
            </div>
          </TabsContent>
        </Form>
      </Tabs>
    </div>
  )
}
