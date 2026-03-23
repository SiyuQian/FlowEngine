#!/usr/bin/env node
import { cac } from 'cac';
import { isProxiedCommand, proxyToOpenSpec } from './commands/proxy.js';

const cli = cac('flow');

cli.version('0.1.0');
cli.help();

// Check for proxied commands before cac parses
const args = process.argv.slice(2);
if (args.length > 0 && isProxiedCommand(args[0])) {
  proxyToOpenSpec(args);
  process.exit(0);
}

cli.parse();
