import { OPENSPEC_COMMANDS, isOpenSpecInstalled, runOpenSpec } from '../utils/openspec.js';

export function isProxiedCommand(command: string): boolean {
  return (OPENSPEC_COMMANDS as readonly string[]).includes(command);
}

export function proxyToOpenSpec(args: string[]): void {
  if (!isOpenSpecInstalled()) {
    console.error('Error: openspec CLI is not installed.');
    console.error('Install it with: npm install -g openspec');
    process.exit(1);
  }

  try {
    runOpenSpec(args);
  } catch (err: unknown) {
    const exitCode = (err as { status?: number })?.status ?? 1;
    process.exit(exitCode);
  }
}
