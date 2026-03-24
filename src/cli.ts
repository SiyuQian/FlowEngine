#!/usr/bin/env node
import { cac } from 'cac';
import { isProxiedCommand, proxyToOpenSpec } from './commands/proxy.js';
import { initCommand } from './commands/init.js';
import { serveCommand } from './commands/serve.js';

const cli = cac('flow');

cli.version('0.1.0');
cli.help();

cli.command('init', 'Initialize flow-engine in the current project')
  .action(async () => {
    await initCommand(process.cwd());
  });

cli.command('serve', 'Start the health check server')
  .option('--port <port>', 'Port to listen on (default: 3000)')
  .action(async (options: { port?: string }) => {
    const port = options.port ? Number(options.port) : undefined;
    await serveCommand(port);
  });

// Check for proxied commands before cac parses
const args = process.argv.slice(2);
if (args.length > 0 && isProxiedCommand(args[0])) {
  proxyToOpenSpec(args);
  process.exit(0);
}

cli.parse();
