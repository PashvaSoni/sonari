import {
  BranchSchema,
  CreateBranchSchema,
  CreateMetalRateSchema,
  CurrentRatesResponseSchema,
  MetalRateSchema,
  RatesHistoryQuerySchema,
  RatesHistoryResponseSchema,
  TenantProfileSchema,
  UpdateBranchSchema,
  UpdateStoreProfileSchema,
} from '@sonari/types'
import type { FastifyInstance } from 'fastify'
import { UnauthorizedError } from '../../lib/errors.js'
import {
  createBranch,
  createMetalRate,
  getCurrentRates,
  getRateHistory,
  getStoreProfile,
  listBranches,
  requireTenantId,
  updateBranch,
  updateStoreProfile,
} from './service.js'

export async function storeRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/v1/store', async (request) => {
    if (!request.auth) {
      throw new UnauthorizedError()
    }
    const tenantId = requireTenantId(request.auth.tenantId)
    const profile = await getStoreProfile(tenantId)
    return TenantProfileSchema.parse(profile)
  })

  app.patch('/api/v1/store', async (request) => {
    if (!request.auth) {
      throw new UnauthorizedError()
    }
    const tenantId = requireTenantId(request.auth.tenantId)
    const body = UpdateStoreProfileSchema.parse(request.body)
    const profile = await updateStoreProfile(tenantId, request.auth.role, body)
    return TenantProfileSchema.parse(profile)
  })

  app.get('/api/v1/store/branches', async (request) => {
    if (!request.auth) {
      throw new UnauthorizedError()
    }
    const tenantId = requireTenantId(request.auth.tenantId)
    const branches = await listBranches(tenantId)
    return { branches: branches.map((b) => BranchSchema.parse(b)) }
  })

  app.post('/api/v1/store/branches', async (request) => {
    if (!request.auth) {
      throw new UnauthorizedError()
    }
    const tenantId = requireTenantId(request.auth.tenantId)
    const body = CreateBranchSchema.parse(request.body)
    const branch = await createBranch(tenantId, request.auth.userId, request.auth.role, body)
    return BranchSchema.parse(branch)
  })

  app.patch('/api/v1/store/branches/:id', async (request) => {
    if (!request.auth) {
      throw new UnauthorizedError()
    }
    const tenantId = requireTenantId(request.auth.tenantId)
    const { id } = request.params as { id: string }
    const body = UpdateBranchSchema.parse(request.body)
    const branch = await updateBranch(tenantId, id, request.auth.role, body)
    return BranchSchema.parse(branch)
  })

  app.get('/api/v1/rates', async (request) => {
    if (!request.auth) {
      throw new UnauthorizedError()
    }
    const tenantId = requireTenantId(request.auth.tenantId)
    const rates = await getCurrentRates(tenantId)
    return CurrentRatesResponseSchema.parse({ rates })
  })

  app.get('/api/v1/rates/history', async (request) => {
    if (!request.auth) {
      throw new UnauthorizedError()
    }
    const tenantId = requireTenantId(request.auth.tenantId)
    const query = RatesHistoryQuerySchema.parse(request.query)
    const rates = await getRateHistory(tenantId, query.from, query.to)
    return RatesHistoryResponseSchema.parse({ rates })
  })

  app.post('/api/v1/rates', async (request) => {
    if (!request.auth) {
      throw new UnauthorizedError()
    }
    const tenantId = requireTenantId(request.auth.tenantId)
    const body = CreateMetalRateSchema.parse(request.body)
    const rate = await createMetalRate(tenantId, request.auth.userId, request.auth.role, body)
    return MetalRateSchema.parse(rate)
  })
}
