import { execFileSync } from 'node:child_process';

export const OPENSPEC_COMMANDS = [
  'list', 'show', 'validate', 'archive',
  'schema', 'view', 'templates', 'status',
  'config', 'update', 'instructions', 'new',
] as const;

export function isOpenSpecInstalled(): boolean {
  try {
    execFileSync('openspec', ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export function runOpenSpec(args: string[], cwd?: string): void {
  execFileSync('openspec', args, { stdio: 'inherit', cwd });
}
