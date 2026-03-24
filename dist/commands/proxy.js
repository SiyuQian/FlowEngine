import { OPENSPEC_COMMANDS, runOpenSpec } from '../utils/openspec.js';
export function isProxiedCommand(command) {
    return OPENSPEC_COMMANDS.includes(command);
}
export function proxyToOpenSpec(args) {
    try {
        runOpenSpec(args);
    }
    catch (err) {
        const exitCode = err?.status ?? 1;
        process.exit(exitCode);
    }
}
