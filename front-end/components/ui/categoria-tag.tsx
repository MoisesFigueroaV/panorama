import { cn } from "@/lib/utils";
import { Categoria, getCategoriaByNombre } from "@/constants/categorias";

interface CategoriaTagProps {
  nombre: string;
  className?: string;
}

export function CategoriaTag({ nombre, className }: CategoriaTagProps) {
  const categoria = getCategoriaByNombre(nombre);

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        className
      )}
      style={{
        color: categoria.color,
        backgroundColor: categoria.bgColor,
      }}
    >
      {categoria.nombre}
    </span>
  );
}

interface CategoriaTagsProps {
  categorias: string[];
  className?: string;
}

export function CategoriaTags({ categorias, className }: CategoriaTagsProps) {
  if (!categorias || !Array.isArray(categorias) || categorias.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No has especificado intereses aún.
      </p>
    );
  }

  // Filtrar cualquier valor nulo o indefinido
  const categoriasValidas = categorias.filter((categoria): categoria is string => 
    typeof categoria === 'string' && categoria.trim().length > 0
  );

  if (categoriasValidas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No has especificado intereses aún.
      </p>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {categoriasValidas.map((categoria, index) => (
        <CategoriaTag key={index} nombre={categoria} />
      ))}
    </div>
  );
} 