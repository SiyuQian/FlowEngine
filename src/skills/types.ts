export interface SkillTemplate {
  name: string;
  description: string;
  instructions: string;
}

export interface CommandTemplate {
  name: string;
  description: string;
  category: string;
  tags: string[];
  content: string;
}

export interface SkillEntry {
  skill: SkillTemplate;
  command: CommandTemplate;
  skillDirName: string;
  commandId: string;
}
