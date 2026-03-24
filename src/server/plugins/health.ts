import { FastifyPluginAsync } from 'fastify';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { version } = require('../../../package.json');

const healthPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      uptime: process.uptime(),
      version,
    };
  });
};

export default healthPlugin;
