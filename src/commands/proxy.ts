import { OPENSPEC_COMMANDS, runOpenSpec } from '../utils/openspec.js';

export function isProxiedCommand(command: string): boolean {
  return (OPENSPEC_COMMANDS as readonly string[]).includes(command);
}

export function proxyToOpenSpec(args: string[]): void {
  try {
    runOpenSpec(args);
  } catch (err: unknown) {
    const exitCode = (err as { status?: number })?.status ?? 1;
    process.exit(exitCode);
  }
}
