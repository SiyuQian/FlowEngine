## Problem Summary

flow-engine needs an HTTP health endpoint for deployment monitoring and orchestration health checks. Fastify is the chosen framework. The question is how to structure the server and health route within the existing project.

## Approach 1: Standalone Fastify server module

Create a self-contained `src/server/` module with the Fastify instance and health route registered as a plugin. The server exposes `start()` and `stop()` functions. A new CLI command (`flow serve`) starts the server.

**Pros:**
- Clean separation from existing CLI code
- Easy to test in isolation
- Fastify plugin pattern is idiomatic and extensible

**Cons:**
- Adds a new top-level module and CLI command
- Slightly more files to maintain

**Trade-offs:**
- More structure upfront, but scales well if more routes are added later

## Approach 2: Inline health route in CLI

Add the Fastify server directly in the CLI entry point. The health route is defined inline without a plugin pattern. Server starts as a side effect of a CLI flag (e.g., `flow --serve`).

**Pros:**
- Minimal new files
- Quick to implement

**Cons:**
- Mixes HTTP server concerns with CLI concerns
- Harder to test the server independently
- Doesn't follow Fastify's plugin architecture

**Trade-offs:**
- Fast to ship but creates coupling that's hard to undo

## Approach 3: Fastify plugin only (no CLI command)

Create the health route as a Fastify plugin exported from the package. Consumers instantiate their own Fastify server and register the plugin. No CLI integration.

**Pros:**
- Maximum flexibility for consumers
- Minimal opinion about server lifecycle

**Cons:**
- No out-of-the-box way to run the health endpoint
- Requires consumers to write boilerplate

**Trade-offs:**
- Library-friendly but not user-friendly for standalone use

## Recommendation

**Approach 1: Standalone Fastify server module.** It keeps the server cleanly separated, follows Fastify idioms (plugin pattern), and is straightforward to test. A `flow serve` command provides a clear entry point without polluting the existing CLI structure.
