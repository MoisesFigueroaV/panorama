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
import { CalendarIcon, ImagePlus, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

const eventFormSchema = z.object({
  title: z.string().min(5, {
    message: "El título debe tener al menos 5 caracteres",
  }),
  description: z.string().min(20, {
    message: "La descripción debe tener al menos 20 caracteres",
  }),
  category: z.string({
    required_error: "Por favor selecciona una categoría",
  }),
  date: z.date({
    required_error: "Por favor selecciona una fecha",
  }),
  time: z.string({
    required_error: "Por favor ingresa una hora",
  }),
  location: z.string().min(5, {
    message: "La ubicación debe tener al menos 5 caracteres",
  }),
  address: z.string().min(5, {
    message: "La dirección debe tener al menos 5 caracteres",
  }),
  capacity: z.string().optional(),
  organizer: z.string().optional(),
  image: z.string().optional(),
})

type EventFormValues = z.infer<typeof eventFormSchema>

const defaultValues: Partial<EventFormValues> = {
  title: "",
  description: "",
  category: "",
  time: "",
  location: "",
  address: "",
  capacity: "",
  organizer: "",
  image: "",
}

export default function CreateEventPage() {
  const [activeTab, setActiveTab] = useState("basic")
  const router = useRouter()

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues,
  })

  function onSubmit(data: EventFormValues) {
    console.log(data)
    // Aquí iría la lógica para guardar el evento
    router.push("/organizers/dashboard/events")
  }

  function saveAsDraft() {
    // Aquí iría la lógica para guardar como borrador
    router.push("/organizers/dashboard/events")
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
          <Button variant="outline" onClick={saveAsDraft}>
            Guardar borrador
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)}>Publicar evento</Button>
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
                    name="title"
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
                    name="description"
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
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="music">Música</SelectItem>
                            <SelectItem value="arts">Arte y cultura</SelectItem>
                            <SelectItem value="food">Gastronomía</SelectItem>
                            <SelectItem value="sports">Deportes</SelectItem>
                            <SelectItem value="technology">Tecnología</SelectItem>
                            <SelectItem value="education">Educación</SelectItem>
                            <SelectItem value="business">Negocios</SelectItem>
                            <SelectItem value="other">Otro</SelectItem>
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
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha</FormLabel>
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
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hora</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del lugar</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Teatro Municipal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Ej. Av. Principal 123" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>Dirección completa donde se realizará el evento.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacidad (opcional)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Ej. 100" {...field} />
                          </FormControl>
                          <FormDescription>Número máximo de asistentes.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="organizer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organizador (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. Nombre de la organización" {...field} />
                          </FormControl>
                          <FormDescription>Nombre del organizador o empresa.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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
                    <h3 className="text-lg font-medium">Imagen principal</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Esta imagen aparecerá como portada de tu evento. Es la única imagen que necesitas subir.
                    </p>

                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div
                              className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors h-64"
                              onClick={() => document.getElementById("image-upload")?.click()}
                            >
                              <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  // En una aplicación real, aquí subiríamos la imagen
                                  if (e.target.files && e.target.files[0]) {
                                    field.onChange(URL.createObjectURL(e.target.files[0]))
                                  }
                                }}
                              />
                              {field.value ? (
                                <div className="relative w-full h-full">
                                  <img
                                    src={field.value || "/placeholder.svg"}
                                    alt="Vista previa"
                                    className="w-full h-full object-contain"
                                  />
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      field.onChange("")
                                    }}
                                  >
                                    Eliminar
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                                  <p className="text-sm font-medium">Haz clic para subir</p>
                                  <p className="text-xs text-muted-foreground">SVG, PNG, JPG o GIF (máx. 2MB)</p>
                                </>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription>
                            Sube una imagen atractiva que represente tu evento. Esta será la única imagen visible.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("details")}>
                Anterior: Detalles
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={saveAsDraft}>
                  Guardar borrador
                </Button>
                <Button onClick={form.handleSubmit(onSubmit)}>Publicar evento</Button>
              </div>
            </div>
          </TabsContent>
        </Form>
      </Tabs>
    </div>
  )
}
