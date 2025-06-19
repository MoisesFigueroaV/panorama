import { db } from '../db/drizzle';
import { categoriaEventoTable } from '../db/schema/categoriaEvento.schema';
import { estadoEventoTable } from '../db/schema/estadoEvento.schema';

const categorias = [
  { nombre_categoria: "Música" },
  { nombre_categoria: "Arte y Cultura" },
  { nombre_categoria: "Gastronomía" },
  { nombre_categoria: "Deportes" },
  { nombre_categoria: "Tecnología" },
  { nombre_categoria: "Educación" },
  { nombre_categoria: "Negocios" },
  { nombre_categoria: "Otro" }
];

const estados = [
  { nombre_estado: "Borrador", descripcion: "Evento en borrador" },
  { nombre_estado: "Publicado", descripcion: "Evento publicado" },
  { nombre_estado: "Cancelado", descripcion: "Evento cancelado" },
  { nombre_estado: "Finalizado", descripcion: "Evento finalizado" }
];

async function seedCategorias() {
  console.log('🌱 Iniciando seed de categorías...');
  
  try {
    // Insertar categorías
    for (const categoria of categorias) {
      try {
        await db.insert(categoriaEventoTable).values(categoria);
        console.log(`✅ Categoría "${categoria.nombre_categoria}" creada`);
      } catch (error: any) {
        if (error.message.includes('duplicate key')) {
          console.log(`⚠️ Categoría "${categoria.nombre_categoria}" ya existe`);
        } else {
          console.error(`❌ Error al crear categoría "${categoria.nombre_categoria}":`, error);
        }
      }
    }

    // Insertar estados
    for (const estado of estados) {
      try {
        await db.insert(estadoEventoTable).values(estado);
        console.log(`✅ Estado "${estado.nombre_estado}" creado`);
      } catch (error: any) {
        if (error.message.includes('duplicate key')) {
          console.log(`⚠️ Estado "${estado.nombre_estado}" ya existe`);
        } else {
          console.error(`❌ Error al crear estado "${estado.nombre_estado}":`, error);
        }
      }
    }

    console.log('✅ Seed completado');
  } catch (error) {
    console.error('❌ Error en seed:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedCategorias().then(() => {
    console.log('🎉 Script completado');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Error:', error);
    process.exit(1);
  });
}

export { seedCategorias }; 