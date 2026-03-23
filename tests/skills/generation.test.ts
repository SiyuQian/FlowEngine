import { describe, it, expect } from 'vitest';
import { generateSkillContent, generateCommandFile } from '../../src/skills/generation.js';
import type { SkillTemplate, CommandTemplate } from '../../src/skills/types.js';

describe('generateSkillContent', () => {
  const template: SkillTemplate = {
    name: 'test-skill',
    description: 'A test skill',
    instructions: 'Do the thing.\n\n**Steps**\n\n1. Step one',
  };

  it('generates valid YAML frontmatter with name and description', () => {
    const result = generateSkillContent(template);
    expect(result).toContain('name: test-skill');
    expect(result).toContain('description: A test skill');
  });

  it('includes instructions after frontmatter', () => {
    const result = generateSkillContent(template);
    const parts = result.split('---');
    const body = parts[2];
    expect(body).toContain('Do the thing.');
    expect(body).toContain('**Steps**');
  });

  it('has proper frontmatter delimiters', () => {
    const result = generateSkillContent(template);
    expect(result.startsWith('---\n')).toBe(true);
    expect(result).toMatch(/---\n[\s\S]+\n---\n/);
  });
});

describe('generateCommandFile', () => {
  const template: CommandTemplate = {
    name: 'Test Command',
    description: 'A test command',
    category: 'Workflow',
    tags: ['test', 'example'],
    content: 'Command instructions here.',
  };

  it('generates valid YAML frontmatter', () => {
    const result = generateCommandFile(template);
    expect(result).toContain('name: "Test Command"');
    expect(result).toContain('description: A test command');
    expect(result).toContain('category: Workflow');
  });

  it('formats tags as array', () => {
    const result = generateCommandFile(template);
    expect(result).toContain('tags: [test, example]');
  });

  it('includes content after frontmatter', () => {
    const result = generateCommandFile(template);
    const parts = result.split('---');
    const body = parts[2];
    expect(body).toContain('Command instructions here.');
  });
});
