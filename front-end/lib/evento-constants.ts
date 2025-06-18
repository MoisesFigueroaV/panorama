// Constantes para eventos que coinciden con el back-end

export const CATEGORIAS_EVENTO = [
  { id: 1, nombre: "Música" },
  { id: 2, nombre: "Arte y Cultura" },
  { id: 3, nombre: "Gastronomía" },
  { id: 4, nombre: "Deportes" },
  { id: 5, nombre: "Tecnología" },
  { id: 6, nombre: "Educación" },
  { id: 7, nombre: "Negocios" },
  { id: 8, nombre: "Otro" }
];

export const ESTADOS_EVENTO = [
  { id: 1, nombre: "Borrador" },
  { id: 2, nombre: "Publicado" },
  { id: 3, nombre: "Cancelado" },
  { id: 4, nombre: "Finalizado" }
];

// Mapeo de categorías del front-end al back-end
export const CATEGORIAS_MAPPING: Record<string, number> = {
  "music": 1,
  "arts": 2,
  "food": 3,
  "sports": 4,
  "technology": 5,
  "education": 6,
  "business": 7,
  "other": 8
};

// Función para obtener el ID de categoría por nombre
export const getCategoriaId = (nombre: string): number => {
  const categoria = CATEGORIAS_EVENTO.find(cat => 
    cat.nombre.toLowerCase() === nombre.toLowerCase()
  );
  return categoria?.id || 8; // Default a "Otro"
};

// Función para obtener el nombre de categoría por ID
export const getCategoriaNombre = (id: number): string => {
  const categoria = CATEGORIAS_EVENTO.find(cat => cat.id === id);
  return categoria?.nombre || "Otro";
}; 