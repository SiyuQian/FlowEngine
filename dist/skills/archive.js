export function getArchiveSkillTemplate() {
    return {
        name: 'flow-engine-archive',
        description: 'Archive a completed change and prompt for documentation updates. Wraps the standard OpenSpec archive workflow.',
        instructions: `Archive a completed change, then prompt for documentation updates.

**Input**: Optionally specify a change name. If omitted, the underlying archive skill will prompt for selection.

**Steps**

1. **Run the standard OpenSpec archive**

   Use the **Skill tool** to invoke \`openspec-archive-change\` with the change name (if provided).

   This performs the full archive workflow:
   - Validates artifacts and tasks
   - Offers delta spec sync
   - Moves change to \`openspec/changes/archive/YYYY-MM-DD-<name>/\`

   Wait for the archive to complete.

2. **On successful archive, prompt for documentation update**

   After the archive completes successfully, display:

   \`\`\`
   **Next:** To update project documentation based on this change, run:
   /flow-engine:update-docs <change-name>
   \`\`\`

   Replace \`<change-name>\` with the actual change name that was archived.

   **Do NOT automatically run update-docs.** Only show the prompt and let the user decide.

3. **On archive failure, skip the prompt**

   If the archive fails or is cancelled, do NOT show the update-docs prompt.

**Guardrails**
- Always delegate to \`openspec-archive-change\` — do not reimplement archive logic
- Only show the update-docs prompt after a successful archive
- Do not run update-docs automatically — the user chooses whether to run it`,
    };
}
export function getArchiveCommandTemplate() {
    return {
        name: 'Flow Engine: Archive',
        description: 'Archive a completed change and prompt for documentation updates',
        category: 'Workflow',
        tags: ['workflow', 'archive', 'flow-engine'],
        content: `Archive a completed change, then prompt for documentation updates.

**Input**: Optionally specify a change name after \`/flow-engine:archive\` (e.g., \`/flow-engine:archive add-auth\`). If omitted, the underlying archive skill will prompt for selection.

**Steps**

1. **Run the standard OpenSpec archive**

   Use the **Skill tool** to invoke \`openspec-archive-change\` with the change name (if provided).

   This performs the full archive workflow:
   - Validates artifacts and tasks
   - Offers delta spec sync
   - Moves change to \`openspec/changes/archive/YYYY-MM-DD-<name>/\`

   Wait for the archive to complete.

2. **On successful archive, prompt for documentation update**

   After the archive completes successfully, display:

   \`\`\`
   **Next:** To update project documentation based on this change, run:
   /flow-engine:update-docs <change-name>
   \`\`\`

   Replace \`<change-name>\` with the actual change name that was archived.

   **Do NOT automatically run update-docs.** Only show the prompt and let the user decide.

3. **On archive failure, skip the prompt**

   If the archive fails or is cancelled, do NOT show the update-docs prompt.

**Guardrails**
- Always delegate to \`openspec-archive-change\` — do not reimplement archive logic
- Only show the update-docs prompt after a successful archive
- Do not run update-docs automatically — the user chooses whether to run it`,
    };
}
