## Context

flow-engine extends OpenSpec with automated stages. After archiving a change, project documentation (README.md, CLAUDE.md, AGENTS.md) often becomes stale. There is no mechanism to prompt or assist with doc updates.

OpenSpec's workflow skills are generated from core templates and cannot be extended via config.yaml or custom schemas. To add post-archive behavior without modifying OpenSpec core, we create flow-engine's own skills that compose on top of the existing OpenSpec skills.

Current file structure:
```
.claude/
  commands/opsx/          ← OpenSpec-generated (don't touch)
    archive.md
    ...
  skills/                 ← OpenSpec-generated (don't touch)
    openspec-archive-change/
    ...
```

## Goals / Non-Goals

**Goals:**
- `/flow-engine:archive` wraps `/opsx:archive` and prompts for doc updates after
- `/flow-engine:update-docs` independently reviews and updates project docs
- No changes to OpenSpec core or OpenSpec-generated files
- User always confirms before any doc is written

**Non-Goals:**
- Structured mapping between specs and doc sections (using AI free judgment instead)
- Auto-running update-docs without user consent
- Modifying OpenSpec's archive skill template or generation pipeline

## Decisions

### 1. Skill composition via delegation, not code wrapping

The `/flow-engine:archive` skill instructs the AI to invoke the `openspec-archive-change` skill (via the Skill tool), then adds its own post-archive step. This is pure prompt-level composition — one skill calling another.

**Why not a code-level wrapper?** No runtime exists for skill composition. Skills are markdown instructions interpreted by the AI agent. Prompt-level delegation is the natural mechanism.

### 2. AI free judgment for doc updates (no section mapping)

The update-docs skill gives the AI full context (specs, archived change, current docs) and asks it to identify what's stale. No config file maps specs to doc sections.

**Why?** Document structures vary wildly between projects. A mapping system would be fragile and require maintenance. AI judgment is more adaptive and covers cases like tone, ordering, and cross-references that rules can't capture.

### 3. Skills generated from TS template functions, installed by `init`

Follow OpenSpec's pattern: skill content lives in TypeScript template functions, not static markdown files. The `init` command generates and writes them to the target project.

```
flow-engine repo:
  src/
    skills/
      types.ts                   ← SkillTemplate, CommandTemplate type definitions
      generation.ts              ← lightweight generateSkillContent + generateCommandFile
      archive.ts                 ← getArchiveSkillTemplate() + getArchiveCommandTemplate()
      update-docs.ts             ← getUpdateDocsSkillTemplate() + getUpdateDocsCommandTemplate()
    commands/
      init.ts                    ← adds step: generate flow-engine skills + commands

Target project (after init):
  .claude/
    commands/
      flow-engine/               ← NEW namespace
        archive.md               ← /flow-engine:archive
        update-docs.md           ← /flow-engine:update-docs
    skills/
      flow-engine-archive/       ← skill backing /flow-engine:archive
        SKILL.md
      flow-engine-update-docs/   ← skill backing /flow-engine:update-docs
        SKILL.md
```

**Why TS templates instead of static files?** Follows OpenSpec's established pattern. Allows future parameterization (e.g., injecting project-specific context). Keeps skill content co-located with the code that installs it.

**Why not import OpenSpec's `generateSkillContent`?** OpenSpec doesn't export these internal utilities. Rather than depending on unexported internals, flow-engine implements its own lightweight version (~20 lines). This avoids coupling to OpenSpec's internal API surface and breaking if they refactor.

### 4. File namespace separation

Separate `flow-engine/` namespace keeps these distinct from OpenSpec-generated `opsx/` commands. Both coexist in `.claude/` without conflict.

### 5. update-docs supports two modes via optional argument

- `change-name` provided → read archived change artifacts, focus review on changes introduced
- No argument → full review comparing all docs against current project state (specs, code)

Both modes read whichever docs exist (README.md, CLAUDE.md, AGENTS.md) — skip missing files silently.

## Risks / Trade-offs

- **AI judgment quality** → update-docs may suggest unnecessary or incorrect changes. Mitigation: always require user confirmation, present diffs clearly.
- **archive wrapper divergence** → if OpenSpec changes the archive skill significantly, the wrapper's delegation may break. Mitigation: the wrapper delegates to the skill by name, which is a stable interface.
- **Dual archive commands** → users may be confused about `/opsx:archive` vs `/flow-engine:archive`. Mitigation: document in README that `/flow-engine:archive` is the recommended command.
