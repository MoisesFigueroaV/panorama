// routes/auth.routes.ts
import { Hono } from 'hono'
import { AuthService } from '../services/auth.services'

const auth = new Hono()
const service = new AuthService()

auth.post('/register', async (c) => {
  const body = await c.req.json()
  try {
    const user = await service.register(body)
    return c.json({ user }, 201)
  } catch (err: any) {
    return c.json({ error: err.message }, 400)
  }
})

auth.post('/login', async (c) => {
  const { correo, contrasena } = await c.req.json()
  try {
    const { user, token } = await service.login(correo, contrasena)
    return c.json({ user, token })
  } catch (err: any) {
    return c.json({ error: err.message }, 401)
  }
})

export default auth
