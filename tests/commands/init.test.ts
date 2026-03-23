import { describe, it, expect } from 'vitest';
import { getSchemaDir, getTemplatesDir } from '../../src/commands/init.js';

describe('init paths', () => {
  it('getSchemaDir returns correct path', () => {
    const result = getSchemaDir('/project');
    expect(result).toBe('/project/openspec/schemas/flow-engine');
  });

  it('getTemplatesDir returns correct path', () => {
    const result = getTemplatesDir('/project');
    expect(result).toBe('/project/openspec/schemas/flow-engine/templates');
  });
});
