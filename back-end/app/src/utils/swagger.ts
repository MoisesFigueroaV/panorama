import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { t } from 'elysia'

new Elysia()
    .use(swagger())
    .get('/', () => 'hi')
    .post('/hello', () => 'world')
    .listen(3000)

export const SwaggerResponses = (schema: any, statusCode: number = 200) => ({
  [statusCode]: {
    description: 'Operación exitosa',
    content: {
      'application/json': {
        schema
      }
    }
  }
});