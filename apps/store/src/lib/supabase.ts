import { createAnonClient } from '@sonari/db'
import { env } from '../env.js'

export const supabase = createAnonClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)
