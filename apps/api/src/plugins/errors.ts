import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import { ZodError } from 'zod'
import { AppError, ValidationError } from '../lib/errors.js'
import { applyCorsHeaders } from '../lib/cors-headers.js'
import { config } from '../config/env.js'

function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError || (error instanceof Error && error.name === 'ZodError')
}

function isAppError(error: unknown): error is AppError {
  return (
    error instanceof AppError ||
    (error instanceof Error &&
      typeof (error as AppError).code === 'string' &&
      typeof (error as AppError).status === 'number')
  )
}

const errorsPluginImpl: FastifyPluginAsync = async (app) => {
  app.setErrorHandler((error: Error, request: FastifyRequest, reply: FastifyReply) => {
    applyCorsHeaders(request, reply)

    if (isZodError(error)) {
      const details = 'flatten' in error && typeof error.flatten === 'function' ? error.flatten() : undefined
      const validation = new ValidationError(details)
      return reply.status(validation.status).send({
        error: {
          code: validation.code,
          message: validation.message,
          details: validation.details,
          requestId: request.id,
        },
      })
    }

    if (isAppError(error)) {
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
        message: config.isDev
            ? error.message || 'Internal server error'
            : 'Internal server error',
        requestId: request.id,
      },
    })
  })
}

export const errorsPlugin = fp(errorsPluginImpl, { name: 'sonari-errors' })
