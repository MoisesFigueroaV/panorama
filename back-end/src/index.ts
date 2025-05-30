import 'dotenv/config'
import { Hono } from 'hono'
import { swaggerUI } from '@hono/swagger-ui'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { serve } from 'bun'

// Cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

// Zod Schema para eventos
const EventoSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string(),
  fecha: z.string().datetime(),
  descripcion: z.string().nullable()
})

// Inicializa app Hono
const app = new Hono()

app.get('/eventos', async (c) => {
  const { data, error } = await supabase.from('evento').select('*')
  if (error) return c.json({ error: error.message }, 500)

  const parsed = EventoSchema.array().safeParse(data)
  if (!parsed.success) {
    return c.json({ error: 'Datos inválidos desde la DB' }, 500)
  }

  return c.json(parsed.data)
})

app.get('/docs', swaggerUI({ url: '/openapi.json' }))

app.get('/openapi.json', (c) =>
  c.json({
    openapi: '3.0.0',
    info: { title: 'Mi API', version: '1.0.0' },
    paths: {
      '/eventos': {
        get: {
          summary: 'Obtener eventos',
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        nombre: { type: 'string' },
                        fecha: { type: 'string', format: 'date-time' },
                        descripcion: { type: ['string', 'null'] }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
)

// Usar Bun.serve con app.fetch
serve({
  fetch: app.fetch,
  port: 3000
})
