import { Hono } from 'hono'
import { supabase } from '../lib/supabase'

const evento = new Hono()

// POST /api/event
evento.post('/', async (c) => {
const body = await c.req.json()
const {
    titulo,
    descripcion,
    fecha_inicio,
    fecha_fin,
    ubicacion,
    capacidad,
    id_organizador,
    categorias // array de ids de categoría
} = body

if (!titulo || !fecha_inicio || !fecha_fin || !id_organizador || !ubicacion || !capacidad || !Array.isArray(categorias) || categorias.length === 0) {
    return c.json({ error: 'Faltan campos requeridos o categorías' }, 400)
}
if (new Date(fecha_inicio) > new Date(fecha_fin)) {
    return c.json({ error: 'La fecha de inicio debe ser anterior a la de fin' }, 400)
}

  // Insertar evento
const { data: nuevoEvento, error: eventoError } = await supabase
    .from('evento')
    .insert({
        titulo,
        descripcion,
        fecha_inicio,
        fecha_fin,
        ubicacion,
        capacidad,
        id_organizador,
        fecha_registro: new Date().toISOString().split('T')[0]
    })
    .select()
    .single()

if (eventoError || !nuevoEvento) {
    return c.json({ error: 'Error al crear el evento', detalle: eventoError?.message }, 500)
}

  // Insertar relaciones evento-categoría
const relaciones = categorias.map((id_categoria: number) => ({
    id_evento: nuevoEvento.id_evento,
    id_categoria
}))
const { error: relError } = await supabase
    .from('evento_categoria')
    .insert(relaciones)

if (relError) {
    // Rollback manual: eliminar el evento creado
    await supabase.from('evento').delete().eq('id_evento', nuevoEvento.id_evento)
    return c.json({ error: 'Error al asignar categorías', detalle: relError.message }, 500)
}

return c.json({ evento: nuevoEvento, categorias })
})

// GET /api/event/:id
evento.get('/:id', async (c) => {
const id = Number(c.req.param('id'))
if (isNaN(id)) {
    return c.json({ error: 'ID inválido' }, 400)
}

  // Obtener el evento por ID
const { data: eventoData, error: eventoError } = await supabase
    .from('evento')
    .select('*')
    .eq('id_evento', id)
    .single()

if (eventoError || !eventoData) {
    return c.json({ error: 'Evento no encontrado' }, 404)
}

  // Obtener las categorías asociadas al evento (id y nombre)
const { data: categoriasData, error: categoriasError } = await supabase
    .from('evento_categoria')
    .select('categoria_evento(id_categoria, nombre_categoria)')
    .eq('id_evento', id)

if (categoriasError) {
    return c.json({ error: 'Error al obtener las categorías', detalle: categoriasError.message }, 500)
}

  // Extraer id y nombre de las categorías
const categorias = categoriasData?.map((c: any) => ({
    id_categoria: c.categoria_evento.id_categoria,
    nombre_categoria: c.categoria_evento.nombre_categoria
})) || []

return c.json({ evento: eventoData, categorias })
})

// PUT /api/event/:id
evento.put('/:id', async (c) => {
const id = Number(c.req.param('id'))
const body = await c.req.json()
const {
    titulo,
    descripcion,
    fecha_inicio,
    fecha_fin,
    ubicacion,
    capacidad,
    categorias // array de ids de categoría
} = body

if (!titulo || !fecha_inicio || !fecha_fin || !ubicacion || !capacidad || !Array.isArray(categorias) || categorias.length === 0) {
    return c.json({ error: 'Faltan campos requeridos o categorías' }, 400)
}
if (new Date(fecha_inicio) > new Date(fecha_fin)) {
    return c.json({ error: 'La fecha de inicio debe ser anterior a la de fin' }, 400)
}

  // Actualizar evento
const { error: updateError } = await supabase
    .from('evento')
    .update({
        titulo,
        descripcion,
        fecha_inicio,
        fecha_fin,
        ubicacion,
        capacidad
    })
    .eq('id_evento', id)

if (updateError) {
    return c.json({ error: 'Error al actualizar el evento', detalle: updateError.message }, 500)
}

  // Actualizar categorías: eliminar las antiguas y agregar las nuevas
await supabase.from('evento_categoria').delete().eq('id_evento', id)
const relaciones = categorias.map((id_categoria: number) => ({
    id_evento: id,
    id_categoria
}))
const { error: relError } = await supabase
    .from('evento_categoria')
    .insert(relaciones)

if (relError) {
    return c.json({ error: 'Error al actualizar categorías', detalle: relError.message }, 500)
}

return c.json({ mensaje: 'Evento actualizado correctamente' })
})

// GET /api/event/organizador/:id_organizador
evento.get('/organizador/:id_organizador', async (c) => {
const id_organizador = Number(c.req.param('id_organizador'))
if (isNaN(id_organizador)) {
    return c.json({ error: 'ID de organizador inválido' }, 400)
}

const { data, error } = await supabase
    .from('evento')
    .select('*')
    .eq('id_organizador', id_organizador)
    .order('fecha_inicio', { ascending: true })

if (error) {
    return c.json({ error: 'Error al obtener los eventos', detalle: error.message }, 500)
}

return c.json({ eventos: data })
})

// GET /api/event
evento.get('/', async (c) => {
  // Traer todos los eventos
const { data: eventos, error } = await supabase
    .from('evento')
    .select('*')
    .order('fecha_inicio', { ascending: true })

if (error) {
    return c.json({ error: 'Error al obtener los eventos', detalle: error.message }, 500)
}

  // Para cada evento, traer sus categorías (id y nombre)
const eventosConCategorias = await Promise.all(
    (eventos || []).map(async (ev: any) => {
    const { data: categoriasData } = await supabase
        .from('evento_categoria')
        .select('categoria_evento(id_categoria, nombre_categoria)')
        .eq('id_evento', ev.id_evento)

    const categorias = categoriasData?.map((c: any) => ({
        id_categoria: c.categoria_evento.id_categoria,
        nombre_categoria: c.categoria_evento.nombre_categoria
    })) || []

    return { ...ev, categorias }
    })
);

return c.json({ eventos: eventosConCategorias })
});

export default evento;