import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const dockerfilePath = join(dirname(fileURLToPath(import.meta.url)), '..', 'Dockerfile')

describe('API Dockerfile workspace deps', () => {
  const dockerfile = readFileSync(dockerfilePath, 'utf8')

  it('copies packages/db into the image (required by @sonari/api)', () => {
    expect(dockerfile).toMatch(/COPY packages\/db\/package\.json packages\/db\//)
    expect(dockerfile).toMatch(/COPY packages\/db \.\/packages\/db/)
  })

  it('builds @sonari/db before @sonari/api', () => {
    expect(dockerfile).toMatch(/pnpm --filter @sonari\/db build/)
    const dbBuildAt = dockerfile.indexOf('pnpm --filter @sonari/db build')
    const apiBuildAt = dockerfile.indexOf('pnpm --filter @sonari/api build')
    expect(dbBuildAt).toBeGreaterThan(-1)
    expect(apiBuildAt).toBeGreaterThan(dbBuildAt)
  })

  it('still installs and builds types + config workspace packages', () => {
    expect(dockerfile).toMatch(/COPY packages\/types\/package\.json packages\/types\//)
    expect(dockerfile).toMatch(/COPY packages\/config\/package\.json packages\/config\//)
    expect(dockerfile).toMatch(/pnpm --filter @sonari\/types build/)
  })
})
