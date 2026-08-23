import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'
import { config } from '../config/env.js'
import { UnauthorizedError } from './errors.js'

const jwksUrl = new URL(`${config.SUPABASE_URL}/auth/v1/.well-known/jwks.json`)
const jwks = createRemoteJWKSet(jwksUrl)

export type SupabaseJwtPayload = JWTPayload & {
  sub: string
  email?: string
  app_metadata?: {
    tenant_id?: string
    role?: string
    branch_ids?: string[]
  }
}

export async function verifySupabaseJwt(token: string): Promise<SupabaseJwtPayload> {
  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: `${config.SUPABASE_URL}/auth/v1`,
    })
    if (!payload.sub) {
      throw new UnauthorizedError('Invalid token subject')
    }
    return payload as SupabaseJwtPayload
  } catch {
    throw new UnauthorizedError('Invalid or expired token')
  }
}
