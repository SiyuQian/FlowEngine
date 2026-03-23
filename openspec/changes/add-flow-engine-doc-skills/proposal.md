## Why

After archiving a change, project documentation (README.md, CLAUDE.md, AGENTS.md) often falls out of sync with the actual project state. Currently there's no workflow to prompt or assist with doc updates — users have to remember to do it manually, and they usually don't.

## What Changes

- Add `/flow-engine:archive` — a wrapper around `/opsx:archive` that performs the standard archive, then prompts the user to run `/flow-engine:update-docs`
- Add `/flow-engine:update-docs [change-name?]` — an independent skill that reads project docs and current project state, uses AI judgment to identify stale sections, and presents changes for user confirmation before writing
- Both skills are Claude Code commands + skills living in `.claude/` — no OpenSpec core changes

## Capabilities

### New Capabilities
- `archive-wrapper`: Wraps the standard OpenSpec archive workflow with a post-archive documentation update prompt
- `update-docs`: Independent documentation review and update skill that can be triggered post-archive or standalone

### Modified Capabilities

(none)

## Impact

- New files in `.claude/commands/flow-engine/` and `.claude/skills/`
- No changes to existing OpenSpec skills or flow-engine source code
- No dependency changes
