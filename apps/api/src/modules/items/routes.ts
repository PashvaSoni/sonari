import {
  CreateItemSchema,
  ItemListItemSchema,
  ItemsListQuerySchema,
  ItemsListResponseSchema,
} from '@sonari/types'
import type { FastifyInstance } from 'fastify'
import { UnauthorizedError } from '../../lib/errors.js'
import { requireTenantId } from '../store/service.js'
import { createItem, listItems } from './service.js'

export async function itemRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/v1/items', async (request) => {
    if (!request.auth) {
      throw new UnauthorizedError()
    }
    const tenantId = requireTenantId(request.auth.tenantId)
    const query = ItemsListQuerySchema.parse(request.query)
    const result = await listItems(tenantId, request.auth.role, query)
    return ItemsListResponseSchema.parse({
      items: result.items.map((item) => ItemListItemSchema.parse(item)),
      nextCursor: result.nextCursor,
    })
  })

  app.post('/api/v1/items', async (request) => {
    if (!request.auth) {
      throw new UnauthorizedError()
    }
    const tenantId = requireTenantId(request.auth.tenantId)
    const body = CreateItemSchema.parse(request.body)
    const item = await createItem(tenantId, request.auth.role, body)
    return ItemListItemSchema.parse(item)
  })
}
