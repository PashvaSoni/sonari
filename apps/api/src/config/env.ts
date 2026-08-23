import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:5174'),
})

export type Env = z.infer<typeof envSchema>

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    const missing = parsed.error.issues.map((i: { path: (string | number)[] }) => i.path.join('.')).join(', ')
    throw new Error(`Invalid API environment: ${missing}`)
  }
  return parsed.data
}

const env = loadEnv()

export const config = {
  ...env,
  isDev: env.NODE_ENV === 'development',
  corsOrigins: env.CORS_ORIGINS.split(',').map((o: string) => o.trim()).filter(Boolean),
}
