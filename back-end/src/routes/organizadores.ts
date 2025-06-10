import { Router } from 'express'
import { db } from '../db'
import { organizadores } from '../db/schema'
import { eq, and, like, sql } from 'drizzle-orm'
import { authenticateToken, isAdmin } from '../middleware/auth'

const router = Router()

// Obtener lista de organizadores con paginación y filtros
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const search = req.query.search as string
    const status = req.query.status as string

    const offset = (page - 1) * limit

    // Construir condiciones de búsqueda
    let whereConditions = []
    
    if (search) {
      whereConditions.push(
        sql`(${organizadores.nombre_organizacion} ILIKE ${`%${search}%`} OR ${organizadores.correo} ILIKE ${`%${search}%`})`
      )
    }

    if (status && status !== 'all') {
      whereConditions.push(eq(organizadores.estado, status))
    }

    // Obtener total de registros
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(organizadores)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)

    const total = totalResult[0].count

    // Obtener organizadores
    const organizers = await db
      .select({
        id: organizadores.id_organizador,
        name: organizadores.nombre_organizacion,
        email: organizadores.correo,
        status: organizadores.estado,
        eventsCount: sql<number>`(
          SELECT COUNT(*) FROM eventos 
          WHERE eventos.id_organizador = ${organizadores.id_organizador}
        )`,
        rating: sql<number>`COALESCE((
          SELECT AVG(valoracion) FROM valoraciones_organizadores 
          WHERE id_organizador = ${organizadores.id_organizador}
        ), 0)`,
        location: organizadores.ubicacion,
        createdAt: organizadores.fecha_registro
      })
      .from(organizadores)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(limit)
      .offset(offset)
      .orderBy(organizadores.fecha_registro)

    res.json({
      organizers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error al obtener organizadores:', error)
    res.status(500).json({ error: 'Error al obtener la lista de organizadores' })
  }
})

// Actualizar estado de un organizador
router.patch('/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['active', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Estado no válido' })
    }

    await db
      .update(organizadores)
      .set({ estado: status })
      .where(eq(organizadores.id_organizador, id))

    res.json({ message: 'Estado actualizado correctamente' })
  } catch (error) {
    console.error('Error al actualizar estado del organizador:', error)
    res.status(500).json({ error: 'Error al actualizar el estado del organizador' })
  }
})

export default router 