import {
  CategoriesListResponseSchema,
  CategorySchema,
  CreateCategorySchema,
  UpdateCategorySchema,
} from '@sonari/types'
import type { FastifyInstance } from 'fastify'
import { UnauthorizedError } from '../../lib/errors.js'
import { requireTenantId } from '../store/service.js'
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from './service.js'

export async function categoryRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/v1/categories', async (request) => {
    if (!request.auth) {
      throw new UnauthorizedError()
    }
    const tenantId = requireTenantId(request.auth.tenantId)
    const categories = await listCategories(tenantId)
    return CategoriesListResponseSchema.parse({
      categories: categories.map((c) => CategorySchema.parse(c)),
    })
  })

  app.post('/api/v1/categories', async (request) => {
    if (!request.auth) {
      throw new UnauthorizedError()
    }
    const tenantId = requireTenantId(request.auth.tenantId)
    const body = CreateCategorySchema.parse(request.body)
    const category = await createCategory(tenantId, request.auth.role, body)
    return CategorySchema.parse(category)
  })

  app.patch('/api/v1/categories/:id', async (request) => {
    if (!request.auth) {
      throw new UnauthorizedError()
    }
    const tenantId = requireTenantId(request.auth.tenantId)
    const { id } = request.params as { id: string }
    const body = UpdateCategorySchema.parse(request.body)
    const category = await updateCategory(tenantId, id, request.auth.role, body)
    return CategorySchema.parse(category)
  })

  app.delete('/api/v1/categories/:id', async (request, reply) => {
    if (!request.auth) {
      throw new UnauthorizedError()
    }
    const tenantId = requireTenantId(request.auth.tenantId)
    const { id } = request.params as { id: string }
    await deleteCategory(tenantId, id, request.auth.role)
    return reply.status(204).send()
  })
}
