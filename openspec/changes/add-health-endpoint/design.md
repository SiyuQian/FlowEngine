## Context

flow-engine is a CLI tool built with TypeScript, using `cac` for argument parsing and `@fission-ai/openspec` for spec management. It has no HTTP server infrastructure. The compiled output lives in `dist/`. The project uses Vitest for testing.

## Goals / Non-Goals

**Goals:**
- Add a `/health` endpoint using Fastify that returns JSON with service status, uptime, and version
- Structure the server as a separate module with `start()` / `stop()` lifecycle functions
- Register the health route as a Fastify plugin
- Add a `flow serve` CLI command to start the server
- Include tests for the health endpoint

**Non-Goals:**
- Authentication or authorization on the health endpoint
- Additional endpoints beyond `/health`
- Metrics, tracing, or observability beyond basic health
- Custom health check logic (e.g., database connectivity)

## Design

### File structure

```
src/
  server/
    index.ts        # createServer(), start(), stop() — Fastify instance factory
    plugins/
      health.ts     # Fastify plugin: registers GET /health
  commands/
    serve.ts        # CLI command: `flow serve` — starts the server
tests/
  server/
    health.test.ts  # Tests for the /health endpoint
```

### Health plugin (`src/server/plugins/health.ts`)

A Fastify plugin that registers `GET /health`. Response schema:

```json
{
  "status": "ok",
  "uptime": 12345.67,
  "version": "1.0.0"
}
```

- `status`: always `"ok"` if the server is responding
- `uptime`: `process.uptime()` in seconds
- `version`: read from `package.json`

### Server factory (`src/server/index.ts`)

Exports `createServer(opts?)` which:
1. Creates a Fastify instance with a logger option
2. Registers the health plugin
3. Returns `{ start(port), stop() }` wrapping `fastify.listen()` and `fastify.close()`

Default port: `3000`. Configurable via option or `PORT` env var.

### CLI command (`src/commands/serve.ts`)

Registers `flow serve [--port <number>]` via cac. Calls `createServer()` then `start()`.

### Testing (`tests/server/health.test.ts`)

Uses `fastify.inject()` for in-process HTTP testing (no real port needed):
- Verify `GET /health` returns 200
- Verify response body has `status`, `uptime`, `version` fields
- Verify `status` is `"ok"`

## Risks / Trade-offs

- **New dependency**: Fastify adds to install size, but it's lightweight (~2MB) and well-maintained
- **Port conflicts**: Mitigated by making the port configurable and defaulting to 3000
- **Minimal health check**: Only confirms the process is running; doesn't check downstream dependencies. This is intentional per non-goals — custom checks can be added later as plugins
