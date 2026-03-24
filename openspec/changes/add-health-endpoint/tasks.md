## 1. Project setup

- [x] 1.1 Install Fastify: `npm install fastify`
- [x] 1.2 Create directory structure: `src/server/`, `src/server/plugins/`, `tests/server/`

## 2. Health plugin

- [x] 2.1 Create `src/server/plugins/health.ts` — Fastify plugin that registers `GET /health` returning `{ status, uptime, version }`
- [x] 2.2 Read version from `package.json`, use `process.uptime()` for uptime

## 3. Server factory

- [x] 3.1 Create `src/server/index.ts` — export `createServer(opts?)` that instantiates Fastify, registers health plugin, and returns `{ app, start(port), stop() }`
- [x] 3.2 Default port to `3000`, allow override via option or `PORT` env var

## 4. CLI command

- [x] 4.1 Create `src/commands/serve.ts` — register `flow serve [--port]` command using cac
- [x] 4.2 Wire the serve command into the CLI entry point (`src/cli.ts`)

## 5. Tests

- [x] 5.1 Create `tests/server/health.test.ts` with all test cases from test.md
- [x] 5.2 Verify all tests pass with `npx vitest run`

## 6. Build and verify

- [x] 6.1 Verify TypeScript compilation succeeds
- [x] 6.2 Manually verify `flow serve` starts and `/health` responds correctly
