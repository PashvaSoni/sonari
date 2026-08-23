import type { FastifyReply, FastifyRequest } from 'fastify'
import { config } from '../config/env.js'

/**
 * Posport-style: every response (incl. errors) must carry CORS headers.
 * Credentials mode cannot use `*`; reflect an allow-listed Origin.
 */
export function buildCorsHeaders(origin: string | undefined): Record<string, string> {
  if (!origin || !config.corsOrigins.includes(origin)) {
    return {}
  }
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  }
}

export function applyCorsHeaders(request: FastifyRequest, reply: FastifyReply): void {
  const headers = buildCorsHeaders(
    typeof request.headers.origin === 'string' ? request.headers.origin : undefined,
  )
  for (const [key, value] of Object.entries(headers)) {
    reply.header(key, value)
  }
}
