import { ApiErrorSchema } from '@sonari/types'
import { env } from '../env.js'
import { supabase } from './supabase.js'

export class ApiClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiClientError'
  }
}

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = await getAccessToken()
  const headers = new Headers(init.headers)

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${env.VITE_API_URL}${path}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    const json: unknown = await response.json().catch(() => null)
    const parsed = ApiErrorSchema.safeParse(json)
    if (parsed.success) {
      throw new ApiClientError(
        parsed.data.error.code,
        parsed.data.error.message,
        parsed.data.error.details,
      )
    }
    throw new ApiClientError('HTTP_ERROR', `Request failed (${response.status})`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
