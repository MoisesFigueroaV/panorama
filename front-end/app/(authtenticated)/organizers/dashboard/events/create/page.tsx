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
}

export default function CreateEventPage() {
  const [activeTab, setActiveTab] = useState("basic")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { accessToken, user, isAuthenticated, isLoadingSession } = useAuth()

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
    defaultValues,
  })

  // Log para verificar el estado del formulario
  console.log('🔍 Estado del formulario:', {
    formState: form.formState,
    errors: form.formState.errors,
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
    values: form.getValues()
  })

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
        ubicacion: data.ubicacion || undefined,
        capacidad: parseInt(data.capacidad), // Convertir a integer como espera el back-end
        id_categoria: parseInt(data.id_categoria), // Convertir a integer como espera el back-end
        latitud: data.latitud || undefined,
        longitud: data.longitud || undefined,
        id_estado_evento: 2 // Publicado por defecto
      }

      // Solo agregar imagen si es una URL válida
      if (data.imagen && data.imagen.trim() !== "") {
        eventoData.imagen = data.imagen.trim()
      }

      console.log('📤 Enviando datos al API:', eventoData)
      console.log('🌐 URL del API:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000')

      await api.eventos.create(eventoData, accessToken)
      console.log('✅ Evento creado exitosamente')
      toast.success("Evento creado exitosamente")
      router.push("/organizers/dashboard/events")
    } catch (error: any) {
      console.error('❌ Error al crear evento:', error)
      console.error('❌ Detalles del error:', error.response?.data || error.message)
      toast.error(error.message || "Error al crear el evento")
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
            <p className="text-muted-foreground">Completa la información para publicar tu evento</p>
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
                      Proporciona la URL de una imagen que represente tu evento. Es opcional.
                    </p>

                    <FormField
                      control={form.control}
                      name="imagen"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL de la imagen</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://ejemplo.com/imagen-evento.jpg" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Ingresa la URL completa de una imagen (JPG, PNG, GIF). Debe ser una URL pública accesible.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Vista previa de la imagen si se proporciona una URL */}
                    {form.watch("imagen") && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Vista previa:</h4>
                        <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                          <img
                            src={form.watch("imagen")}
                            alt="Vista previa del evento"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg"
                              toast.error("No se pudo cargar la imagen. Verifica que la URL sea correcta.")
                            }}
                          />
                        </div>
                      </div>
                    )}
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
