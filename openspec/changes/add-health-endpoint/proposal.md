## Why

flow-engine is currently a CLI-only tool with no HTTP server capabilities. To support deployment monitoring, container orchestration health checks (e.g., Kubernetes liveness/readiness probes), and load balancer integration, the project needs an HTTP health endpoint. Fastify provides a lightweight, high-performance foundation for this.

## What Changes

- Add Fastify as a dependency
- Create an HTTP server with a `/health` endpoint that returns service status
- The health endpoint will report basic service health including uptime and version information
- Expose server start/stop as a programmatic API for integration

## Impact

- New dependency: `fastify`
- New source files for the HTTP server and health route
- New test files for the health endpoint
- `package.json` updated with Fastify dependency
