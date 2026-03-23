import { describe, it, expect } from 'vitest';
import { isProxiedCommand } from '../../src/commands/proxy.js';

describe('isProxiedCommand', () => {
  it('returns true for known openspec commands', () => {
    expect(isProxiedCommand('list')).toBe(true);
    expect(isProxiedCommand('show')).toBe(true);
    expect(isProxiedCommand('validate')).toBe(true);
    expect(isProxiedCommand('archive')).toBe(true);
    expect(isProxiedCommand('status')).toBe(true);
  });

  it('returns false for flow-engine commands', () => {
    expect(isProxiedCommand('init')).toBe(false);
  });

  it('returns false for unknown commands', () => {
    expect(isProxiedCommand('foo')).toBe(false);
  });
});
