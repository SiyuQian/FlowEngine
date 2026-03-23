import { describe, it, expect } from 'vitest';
import { isOpenSpecInstalled, runOpenSpec, OPENSPEC_COMMANDS } from '../../src/utils/openspec.js';

describe('OPENSPEC_COMMANDS', () => {
  it('includes expected commands', () => {
    expect(OPENSPEC_COMMANDS).toContain('list');
    expect(OPENSPEC_COMMANDS).toContain('show');
    expect(OPENSPEC_COMMANDS).toContain('validate');
    expect(OPENSPEC_COMMANDS).toContain('archive');
    expect(OPENSPEC_COMMANDS).toContain('schema');
    expect(OPENSPEC_COMMANDS).toContain('status');
    expect(OPENSPEC_COMMANDS).toContain('instructions');
  });

  it('does not include workflow slash commands', () => {
    expect(OPENSPEC_COMMANDS).not.toContain('propose');
    expect(OPENSPEC_COMMANDS).not.toContain('apply');
    expect(OPENSPEC_COMMANDS).not.toContain('ff');
    expect(OPENSPEC_COMMANDS).not.toContain('continue');
  });
});

describe('isOpenSpecInstalled', () => {
  it('returns a boolean', () => {
    const result = isOpenSpecInstalled();
    expect(typeof result).toBe('boolean');
  });
});
