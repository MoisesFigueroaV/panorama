export type Categoria = {
  id: number;
  nombre: string;
  color: string;
  bgColor: string;
};

export const CATEGORIAS: Categoria[] = [
  {
    id: 1,
    nombre: "Música",
    color: "#2563eb", // blue-600
    bgColor: "#dbeafe", // blue-100
  },
  {
    id: 2,
    nombre: "Deportes",
    color: "#16a34a", // green-600
    bgColor: "#dcfce7", // green-100
  },
  {
    id: 3,
    nombre: "Arte",
    color: "#9333ea", // purple-600
    bgColor: "#f3e8ff", // purple-100
  },
  {
    id: 4,
    nombre: "Gastronomía",
    color: "#ea580c", // orange-600
    bgColor: "#ffedd5", // orange-100
  },
  {
    id: 5,
    nombre: "Tecnología",
    color: "#0891b2", // cyan-600
    bgColor: "#cffafe", // cyan-100
  },
  {
    id: 6,
    nombre: "Educación",
    color: "#4f46e5", // indigo-600
    bgColor: "#e0e7ff", // indigo-100
  },
  {
    id: 7,
    nombre: "Entretenimiento",
    color: "#be185d", // pink-600
    bgColor: "#fce7f3", // pink-100
  },
  {
    id: 8,
    nombre: "Otros",
    color: "#6b7280", // gray-600
    bgColor: "#f3f4f6", // gray-100
  },
];

export const getCategoriaByNombre = (nombre: string): Categoria => {
  const categoria = CATEGORIAS.find(cat => 
    cat.nombre.toLowerCase() === nombre.toLowerCase()
  );
  return categoria || CATEGORIAS[CATEGORIAS.length - 1]; // Retorna "Otros" si no encuentra la categoría
}; 