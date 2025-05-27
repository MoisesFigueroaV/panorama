// middleware/auth.ts
import { verify } from 'jsonwebtoken'
import { Context } from 'hono'

export const authMiddleware = async (c: Context, next: () => Promise<void>) => {
  const header = c.req.header('Authorization')
  if (!header) return c.json({ error: 'No token' }, 401)

  const token = header.split(' ')[1]
  try {
    const payload = verify(token, process.env.JWT_SECRET!)
    c.set('user', payload)
    await next()
  } catch {
    return c.json({ error: 'Token inválido' }, 401)
  }
}
