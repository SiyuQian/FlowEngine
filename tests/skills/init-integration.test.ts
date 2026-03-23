import { describe, it, expect } from 'vitest';
import { getFlowEngineSkills } from '../../src/skills/index.js';
import { generateSkillContent, generateCommandFile } from '../../src/skills/generation.js';

describe('flow-engine skills registry', () => {
  const skills = getFlowEngineSkills();

  it('registers archive and update-docs skills', () => {
    const names = skills.map((s) => s.skillDirName);
    expect(names).toContain('flow-engine-archive');
    expect(names).toContain('flow-engine-update-docs');
  });

  it('each entry has matching skill and command', () => {
    for (const entry of skills) {
      expect(entry.skill.name).toBeTruthy();
      expect(entry.command.name).toBeTruthy();
      expect(entry.skillDirName).toBeTruthy();
      expect(entry.commandId).toBeTruthy();
    }
  });

  it('generated skill files are valid markdown with frontmatter', () => {
    for (const entry of skills) {
      const content = generateSkillContent(entry.skill);
      expect(content.startsWith('---\n')).toBe(true);
      expect(content.split('---').length).toBeGreaterThanOrEqual(3);
      expect(content).toContain(`name: ${entry.skill.name}`);
    }
  });

  it('generated command files are valid markdown with frontmatter', () => {
    for (const entry of skills) {
      const content = generateCommandFile(entry.command);
      expect(content.startsWith('---\n')).toBe(true);
      expect(content.split('---').length).toBeGreaterThanOrEqual(3);
      expect(content).toContain('category: Workflow');
    }
  });

  it('skill dir names use flow-engine prefix', () => {
    for (const entry of skills) {
      expect(entry.skillDirName.startsWith('flow-engine-')).toBe(true);
    }
  });
});
