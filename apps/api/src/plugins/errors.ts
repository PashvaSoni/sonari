import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { AppError } from '../lib/errors.js'

export async function errorsPlugin(app: FastifyInstance): Promise<void> {
  app.setErrorHandler((error: Error, request: FastifyRequest, reply: FastifyReply) => {
    if (error instanceof AppError) {
      return reply.status(error.status).send({
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          requestId: request.id,
        },
      })
    }

    request.log.error(error)
    return reply.status(500).send({
      error: {
        code: 'INTERNAL',
        message: 'Internal server error',
        requestId: request.id,
      },
    })
  })
}
