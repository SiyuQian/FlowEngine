import { createServer } from '../server/index.js';

export async function serveCommand(port?: number): Promise<void> {
  const server = await createServer({ port });
  const listenPort = await server.start();
  console.log(`Health server listening on port ${listenPort}`);
}
