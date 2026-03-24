import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from '../../src/server/index.js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { version: pkgVersion } = require('../../package.json');

describe('GET /health', () => {
  let server: Awaited<ReturnType<typeof createServer>>;

  beforeAll(async () => {
    server = await createServer({ logger: false });
  });

  afterAll(async () => {
    await server.stop();
  });

  it('returns 200 with health payload', async () => {
    const response = await server.app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toHaveProperty('status', 'ok');
    expect(body).toHaveProperty('uptime');
    expect(body).toHaveProperty('version');
  });

  it('returns uptime as a positive number', async () => {
    const response = await server.app.inject({ method: 'GET', url: '/health' });
    const body = response.json();
    expect(typeof body.uptime).toBe('number');
    expect(body.uptime).toBeGreaterThan(0);
  });

  it('returns version matching package.json', async () => {
    const response = await server.app.inject({ method: 'GET', url: '/health' });
    const body = response.json();
    expect(body.version).toBe(pkgVersion);
  });

  it('returns application/json content-type', async () => {
    const response = await server.app.inject({ method: 'GET', url: '/health' });
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  it('returns 404 for unknown routes', async () => {
    const response = await server.app.inject({ method: 'GET', url: '/unknown' });
    expect(response.statusCode).toBe(404);
  });
});
