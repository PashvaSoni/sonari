import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    env: {
      NODE_ENV: 'test',
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
      SUPABASE_ANON_KEY: 'test-anon-key',
      CORS_ORIGINS:
        'http://localhost:5173,http://localhost:5174,https://app.sonari.shop,https://admin.sonari.shop',
    },
  },
})
