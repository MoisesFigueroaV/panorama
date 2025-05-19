import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Gestiona la configuración de la plataforma</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de la plataforma</CardTitle>
              <CardDescription>Configura la información básica de la plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">Nombre de la plataforma</Label>
                  <Input id="platform-name" defaultValue="Panorama" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email de contacto</Label>
                  <Input id="contact-email" defaultValue="contacto@panorama.com" type="email" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform-description">Descripción</Label>
                <Textarea
                  id="platform-description"
                  defaultValue="Plataforma de eventos culturales y de entretenimiento"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Zona horaria</Label>
                  <Select defaultValue="america_santiago">
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Seleccionar zona horaria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america_santiago">América/Santiago</SelectItem>
                      <SelectItem value="america_bogota">América/Bogotá</SelectItem>
                      <SelectItem value="america_mexico_city">América/Ciudad de México</SelectItem>
                      <SelectItem value="america_buenos_aires">América/Buenos Aires</SelectItem>
                      <SelectItem value="europe_madrid">Europa/Madrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma predeterminado</Label>
                  <Select defaultValue="es">
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Seleccionar idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">Inglés</SelectItem>
                      <SelectItem value="pt">Portugués</SelectItem>
                      <SelectItem value="fr">Francés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Cancelar</Button>
              <Button>Guardar cambios</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración de eventos</CardTitle>
              <CardDescription>Configura los parámetros para la creación y gestión de eventos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Aprobación manual de eventos</Label>
                  <p className="text-sm text-muted-foreground">
                    Requiere aprobación de un administrador para publicar eventos
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Límite de eventos por organizador</Label>
                  <p className="text-sm text-muted-foreground">
                    Establece un límite máximo de eventos activos por organizador
                  </p>
                </div>
                <div className="w-20">
                  <Input type="number" defaultValue="10" min="1" />
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Permitir eventos privados</Label>
                  <p className="text-sm text-muted-foreground">
                    Permite a los organizadores crear eventos privados con acceso restringido
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Cancelar</Button>
              <Button>Guardar cambios</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personalización</CardTitle>
              <CardDescription>Personaliza la apariencia de la plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tema de color</Label>
                <div className="grid grid-cols-5 gap-2">
                  <div className="w-10 h-10 rounded-full bg-[#f47c6c] cursor-pointer ring-2 ring-offset-2 ring-[#f47c6c]"></div>
                  <div className="w-10 h-10 rounded-full bg-[#f9a05d] cursor-pointer"></div>
                  <div className="w-10 h-10 rounded-full bg-[#a3d7e0] cursor-pointer"></div>
                  <div className="w-10 h-10 rounded-full bg-[#f1c84b] cursor-pointer"></div>
                  <div className="w-10 h-10 rounded-full bg-[#fdf1e8] cursor-pointer border"></div>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo oscuro</Label>
                  <p className="text-sm text-muted-foreground">Activa el modo oscuro para la plataforma</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="logo">Logo de la plataforma</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                    <span className="font-bold text-xl">P</span>
                  </div>
                  <Button variant="outline">Cambiar logo</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Cancelar</Button>
              <Button>Guardar cambios</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Página de inicio</CardTitle>
              <CardDescription>Configura la apariencia de la página de inicio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mostrar eventos destacados</Label>
                  <p className="text-sm text-muted-foreground">
                    Muestra una sección de eventos destacados en la página de inicio
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mostrar organizadores destacados</Label>
                  <p className="text-sm text-muted-foreground">
                    Muestra una sección de organizadores destacados en la página de inicio
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mostrar testimonios</Label>
                  <p className="text-sm text-muted-foreground">
                    Muestra una sección de testimonios de usuarios en la página de inicio
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Cancelar</Button>
              <Button>Guardar cambios</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de notificaciones</CardTitle>
              <CardDescription>Configura las notificaciones del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones por email</Label>
                  <p className="text-sm text-muted-foreground">Envía notificaciones por email a los usuarios</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones push</Label>
                  <p className="text-sm text-muted-foreground">Envía notificaciones push a los usuarios</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones de nuevos eventos</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifica a los usuarios cuando se publican nuevos eventos de su interés
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones de reportes</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifica a los administradores cuando se reciben nuevos reportes
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Cancelar</Button>
              <Button>Guardar cambios</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plantillas de email</CardTitle>
              <CardDescription>Configura las plantillas de email para las notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="welcome-template">Plantilla de bienvenida</Label>
                <Textarea
                  id="welcome-template"
                  defaultValue="¡Bienvenido a Panorama! Gracias por registrarte en nuestra plataforma de eventos."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-approval-template">Plantilla de aprobación de evento</Label>
                <Textarea
                  id="event-approval-template"
                  defaultValue="¡Felicidades! Tu evento ha sido aprobado y ya está publicado en Panorama."
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Cancelar</Button>
              <Button>Guardar cambios</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seguridad de la cuenta</CardTitle>
              <CardDescription>Configura las opciones de seguridad de la plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autenticación de dos factores</Label>
                  <p className="text-sm text-muted-foreground">Requiere verificación adicional al iniciar sesión</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Bloqueo de cuenta</Label>
                  <p className="text-sm text-muted-foreground">
                    Bloquea la cuenta después de múltiples intentos fallidos
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="max-attempts">Intentos máximos de inicio de sesión</Label>
                <Input id="max-attempts" type="number" defaultValue="5" min="1" max="10" className="w-20" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Cancelar</Button>
              <Button>Guardar cambios</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Políticas de privacidad</CardTitle>
              <CardDescription>Configura las políticas de privacidad de la plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="privacy-policy">Política de privacidad</Label>
                <Textarea
                  id="privacy-policy"
                  defaultValue="Panorama se compromete a proteger la privacidad de sus usuarios..."
                  rows={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="terms-of-service">Términos de servicio</Label>
                <Textarea
                  id="terms-of-service"
                  defaultValue="Al utilizar Panorama, aceptas los siguientes términos y condiciones..."
                  rows={5}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Cancelar</Button>
              <Button>Guardar cambios</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Claves API</CardTitle>
              <CardDescription>Gestiona las claves API para integraciones externas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">Clave API</Label>
                <div className="flex gap-2">
                  <Input id="api-key" defaultValue="sk_live_51NxXXXXXXXXXXXXXXXXXXXXXX" type="password" />
                  <Button variant="outline">Mostrar</Button>
                  <Button variant="outline">Regenerar</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook-url">URL de Webhook</Label>
                <Input id="webhook-url" defaultValue="https://api.panorama.com/webhooks/events" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Cancelar</Button>
              <Button>Guardar cambios</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integraciones</CardTitle>
              <CardDescription>Configura las integraciones con servicios externos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Google Maps API</Label>
                  <p className="text-sm text-muted-foreground">Integración para mostrar mapas y ubicaciones</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Pasarela de pagos</Label>
                  <p className="text-sm text-muted-foreground">Integración para procesar pagos de tickets</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Redes sociales</Label>
                  <p className="text-sm text-muted-foreground">Integración para compartir eventos en redes sociales</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Cancelar</Button>
              <Button>Guardar cambios</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
