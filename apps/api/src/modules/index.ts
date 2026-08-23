import type { FastifyInstance } from 'fastify'
import { authRoutes } from './auth/routes.js'
import { categoryRoutes } from './categories/routes.js'
import { itemRoutes } from './items/routes.js'
import { storeRoutes } from './store/routes.js'

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  await app.register(authRoutes)
  await app.register(storeRoutes)
  await app.register(categoryRoutes)
  await app.register(itemRoutes)
}
