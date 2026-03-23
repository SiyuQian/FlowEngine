## 1. Skill generation infrastructure

- [x] 1.1 Create `src/skills/generation.ts` — lightweight `generateSkillContent()` and `generateCommandFile()` functions (follows OpenSpec's pattern but self-contained, no imports from OpenSpec internals)
- [x] 1.2 Create `src/skills/types.ts` — `SkillTemplate` and `CommandTemplate` type definitions

## 2. Skill template functions

- [x] 2.1 Create `src/skills/update-docs.ts` — `getUpdateDocsSkillTemplate()` and `getUpdateDocsCommandTemplate()` (two modes: with change-name and without, AI free judgment, user confirmation before writing)
- [x] 2.2 Create `src/skills/archive.ts` — `getArchiveSkillTemplate()` and `getArchiveCommandTemplate()` (delegates to `openspec-archive-change` skill, then prompts for `/flow-engine:update-docs`)

## 3. Init command integration

- [x] 3.1 Update `src/commands/init.ts` to generate and install flow-engine skills and commands into target project's `.claude/` directory during `flow init`
- [x] 3.2 Update build script in `package.json` if needed (ensure templates are included in dist)

## 4. Tests

- [x] 4.1 Add tests for `generateSkillContent()` and `generateCommandFile()`
- [x] 4.2 Add tests for init command verifying skills and commands are written to correct paths

## 5. Documentation

- [x] 5.1 Update README.md to document `/flow-engine:archive` and `/flow-engine:update-docs` in the Usage section
