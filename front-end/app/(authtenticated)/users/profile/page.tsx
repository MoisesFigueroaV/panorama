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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Camera, Lock, LogOut, Bell, Bookmark, Home } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { apiClient } from "@/lib/api/apiClient"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"
import { CategoriaTags } from "@/components/ui/categoria-tag"
import { CATEGORIAS } from "@/constants/categorias"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

// Esquema de validación para el formulario de perfil personal
const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  email: z.string().optional(),
  bio: z
    .string()
    .max(500, {
      message: "La biografía no puede tener más de 500 caracteres.",
    })
    .optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  interests: z.array(z.string())
    .min(1, "Selecciona al menos un interés")
    .refine(
      (interests) => interests.every(interest => 
        CATEGORIAS.some(cat => cat.nombre === interest && cat.nombre !== "Otros")
      ),
      "Solo puedes seleccionar categorías válidas"
    ),
})

// Esquema de validación para el formulario de seguridad
const securityFormSchema = z
  .object({
    currentPassword: z.string().min(8, {
      message: "La contraseña actual debe tener al menos 8 caracteres.",
    }),
    newPassword: z.string().min(8, {
      message: "La nueva contraseña debe tener al menos 8 caracteres.",
    }),
    confirmPassword: z.string().min(8, {
      message: "La confirmación de contraseña debe tener al menos 8 caracteres.",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

// Esquema de validación para el formulario de notificaciones
const notificationsFormSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  eventReminders: z.boolean(),
  newEvents: z.boolean(),
  promotions: z.boolean(),
})

// Tipo para los valores del formulario de perfil
type ProfileFormValues = z.infer<typeof profileFormSchema>
type SecurityFormValues = z.infer<typeof securityFormSchema>
type NotificationsFormValues = z.infer<typeof notificationsFormSchema>

// Valores por defecto para el formulario de perfil
const defaultValues: Partial<ProfileFormValues> = {
  name: "María González",
  email: "maria@ejemplo.com",
  bio: "Amante de los conciertos y eventos culturales. Siempre buscando nuevas experiencias.",
  phone: "+56 9 8765 4321",
  location: "Santiago, Chile",
  interests: ["Música", "Arte", "Gastronomía", "Deportes"],
}

// Valores por defecto para el formulario de notificaciones
const defaultNotificationValues: NotificationsFormValues = {
  emailNotifications: true,
  pushNotifications: true,
  eventReminders: true,
  newEvents: true,
  promotions: false,
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [avatar, setAvatar] = useState<string>(user?.foto_perfil || "/placeholder.svg?height=128&width=128")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [unreadNotifications, setUnreadNotifications] = useState<number>(3) // Placeholder para notificaciones no leídas

  // Efecto para actualizar el avatar cuando cambia el usuario
  useEffect(() => {
    if (user?.foto_perfil) {
      setAvatar(user.foto_perfil)
    }
  }, [user?.foto_perfil])

  // Log para depuración
  useEffect(() => {
    console.log('Datos del usuario:', user)
  }, [user])

  // Formulario de perfil personal
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.nombre_usuario || "",
      email: user?.correo || "",
      bio: user?.biografia || "",
      phone: "", // No tenemos este campo en el backend
      location: "", // No tenemos este campo en el backend
      interests: user?.intereses || [],
    },
    mode: "onChange",
  })

  // Actualizar los valores del formulario cuando cambia el usuario
  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.nombre_usuario || "",
        email: user.correo || "",
        bio: user.biografia || "",
        phone: "", // No tenemos este campo en el backend
        location: "", // No tenemos este campo en el backend
        interests: user.intereses || [],
      })
    }
  }, [user, profileForm])

  // Formulario de seguridad
  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  })

  // Formulario de notificaciones
  const notificationsForm = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: defaultNotificationValues,
    mode: "onChange",
  })

  // Función para manejar el envío del formulario de perfil
  async function onProfileSubmit(data: ProfileFormValues) {
    setIsLoading(true)
    setSuccessMessage(null)
    try {
      console.log('Datos del formulario:', data);
      console.log('Intereses seleccionados:', data.interests);
      
      const updateData = {
        nombre_usuario: data.name,
        biografia: data.bio,
        intereses: data.interests,
        foto_perfil: avatar,
      }
      
      console.log('Datos a enviar al backend:', updateData);
      
      const response = await apiClient.put('/usuarios/yo', updateData)
      console.log('Respuesta del backend:', response.data);

      setSuccessMessage("Tu información personal ha sido actualizada correctamente.")
      toast({
        title: "Perfil actualizado",
        description: "Tu información personal ha sido actualizada correctamente.",
      })
    } catch (error: any) {
      console.error('Error completo al actualizar perfil:', error);
      if (error.response) {
        console.error('Datos de la respuesta de error:', error.response.data);
      }
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo actualizar tu perfil. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Función para manejar el envío del formulario de seguridad
  async function onSecuritySubmit(data: SecurityFormValues) {
    setIsLoading(true)
    setSuccessMessage(null)
    try {
      await apiClient.put('/usuarios/yo/contrasena', {
        contrasena_actual: data.currentPassword,
        nueva_contrasena: data.newPassword
      });

      setSuccessMessage("Tu contraseña ha sido actualizada correctamente.")
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido actualizada correctamente.",
      });

      // Limpiar el formulario
      securityForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error('Error al actualizar contraseña:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo actualizar la contraseña. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Función para manejar el envío del formulario de notificaciones
  function onNotificationsSubmit(data: NotificationsFormValues) {
    setIsLoading(true)

    // Simulamos una petición a la API
    setTimeout(() => {
      console.log(data)
      setIsLoading(false)
      toast({
        title: "Preferencias actualizadas",
        description: "Tus preferencias de notificaciones han sido actualizadas correctamente.",
      })
    }, 1000)
  }

  return (
    <div className="container py-10 space-y-6">
      {/* Nueva barra superior */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Home className="h-5 w-5" />
              <span className="sr-only">Ir a inicio</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
            <p className="text-sm text-muted-foreground">Administra tu información personal y preferencias</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón de notificaciones */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadNotifications}
                  </Badge>
                )}
                <span className="sr-only">Ver notificaciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-y-auto">
                {/* Placeholder para notificaciones */}
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-4 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    <span className="font-medium">Nuevo evento</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Se ha creado un nuevo evento que coincide con tus intereses
                  </p>
                  <span className="text-xs text-muted-foreground">Hace 2 horas</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-4 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    <span className="font-medium">Recordatorio</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tu evento guardado comienza en 24 horas
                  </p>
                  <span className="text-xs text-muted-foreground">Hace 5 horas</span>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-primary cursor-pointer">
                Ver todas las notificaciones
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Menú de usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={avatar} alt={user?.nombre_usuario || "Usuario"} />
                  <AvatarFallback>{user?.nombre_usuario?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/users/profile" className="cursor-pointer">
                  <Camera className="mr-2 h-4 w-4" />
                  <span>Editar Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/users/profile?tab=security" className="cursor-pointer">
                  <Lock className="mr-2 h-4 w-4" />
                  <span>Seguridad</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={async () => {
                  try {
                    await logout();
                    toast({
                      title: "Sesión cerrada",
                      description: "Has cerrado sesión exitosamente.",
                    });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Hubo un problema al cerrar sesión. Por favor, intenta de nuevo.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">¡Éxito!</AlertTitle>
          <AlertDescription className="text-green-700">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <Alert>
          <AlertTitle>Cargando...</AlertTitle>
          <AlertDescription>Obteniendo datos del usuario...</AlertDescription>
        </Alert>
      )}

      {!isLoading && !user && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>No se pudieron cargar los datos del usuario. Por favor, intenta recargar la página.</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Información Personal</TabsTrigger>
          <TabsTrigger value="saved">Eventos Guardados</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
        </TabsList>

        {/* Pestaña de información personal */}
        <TabsContent value="personal" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
            {/* Tarjeta de avatar */}
            <Card>
              <CardHeader>
                <CardTitle>Foto de perfil</CardTitle>
                <CardDescription>Esta imagen será visible para otros usuarios y organizadores.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-6">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={user?.foto_perfil || "/placeholder.svg"} alt={user?.nombre_usuario || "Usuario"} />
                  <AvatarFallback>{user?.nombre_usuario?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <Button variant="outline" className="gap-2">
                  <Camera className="h-4 w-4" />
                  Cambiar foto
                </Button>

                <Separator className="my-4" />

                <div className="w-full space-y-4">
                  <h3 className="font-semibold text-lg">Información actual</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">Nombre</p>
                      <p className="text-foreground">{user?.nombre_usuario || "No especificado"}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Correo electrónico</p>
                      <p className="text-foreground">{user?.correo || "No especificado"}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Biografía</p>
                      <p className="text-foreground whitespace-pre-wrap">
                        {user?.biografia || "No has agregado una biografía aún."}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Intereses</h4>
                      {user ? (
                        <CategoriaTags categorias={user.intereses || []} />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No has especificado intereses aún.
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Fecha de registro</p>
                      <p className="text-sm">
                        {user?.fecha_registro ? (
                          new Date(user.fecha_registro).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        ) : (
                          'No disponible'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Formulario de información personal */}
            <Card>
              <CardHeader>
                <CardTitle>Información personal</CardTitle>
                <CardDescription>Actualiza tu información personal y de contacto.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input placeholder="Tu nombre" {...field} />
                          </FormControl>
                          <FormDescription>Este es el nombre que se mostrará en tu cuenta.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo electrónico</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled 
                              value={user?.correo || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            El correo electrónico no se puede modificar.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono</FormLabel>
                          <FormControl>
                            <Input placeholder="+56 9 1234 5678" {...field} />
                          </FormControl>
                          <FormDescription>Este número se usará para notificaciones importantes.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ubicación</FormLabel>
                          <FormControl>
                            <Input placeholder="Ciudad, País" {...field} />
                          </FormControl>
                          <FormDescription>Tu ubicación nos ayuda a mostrarte eventos cercanos.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="interests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Intereses</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {CATEGORIAS.filter(categoria => categoria.nombre !== "Otros").map((categoria) => (
                                  <div key={categoria.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`interes-${categoria.id}`}
                                      checked={(field.value as string[])?.includes(categoria.nombre)}
                                      onCheckedChange={(checked) => {
                                        const currentIntereses = (field.value as string[]) || [];
                                        if (checked) {
                                          field.onChange([...currentIntereses, categoria.nombre]);
                                        } else {
                                          field.onChange(
                                            currentIntereses.filter((i: string) => i !== categoria.nombre)
                                          );
                                        }
                                      }}
                                    />
                                    <Label
                                      htmlFor={`interes-${categoria.id}`}
                                      className="text-sm font-normal cursor-pointer"
                                    >
                                      {categoria.nombre}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                              {(field.value as string[])?.length > 0 && (
                                <p className="text-sm text-muted-foreground">
                                  {(field.value as string[]).length} intereses seleccionados
                                </p>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Biografía</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Cuéntanos sobre ti..." className="resize-none" {...field} />
                          </FormControl>
                          <FormDescription>Una breve descripción sobre ti.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Guardando..." : "Guardar cambios"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña de seguridad */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seguridad</CardTitle>
              <CardDescription>Actualiza tu contraseña y gestiona tu sesión.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...securityForm}>
                <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                  <FormField
                    control={securityForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña actual</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={securityForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nueva contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormDescription>La contraseña debe tener al menos 8 caracteres.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={securityForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar nueva contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Actualizando..." : "Actualizar contraseña"}
                  </Button>
                </form>
              </Form>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Sesión</h3>
                <p className="text-sm text-muted-foreground">
                  Cierra tu sesión actual. Tendrás que volver a iniciar sesión para acceder a tu cuenta.
                </p>
                <Button 
                  variant="destructive" 
                  className="w-full sm:w-auto"
                  onClick={async () => {
                    try {
                      await logout();
                      toast({
                        title: "Sesión cerrada",
                        description: "Has cerrado sesión exitosamente.",
                      });
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Hubo un problema al cerrar sesión. Por favor, intenta de nuevo.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de eventos guardados */}
        <TabsContent value="saved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bookmark className="h-5 w-5" />
                Eventos Guardados
              </CardTitle>
              <CardDescription>
                Tus eventos favoritos y guardados para ver más tarde.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Placeholder para eventos guardados */}
                <div className="rounded-lg border p-4">
                  <div className="aspect-video relative mb-4 bg-muted rounded-md">
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      Imagen del evento
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">Nombre del Evento</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Breve descripción del evento...
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Fecha del evento
                    </div>
                    <Button variant="outline" size="sm">
                      Ver detalles
                    </Button>
                  </div>
                </div>
                {/* Puedes duplicar este placeholder para más eventos */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de notificaciones */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Bandeja de Entrada
              </CardTitle>
              <CardDescription>
                Tus notificaciones y actualizaciones recientes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Placeholder para notificaciones */}
                <div className="flex items-start gap-4 p-4 rounded-lg border">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Bell className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">
                      Título de la notificación
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Descripción de la notificación...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Hace 2 horas
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Marcar como leída
                  </Button>
                </div>

                {/* Filtros de notificaciones */}
                <div className="flex flex-wrap gap-2 mt-6">
                  <Button variant="outline" size="sm" className="rounded-full">
                    Todas
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-full">
                    No leídas
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-full">
                    Eventos
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-full">
                    Sistema
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
