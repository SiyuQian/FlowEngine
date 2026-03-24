## Test Plan

### Health Endpoint

**Test file:** `tests/server/health.test.ts`
**Framework:** Vitest + Fastify's `inject()` method for in-process HTTP testing

#### Scenario: Health endpoint returns 200 with status payload

- **Given** a Fastify server with the health plugin registered
- **When** a GET request is made to `/health`
- **Then** the response status code is 200 and the body contains `status`, `uptime`, and `version` fields

**Test skeleton:**
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createServer } from '../../src/server/index.js'

describe('GET /health', () => {
  let server: Awaited<ReturnType<typeof createServer>>

  beforeAll(async () => {
    server = await createServer({ logger: false })
  })

  afterAll(async () => {
    await server.stop()
  })

  it('returns 200 with health payload', async () => {
    const response = await server.app.inject({ method: 'GET', url: '/health' })
    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body).toHaveProperty('status', 'ok')
    expect(body).toHaveProperty('uptime')
    expect(body).toHaveProperty('version')
  })
})
```

#### Scenario: Health response uptime is a positive number

- **Given** a running Fastify server with the health plugin
- **When** a GET request is made to `/health`
- **Then** the `uptime` field is a number greater than 0

**Test skeleton:**
```typescript
  it('returns uptime as a positive number', async () => {
    const response = await server.app.inject({ method: 'GET', url: '/health' })
    const body = response.json()
    expect(typeof body.uptime).toBe('number')
    expect(body.uptime).toBeGreaterThan(0)
  })
```

#### Scenario: Health response version matches package.json

- **Given** a running Fastify server with the health plugin
- **When** a GET request is made to `/health`
- **Then** the `version` field matches the version in `package.json`

**Test skeleton:**
```typescript
  it('returns version matching package.json', async () => {
    const { version: pkgVersion } = await import('../../package.json', { with: { type: 'json' } })
    const response = await server.app.inject({ method: 'GET', url: '/health' })
    const body = response.json()
    expect(body.version).toBe(pkgVersion)
  })
```

#### Scenario: Health response content-type is JSON

- **Given** a running Fastify server with the health plugin
- **When** a GET request is made to `/health`
- **Then** the response `content-type` header includes `application/json`

**Test skeleton:**
```typescript
  it('returns application/json content-type', async () => {
    const response = await server.app.inject({ method: 'GET', url: '/health' })
    expect(response.headers['content-type']).toMatch(/application\/json/)
  })
```

#### Scenario: Unknown route returns 404

- **Given** a running Fastify server with only the health plugin
- **When** a GET request is made to `/unknown`
- **Then** the response status code is 404

**Test skeleton:**
```typescript
  it('returns 404 for unknown routes', async () => {
    const response = await server.app.inject({ method: 'GET', url: '/unknown' })
    expect(response.statusCode).toBe(404)
  })
```
