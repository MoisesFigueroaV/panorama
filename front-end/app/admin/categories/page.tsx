import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Plus, Search, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Datos de ejemplo
const categories = [
  {
    id: "music",
    name: "Música",
    description: "Conciertos, festivales y eventos musicales",
    eventsCount: 45,
    color: "#f47c6c",
    featured: true,
  },
  {
    id: "sports",
    name: "Deportes",
    description: "Eventos deportivos, torneos y competencias",
    eventsCount: 32,
    color: "#a3d7e0",
    featured: true,
  },
  {
    id: "food",
    name: "Gastronomía",
    description: "Festivales gastronómicos, catas y ferias de comida",
    eventsCount: 28,
    color: "#f9a05d",
    featured: true,
  },
  {
    id: "art",
    name: "Arte",
    description: "Exposiciones, galerías y eventos artísticos",
    eventsCount: 24,
    color: "#f1c84b",
    featured: false,
  },
  {
    id: "tech",
    name: "Tecnología",
    description: "Conferencias, hackathons y eventos tecnológicos",
    eventsCount: 18,
    color: "#f47c6c",
    featured: false,
  },
  {
    id: "outdoor",
    name: "Aire libre",
    description: "Actividades al aire libre, excursiones y aventuras",
    eventsCount: 15,
    color: "#a3d7e0",
    featured: false,
  },
  {
    id: "education",
    name: "Educación",
    description: "Talleres, cursos y eventos educativos",
    eventsCount: 12,
    color: "#f9a05d",
    featured: false,
  },
  {
    id: "business",
    name: "Negocios",
    description: "Networking, conferencias y eventos empresariales",
    eventsCount: 10,
    color: "#f1c84b",
    featured: false,
  },
]

export default function CategoriesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
          <p className="text-muted-foreground">Gestiona las categorías de eventos de la plataforma</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Buscar categorías..." className="pl-8 w-full md:w-[250px]" />
          </div>
          <Button className="gap-1">
            <Plus className="h-4 w-4" />
            <span>Nueva categoría</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total categorías</CardTitle>
            <Tag className="h-4 w-4 text-[#f47c6c]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">+1 desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías destacadas</CardTitle>
            <Tag className="h-4 w-4 text-[#f9a05d]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.filter((c) => c.featured).length}</div>
            <p className="text-xs text-muted-foreground">Sin cambios desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categoría más popular</CardTitle>
            <Tag className="h-4 w-4 text-[#a3d7e0]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.sort((a, b) => b.eventsCount - a.eventsCount)[0].name}</div>
            <p className="text-xs text-muted-foreground">
              {categories.sort((a, b) => b.eventsCount - a.eventsCount)[0].eventsCount} eventos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total eventos categorizados</CardTitle>
            <Tag className="h-4 w-4 text-[#f1c84b]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.reduce((acc, curr) => acc + curr.eventsCount, 0)}</div>
            <p className="text-xs text-muted-foreground">+24 desde el mes pasado</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div>
              <CardTitle>Lista de categorías</CardTitle>
              <CardDescription>Total: {categories.length} categorías</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Categoría</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Eventos</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Destacada</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: category.color }}></div>
                        <span>{category.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell>{category.eventsCount}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: category.color }}></div>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">{category.color}</code>
                      </div>
                    </TableCell>
                    <TableCell>
                      {category.featured ? (
                        <Badge className="bg-[#f9a05d] hover:bg-[#f9a05d]/90">Destacada</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted/50">
                          No destacada
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Editar categoría</DropdownMenuItem>
                          <DropdownMenuItem>Ver eventos</DropdownMenuItem>
                          {category.featured ? (
                            <DropdownMenuItem>Quitar de destacados</DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem>Marcar como destacada</DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600">Eliminar categoría</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
