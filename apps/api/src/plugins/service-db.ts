import { createServiceClient } from '@sonari/db'
import { config } from '../config/env.js'

export const serviceDb = createServiceClient(
  config.SUPABASE_URL,
  config.SUPABASE_SERVICE_ROLE_KEY,
)
