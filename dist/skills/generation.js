export function generateSkillContent(template) {
    return `---
name: ${template.name}
description: ${template.description}
---

${template.instructions}
`;
}
export function generateCommandFile(template) {
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
