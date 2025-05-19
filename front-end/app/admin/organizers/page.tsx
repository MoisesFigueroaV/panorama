import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Calendar,
  Check,
  Download,
  ExternalLink,
  Filter,
  MoreHorizontal,
  Search,
  Shield,
  SlidersHorizontal,
  Star,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Datos de ejemplo
const organizers = [
  {
    id: "1",
    name: "Producciones Urbanas",
    email: "contacto@produccionesurbanas.com",
    events: 12,
    followers: 1250,
    verified: true,
    status: "Activo",
    joinDate: "15 Mar 2022",
    rating: 4.8,
    avatar: "/placeholder.svg",
  },
  {
    id: "2",
    name: "Galería Central",
    email: "info@galeriacentral.com",
    events: 8,
    followers: 850,
    verified: true,
    status: "Activo",
    joinDate: "22 Ene 2022",
    rating: 4.5,
    avatar: "/placeholder.svg",
  },
  {
    id: "3",
    name: "Deportes Unidos",
    email: "eventos@deportesunidos.com",
    events: 15,
    followers: 2100,
    verified: true,
    status: "Activo",
    joinDate: "10 Dic 2021",
    rating: 4.9,
    avatar: "/placeholder.svg",
  },
  {
    id: "4",
    name: "TechHub",
    email: "info@techhub.com",
    events: 6,
    followers: 780,
    verified: false,
    status: "En revisión",
    joinDate: "05 Feb 2023",
    rating: 4.2,
    avatar: "/placeholder.svg",
  },
  {
    id: "5",
    name: "Sabores del Mundo",
    email: "contacto@saboresdelmundo.com",
    events: 9,
    followers: 1500,
    verified: false,
    status: "Activo",
    joinDate: "18 Abr 2022",
    rating: 4.7,
    avatar: "/placeholder.svg",
  },
]

export default function OrganizersPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizadores</h1>
          <p className="text-muted-foreground">Gestiona los organizadores de eventos de la plataforma</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar organizadores..."
              className="pl-8 w-full md:w-[250px] lg:w-[300px]"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex gap-1">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Filtros</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem>Todos los organizadores</DropdownMenuItem>
                <DropdownMenuItem>Verificados</DropdownMenuItem>
                <DropdownMenuItem>No verificados</DropdownMenuItem>
                <DropdownMenuItem>Más activos</DropdownMenuItem>
                <DropdownMenuItem>Mejor valorados</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total organizadores</CardTitle>
            <Shield className="h-4 w-4 text-[#f47c6c]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizers.length}</div>
            <p className="text-xs text-muted-foreground">+2 desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizadores verificados</CardTitle>
            <Check className="h-4 w-4 text-[#a3d7e0]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizers.filter((o) => o.verified).length}</div>
            <p className="text-xs text-muted-foreground">+1 desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos creados</CardTitle>
            <Calendar className="h-4 w-4 text-[#f9a05d]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizers.reduce((acc, curr) => acc + curr.events, 0)}</div>
            <p className="text-xs text-muted-foreground">+15 desde el mes pasado</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div>
              <CardTitle>Lista de organizadores</CardTitle>
              <CardDescription>Total: {organizers.length} organizadores registrados</CardDescription>
            </div>
            <Button variant="outline" className="w-full sm:w-auto gap-1">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all" className="w-full">
            <div className="border-b px-4 md:px-6">
              <TabsList className="w-full justify-start -mb-px">
                <TabsTrigger
                  value="all"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#f47c6c]"
                >
                  Todos
                </TabsTrigger>
                <TabsTrigger
                  value="verified"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#f47c6c]"
                >
                  Verificados
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#f47c6c]"
                >
                  En revisión
                </TabsTrigger>
                <TabsTrigger
                  value="active"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#f47c6c]"
                >
                  Más activos
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Organizador</TableHead>
                      <TableHead>Eventos</TableHead>
                      <TableHead>Seguidores</TableHead>
                      <TableHead>Verificado</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Valoración</TableHead>
                      <TableHead>Fecha de registro</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizers.map((organizer) => (
                      <TableRow key={organizer.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={organizer.avatar || "/placeholder.svg"} alt={organizer.name} />
                              <AvatarFallback>{organizer.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{organizer.name}</div>
                              <div className="text-xs text-muted-foreground">{organizer.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{organizer.events}</TableCell>
                        <TableCell>{organizer.followers.toLocaleString()}</TableCell>
                        <TableCell>
                          {organizer.verified ? (
                            <Badge className="bg-[#a3d7e0] text-white">Verificado</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-muted/50">
                              No verificado
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              organizer.status === "Activo"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-yellow-100 text-yellow-700 border-yellow-200"
                            }
                          >
                            {organizer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-[#f1c84b] text-[#f1c84b]" />
                            <span>{organizer.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell>{organizer.joinDate}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/organizers/${organizer.id}`} target="_blank">
                                <ExternalLink className="h-4 w-4" />
                                <span className="sr-only">Ver perfil público</span>
                              </Link>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Abrir menú</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                                <DropdownMenuItem>Editar información</DropdownMenuItem>
                                <DropdownMenuItem>Verificar organizador</DropdownMenuItem>
                                <DropdownMenuItem>Contactar</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">Suspender cuenta</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="verified" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Organizador</TableHead>
                      <TableHead>Eventos</TableHead>
                      <TableHead>Seguidores</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Valoración</TableHead>
                      <TableHead>Fecha de registro</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizers
                      .filter((o) => o.verified)
                      .map((organizer) => (
                        <TableRow key={organizer.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={organizer.avatar || "/placeholder.svg"} alt={organizer.name} />
                                <AvatarFallback>{organizer.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{organizer.name}</div>
                                <div className="text-xs text-muted-foreground">{organizer.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{organizer.events}</TableCell>
                          <TableCell>{organizer.followers.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                              {organizer.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-[#f1c84b] text-[#f1c84b]" />
                              <span>{organizer.rating}</span>
                            </div>
                          </TableCell>
                          <TableCell>{organizer.joinDate}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" asChild>
                                <Link href={`/organizers/${organizer.id}`} target="_blank">
                                  <ExternalLink className="h-4 w-4" />
                                  <span className="sr-only">Ver perfil público</span>
                                </Link>
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Abrir menú</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                                  <DropdownMenuItem>Editar información</DropdownMenuItem>
                                  <DropdownMenuItem>Contactar</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">Suspender cuenta</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="pending" className="m-0">
              <div className="p-6 text-center text-muted-foreground">Mostrando solo organizadores en revisión</div>
            </TabsContent>

            <TabsContent value="active" className="m-0">
              <div className="p-6 text-center text-muted-foreground">
                Mostrando organizadores ordenados por actividad
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
