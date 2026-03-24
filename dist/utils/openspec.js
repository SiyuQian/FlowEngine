import { execFileSync } from 'node:child_process';
export const OPENSPEC_COMMANDS = [
    'list', 'show', 'validate', 'archive',
    'schema', 'view', 'templates', 'status',
    'config', 'update', 'instructions', 'new',
];
export function runOpenSpec(args, cwd) {
    execFileSync('openspec', args, { stdio: 'inherit', cwd });
}
