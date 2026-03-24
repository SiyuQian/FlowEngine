import type { SkillTemplate, CommandTemplate } from './types.js';

export function generateSkillContent(template: SkillTemplate): string {
  return `---
name: ${template.name}
description: ${template.description}
---

${template.instructions}
`;
}

export function generateCommandFile(template: CommandTemplate): string {
  const tags = `[${template.tags.join(', ')}]`;
  return `---
name: "${template.name}"
description: ${template.description}
category: ${template.category}
tags: ${tags}
---

${template.content}
`;
}
