import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/** Load apps/api/.env in dev when vars are not already set (Fly uses secrets, not .env). */
export function loadLocalEnv(): void {
  if (process.env.NODE_ENV === 'production') {
    return
  }

  const envPath = resolve(process.cwd(), '.env')
  if (!existsSync(envPath)) {
    return
  }

  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([^#=]+)=(.*)$/)
    if (!match) continue
    const key = match[1]?.trim()
    if (!key || process.env[key] !== undefined) continue
    process.env[key] = match[2]?.trim() ?? ''
  }
}

loadLocalEnv()
