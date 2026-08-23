import type { FastifyInstance } from 'fastify'
import { config } from '../config/env.js'
import { UnauthorizedError } from '../lib/errors.js'
import { verifySupabaseJwt } from '../lib/jwt.js'
import type { MembershipRole } from '@sonari/types'

export type RequestAuth = {
  userId: string
  email: string | null
  tenantId: string | null
  role: MembershipRole | null
  branchIds: string[]
  rawToken: string
}

declare module 'fastify' {
  interface FastifyRequest {
    auth: RequestAuth | null
  }
}

const PUBLIC_PATHS = new Set(['/health'])
const TENANT_OPTIONAL_PATHS = new Set(['/api/v1/auth/bootstrap', '/api/v1/auth/session'])

function routePath(url: string): string {
  return url.split('?')[0] ?? url
}

export async function authPlugin(app: FastifyInstance): Promise<void> {
  app.decorateRequest('auth', undefined as unknown as RequestAuth | null)

  app.addHook('preHandler', async (request) => {
    const path = routePath(request.url)
    if (PUBLIC_PATHS.has(path)) {
      return
    }

    const header = request.headers.authorization
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) {
      throw new UnauthorizedError()
    }

    const payload = await verifySupabaseJwt(token)
    const appMeta = payload.app_metadata ?? {}

    request.auth = {
      userId: payload.sub,
      email: payload.email ?? null,
      tenantId: appMeta.tenant_id ?? null,
      role: (appMeta.role as MembershipRole | undefined) ?? null,
      branchIds: appMeta.branch_ids ?? [],
      rawToken: token,
    }

    if (!TENANT_OPTIONAL_PATHS.has(path) && !request.auth.tenantId) {
      throw new UnauthorizedError('Store bootstrap required')
    }
  })
}

export { serviceDb } from './service-db.js'
