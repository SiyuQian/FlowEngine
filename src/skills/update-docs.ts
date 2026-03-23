import type { SkillTemplate, CommandTemplate } from './types.js';

export function getUpdateDocsSkillTemplate(): SkillTemplate {
  return {
    name: 'flow-engine-update-docs',
    description: 'Review and update project documentation (README.md, CLAUDE.md, AGENTS.md) based on current project state or a specific archived change.',
    instructions: `Review and update project documentation to reflect the current state of the project.

**Input**: Optionally specify a change name (e.g., the change that was just archived). If omitted, perform a full documentation review.

**Steps**

1. **Determine review scope**

   **If change name provided:**
   - Search for the change in \`openspec/changes/archive/\` (match by suffix, e.g., \`*-<change-name>/\`)
   - Also check \`openspec/changes/<change-name>/\` for active changes
   - If not found in either location, report an error and stop
   - Read the change's artifacts: proposal.md, design.md, tasks.md, and specs/
   - These artifacts define what changed and will focus the review

   **If no change name provided:**
   - Read all main specs at \`openspec/specs/\`
   - Read package.json for project metadata
   - This is a full review — compare docs against overall project state

2. **Read existing documentation**

   Check for and read whichever of these files exist:
   - \`README.md\` (project root)
   - \`CLAUDE.md\` (project root or \`.claude/CLAUDE.md\`)
   - \`AGENTS.md\` (project root)

   **Skip missing files silently.** Do NOT create new documentation files.

3. **Analyze and identify stale sections**

   Using your judgment, compare the documentation against the project state (from step 1) and identify:
   - Sections that are outdated or incomplete
   - Missing information that should be documented
   - Information that is no longer accurate

   Consider:
   - Feature lists and capability descriptions
   - Usage instructions and examples
   - Installation and setup steps
   - API or command references
   - Project context and architecture notes

   **If no updates are needed**, report that all documentation is up to date and stop.

4. **Present changes for confirmation**

   For each file that needs updates:
   - Show the file name
   - Describe what changes are proposed and why
   - Use the Edit tool to make the changes
   - Wait for user approval before moving to the next file

   **If the user rejects changes for a file**, skip it and move to the next.

5. **Summary**

   After processing all files, show:
   - Which files were updated
   - Which files were skipped or had no changes needed

**Guardrails**
- Never create new documentation files — only update existing ones
- Always get user confirmation before writing changes
- Use AI judgment to determine what needs updating — no hardcoded section mappings
- Keep the existing document structure and tone
- Make minimal, focused changes — don't rewrite sections that are still accurate
- If a change is purely internal (refactor, no user-facing impact), it's OK to report no updates needed`,
  };
}

export function getUpdateDocsCommandTemplate(): CommandTemplate {
  return {
    name: 'Flow Engine: Update Docs',
    description: 'Review and update project documentation based on current project state or a specific change',
    category: 'Workflow',
    tags: ['workflow', 'documentation', 'flow-engine'],
    content: `Review and update project documentation to reflect the current state of the project.

**Input**: Optionally specify a change name after \`/flow-engine:update-docs\` (e.g., \`/flow-engine:update-docs add-auth\`). If omitted, perform a full documentation review.

**Steps**

1. **Determine review scope**

   **If change name provided:**
   - Search for the change in \`openspec/changes/archive/\` (match by suffix, e.g., \`*-<change-name>/\`)
   - Also check \`openspec/changes/<change-name>/\` for active changes
   - If not found in either location, report an error and stop
   - Read the change's artifacts: proposal.md, design.md, tasks.md, and specs/
   - These artifacts define what changed and will focus the review

   **If no change name provided:**
   - Read all main specs at \`openspec/specs/\`
   - Read package.json for project metadata
   - This is a full review — compare docs against overall project state

2. **Read existing documentation**

   Check for and read whichever of these files exist:
   - \`README.md\` (project root)
   - \`CLAUDE.md\` (project root or \`.claude/CLAUDE.md\`)
   - \`AGENTS.md\` (project root)

   **Skip missing files silently.** Do NOT create new documentation files.

3. **Analyze and identify stale sections**

   Using your judgment, compare the documentation against the project state (from step 1) and identify:
   - Sections that are outdated or incomplete
   - Missing information that should be documented
   - Information that is no longer accurate

   Consider:
   - Feature lists and capability descriptions
   - Usage instructions and examples
   - Installation and setup steps
   - API or command references
   - Project context and architecture notes

   **If no updates are needed**, report that all documentation is up to date and stop.

4. **Present changes for confirmation**

   For each file that needs updates:
   - Show the file name
   - Describe what changes are proposed and why
   - Use the Edit tool to make the changes
   - Wait for user approval before moving to the next file

   **If the user rejects changes for a file**, skip it and move to the next.

5. **Summary**

   After processing all files, show:
   - Which files were updated
   - Which files were skipped or had no changes needed

**Guardrails**
- Never create new documentation files — only update existing ones
- Always get user confirmation before writing changes
- Use AI judgment to determine what needs updating — no hardcoded section mappings
- Keep the existing document structure and tone
- Make minimal, focused changes — don't rewrite sections that are still accurate
- If a change is purely internal (refactor, no user-facing impact), it's OK to report no updates needed`,
  };
}
