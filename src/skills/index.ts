import type { SkillEntry } from './types.js';
import { getArchiveSkillTemplate, getArchiveCommandTemplate } from './archive.js';
import { getUpdateDocsSkillTemplate, getUpdateDocsCommandTemplate } from './update-docs.js';

export function getFlowEngineSkills(): SkillEntry[] {
  return [
    {
      skill: getArchiveSkillTemplate(),
      command: getArchiveCommandTemplate(),
      skillDirName: 'flow-engine-archive',
      commandId: 'archive',
    },
    {
      skill: getUpdateDocsSkillTemplate(),
      command: getUpdateDocsCommandTemplate(),
      skillDirName: 'flow-engine-update-docs',
      commandId: 'update-docs',
    },
  ];
}
