import Fastify, { FastifyInstance } from 'fastify';
import healthPlugin from './plugins/health.js';

export interface ServerOptions {
  logger?: boolean;
  port?: number;
}

export async function createServer(opts: ServerOptions = {}) {
  const app: FastifyInstance = Fastify({
    logger: opts.logger ?? true,
  });

  await app.register(healthPlugin);

  const port = opts.port ?? (Number(process.env.PORT) || 3000);

  return {
    app,
    async start(overridePort?: number) {
      const listenPort = overridePort ?? port;
      await app.listen({ port: listenPort, host: '0.0.0.0' });
      return listenPort;
    },
    async stop() {
      await app.close();
    },
  };
}
