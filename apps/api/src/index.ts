import './load-local-env.js'
import { buildServer } from './server.js'
import { config } from './config/env.js'

const app = await buildServer()

try {
  await app.listen({ port: config.PORT, host: config.HOST })
  app.log.info(`API listening on http://${config.HOST}:${config.PORT}`)
} catch (error) {
  app.log.error(error)
  process.exit(1)
}
