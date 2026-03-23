# Flow Engine Design Spec

## Problem

AI coding assistants still stop to ask humans questions during implementation because:

1. It's hard to fully specify requirements upfront
2. AI lacks a protocol for resolving uncertainty autonomously
3. Testing and verification require manual human effort

**Goal**: After human + AI collaboratively write a spec, the entire pipeline from implementation to verification runs fully automatically. AI only escalates to humans when all self-resolution strategies are exhausted.

## Solution Overview

Flow Engine is a TypeScript CLI (superset of OpenSpec CLI) paired with a custom OpenSpec schema that extends the standard `propose → specs → design → tasks` workflow with four fully automated stages: `implement → test → verify → review`.

The automation is delivered through **skill templates** — self-contained instruction documents injected into each stage via OpenSpec's template mechanism. Any IDE with an AI agent that can read these templates can execute the pipeline.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      flow-engine CLI                          │
│                                                               │
│  ┌───────────────────┐  ┌──────────────────────────────────┐ │
│  │  OpenSpec Proxy    │  │  Flow Commands                   │ │
│  │                    │  │                                   │ │
│  │  flow list         │  │  flow init   (project setup)      │ │
│  │  flow show         │  │                                   │ │
│  │  flow validate     │  │                                   │ │
│  │  flow archive      │  │                                   │ │
│  │  flow schema       │  │                                   │ │
│  │  ... (all openspec │  │                                   │ │
│  │       CLI cmds)    │  │                                   │ │
│  └───────────────────┘  └──────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  OpenSpec (npm dependency)                               │ │
│  │  spec management · schema engine · artifact generation   │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Three layers**:

1. **OpenSpec layer** — spec management, schema DAG, artifact generation, archive (fully reused)
2. **Skill templates** — self-contained instruction documents for each automated stage, delivered via OpenSpec's template mechanism
3. **CLI layer** — unified entry point, proxies all OpenSpec CLI commands + adds `flow init`

## Execution Model

There are two distinct interaction modes in flow-engine:

### Mode 1: AI Agent Slash Commands (IDE-driven)

OpenSpec's workflow commands (`/opsx:propose`, `/opsx:ff`, `/opsx:continue`, `/opsx:apply`, `/opsx:verify`, `/opsx:archive`) are **AI agent skill templates** (not terminal CLI commands). They are executed by the AI agent inside an IDE (Claude Code, Cursor, etc.).

Under the hood, each slash command is a skill template that instructs the AI agent to call OpenSpec CLI commands in sequence. For example, `/opsx:apply` tells the agent to:

1. Run `openspec status --change "<name>" --json` to check artifact readiness
2. Run `openspec instructions apply --change "<name>" --json` to get the apply instructions (including `apply.instruction` from the schema)
3. Read the task file, implement each task, check off completed items

**How flow-engine extends this**: The flow-engine schema's `apply.instruction` field tells the AI agent to continue through `implement → test → verify → review` after completing tasks. For each stage, the agent calls:

```bash
openspec instructions <artifact-id> --change "<name>" --json
```

This returns the stage's template (the full skill instructions) + instruction + project context + rules. The agent reads this output and follows the skill template autonomously.

**The automated chain in detail:**

```
/opsx:apply
  │
  ├─ 1. openspec instructions apply --change "X" --json
  │     → returns: apply.instruction ("continue through implement → test → verify → review")
  │     → agent completes tasks.md items
  │
  ├─ 2. openspec instructions implement --change "X" --json
  │     → returns: implement.md template + instruction + context
  │     → agent implements code, writes implement-report.md
  │
  ├─ 3. openspec instructions test --change "X" --json
  │     → returns: test.md template + instruction + context
  │     → agent generates tests, runs them, writes test-report.md
  │
  ├─ 4. openspec instructions verify --change "X" --json
  │     → returns: verify.md template + instruction + context
  │     → agent runs 3-layer verification, writes verify-report.md
  │
  └─ 5. openspec instructions review --change "X" --json
        → returns: review.md template + instruction + context
        → agent generates final summary, writes review-report.md
```

The entire chain runs within a single AI agent session — no human intervention needed.

| Slash Command | Behavior with flow-engine schema |
|--------------|----------------------------------|
| `/opsx:propose` | Standard: human + AI collaborate on proposal → specs → design → tasks |
| `/opsx:ff` | Standard: fast-forward to create all planning artifacts at once |
| `/opsx:apply` | **Enhanced**: after completing tasks, automatically continues through implement → test → verify → review by calling `openspec instructions` for each stage |
| `/opsx:verify` | **Enhanced**: triggers the multi-layer verification defined in verify.md template |
| `/opsx:archive` | Standard: merge delta specs, move change to archive/ |

### Mode 2: Terminal CLI Commands

The `flow` CLI handles project management tasks that don't require an AI agent:

```bash
flow init                    # Set up project with flow-engine schema
flow list                    # List changes (→ openspec list)
flow show <name>             # Show change details (→ openspec show)
flow validate                # Validate specs (→ openspec validate)
flow archive <name>          # Archive change (→ openspec archive)
flow schema <subcommand>     # Schema management (→ openspec schema)
```

## Apply Automation Strategy

Flow-engine does **not** override OpenSpec's default `/opsx:apply` skill template. Instead, it relies on the schema's `apply.instruction` field to inject the automation directive. When the AI agent executes `/opsx:apply`, it reads the apply instruction from the schema (via `openspec instructions apply --json`) and sees:

```
After completing all tasks, continue through the automated pipeline:
implement → test → verify → review. Each stage has a template with
full instructions. Do not stop to ask the human. Follow the
Uncertainty Resolution Protocol when encountering unknowns.
```

This depends on the AI agent being capable enough to follow the instruction and call `openspec instructions <artifact-id>` for each subsequent stage. This is a reasonable assumption for current-generation AI agents (Claude, GPT, etc.) — the instruction is explicit and the mechanism (`openspec instructions`) is standard OpenSpec.

**Tradeoff**: This approach avoids any fragile file-overwriting of OpenSpec's built-in skill templates, but it means the automation quality depends on how well the AI agent follows the `apply.instruction`. If a weaker model ignores it and stops after tasks, the user can manually trigger each stage via `openspec instructions <stage>` in the IDE.

## Custom Schema

```yaml
# openspec/schemas/flow-engine/schema.yaml
name: flow-engine
version: 1
description: Fully automated spec-driven development workflow

artifacts:
  # === Human + AI Collaboration Phase ===
  - id: proposal
    generates: proposal.md
    template: proposal.md
    requires: []

  - id: specs
    generates: specs/**/*.md
    template: spec.md
    requires: [proposal]

  - id: design
    generates: design.md
    template: design.md
    requires: [proposal]

  - id: tasks
    generates: tasks.md
    template: tasks.md
    requires: [specs, design]

  # === Fully Automated Phase (executed by AI agent during /opsx:apply) ===
  # These artifacts use templates as full skill instructions.
  # The instruction field is a short summary for OpenSpec's artifact listing;
  # the template contains the complete, authoritative instructions.
  # Note: `generates` points to the report file (for OpenSpec completion tracking).
  # Actual code/test file changes are produced by the AI agent as directed by
  # the template, outside of OpenSpec's artifact system.
  - id: implement
    generates: implement-report.md
    template: implement.md
    instruction: |
      Implement all tasks autonomously. Follow Uncertainty Resolution Protocol.
    requires: [tasks]

  - id: test
    generates: test-report.md
    template: test.md
    instruction: |
      Generate tests from spec scenarios. Run and auto-fix failures.
    requires: [implement]

  - id: verify
    generates: verify-report.md
    template: verify.md
    instruction: |
      Three-layer verification: tests, spec alignment, code review.
    requires: [test]

  - id: review
    generates: review-report.md
    template: review.md
    instruction: |
      Summarize all reports. List items needing human attention.
    requires: [verify]

apply:
  requires: [tasks]
  tracks: tasks.md
  instruction: |
    After completing all tasks, continue through the automated pipeline:
    implement → test → verify → review. For each stage, call
    `openspec instructions <stage> --change "<name>" --json` to get
    the full skill template, then execute it.

    Before starting, check which report files already exist in the change
    directory. Skip stages that have completed reports. Resume from the
    first stage without a report.

    Do not stop to ask the human. Follow the Uncertainty Resolution
    Protocol when encountering unknowns.
```

### Dependency Graph

```
proposal → specs ──┐
     │              ├→ tasks → implement → test → verify → review
     └→ design ────┘

[human + AI]          [fully automated]
```

## Skill Templates

Each automated stage is driven by a self-contained template in `openspec/schemas/flow-engine/templates/`. Templates are IDE-agnostic — any AI agent that reads the template content can execute the stage.

### Shared: Uncertainty Resolution Protocol

All automated skill templates include this protocol:

```markdown
## Uncertainty Resolution Protocol

When you encounter uncertainty during execution:

### Level 1: Self-Research (try first)
- Read relevant source code and comments
- Check git history for context
- Read project docs, README, CLAUDE.md, etc.
- Search for similar patterns in the codebase

### Level 2: External Research (if L1 insufficient)
- Search the web for API docs, library usage
- Read third-party library source code
- Check GitHub issues/discussions for known problems

### Level 3: Experiment (if L2 insufficient)
- Write a small isolated test to validate assumptions
- Run the code with debug output
- Try the approach in a scratch file first

### Level 4: Fallback (if L1-L3 all fail, max 3 attempts total)
- Use the most conservative/standard implementation
- Mark with `// TODO(flow-engine): <description of uncertainty>`
- Log the issue in the report with what was tried
- Continue to next task
```

### Template Summary

| Template | Input | Responsibility | Output |
|----------|-------|----------------|--------|
| `implement.md` | tasks.md + design.md + specs | Implement each task autonomously | implement-report.md + code changes |
| `test.md` | specs (Given/When/Then) + code + implement-report.md | Generate tests from spec scenarios, run them, auto-fix failures | test-report.md + test files |
| `verify.md` | specs + code + test-report.md | Three-layer verification (tests / spec alignment / code review) | verify-report.md |
| `review.md` | all reports + specs | Summarize full pipeline results, list items needing human attention | review-report.md |

### Report Chain

Each stage reads the previous stage's report for context:

```
tasks.md
   ↓
implement-report.md  → what was done, what was skipped, all TODOs
   ↓
test-report.md       → test coverage, pass/fail, fix attempts
   ↓
verify-report.md     → three-layer verification results
   ↓
review-report.md     → final summary, human action items
```

## CLI Design

### Technology

- **Runtime**: Node.js >= 20
- **Language**: TypeScript
- **CLI framework**: [cac](https://github.com/cacjs/cac)
- **Dependency**: `openspec` (npm package)

### Commands

```bash
# === flow-engine specific command ===
flow init                    # Initialize project: install openspec + inject flow-engine schema

# === Proxied OpenSpec CLI commands (identical behavior) ===
flow list                    # → openspec list
flow show <name>             # → openspec show <name>
flow validate                # → openspec validate
flow archive <name>          # → openspec archive <name>
flow schema <subcommand>     # → openspec schema <subcommand>
flow view                    # → openspec view (interactive dashboard)
flow templates               # → openspec templates
flow status                  # → openspec status (shows artifact completion)
```

Note: Workflow commands like `propose`, `apply`, `ff`, `continue`, `verify` are **AI agent slash commands** (`/opsx:propose`, `/opsx:apply`, etc.), not terminal CLI commands. They are executed by the AI agent inside the IDE, not by the `flow` CLI. See [Execution Model](#execution-model) above.

### `flow init` Behavior

```
1. Check that openspec CLI is installed (error with install instructions if not)

2. Detect if openspec/ directory exists
   ├─ exists → inject flow-engine schema only
   └─ missing → run `openspec init` (pass through any flags) + inject flow-engine schema

3. Fork the spec-driven schema as base:
   run `openspec schema fork spec-driven flow-engine`
   This copies the standard templates (proposal.md, spec.md, design.md, tasks.md)

4. Overwrite schema.yaml with flow-engine schema definition
   (adds implement/test/verify/review artifacts + custom apply.instruction)

5. Write the 4 automation templates into the forked schema:
   openspec/schemas/flow-engine/templates/
       ├── proposal.md      (from spec-driven, unchanged)
       ├── spec.md           (from spec-driven, unchanged)
       ├── design.md         (from spec-driven, unchanged)
       ├── tasks.md          (from spec-driven, unchanged)
       ├── implement.md      (flow-engine specific)
       ├── test.md           (flow-engine specific)
       ├── verify.md         (flow-engine specific)
       └── review.md         (flow-engine specific)

6. Update openspec/config.yaml
   └── schema: flow-engine
   (If config.yaml already has a different schema, warn and ask for confirmation)

7. Output: "flow-engine initialized. Use '/opsx:propose <name>' in your IDE to start."
```

`flow init` is idempotent — running it again updates the schema and template files without breaking existing changes.

### Proxy Mechanism

Known OpenSpec CLI commands are forwarded. Unrecognized commands show help.

```typescript
import { execSync } from 'child_process';

const OPENSPEC_COMMANDS = [
  'list', 'show', 'validate', 'archive',
  'schema', 'view', 'templates', 'status',
  'config', 'update', 'instructions'
];

export function proxy(command: string, args: string[]) {
  if (!OPENSPEC_COMMANDS.includes(command)) {
    console.error(`Unknown command: ${command}`);
    process.exit(1);
  }
  try {
    execSync(`openspec ${command} ${args.join(' ')}`, { stdio: 'inherit' });
  } catch {
    // openspec will have printed its own error
    process.exit(1);
  }
}
```

Note: `openspec` must be installed globally or available in PATH. `flow init` checks for this.

### Project Structure

```
flow-engine/
├── package.json              # bin: { "flow": "./dist/cli.js" }
├── tsconfig.json
├── src/
│   ├── cli.ts                # Entry point, command routing (cac)
│   ├── commands/
│   │   ├── init.ts           # flow init (fork schema + inject templates)
│   │   └── proxy.ts          # Forward to openspec CLI
│   ├── schema/               # Bundled flow-engine schema + templates
│   │   ├── schema.yaml
│   │   └── templates/
│   │       ├── implement.md  # Skill: autonomous code implementation
│   │       ├── test.md       # Skill: spec-driven test generation
│   │       ├── verify.md     # Skill: three-layer verification
│   │       └── review.md     # Skill: final summary & human action items
│   └── utils/
│       └── openspec.ts       # openspec CLI invocation wrapper
└── dist/
```

Note: Standard templates (proposal.md, spec.md, design.md, tasks.md) are forked from OpenSpec's `spec-driven` schema at `flow init` time, not bundled in the flow-engine package.

## End-to-End Example

```bash
# 1. One-time project setup (terminal)
$ flow init
✓ openspec initialized
✓ flow-engine schema installed
✓ config.yaml updated (schema: flow-engine)
```

```
# 2. Start a new change (in IDE, human + AI collaboration)
> /opsx:propose add-user-auth
# → AI collaborates with human to generate proposal.md, specs/, design.md, tasks.md
# → Human reviews and approves

# 3. Fully automated execution (in IDE, human steps away)
> /opsx:apply
# → AI reads tasks.md and implements each task
# → AI continues to implement → test → verify → review automatically
# → Each stage reads its template as skill instructions
# → Uncertainty Resolution Protocol handles unknowns autonomously
# → Human does NOT need to intervene
```

```bash
# 4. Human returns to check results (terminal or IDE)
$ flow status --change add-user-auth
# → openspec status shows all artifacts (including reports) completed

# Or read the reports directly:
# openspec/changes/add-user-auth/review-report.md  ← final summary
# openspec/changes/add-user-auth/verify-report.md  ← verification details
# openspec/changes/add-user-auth/test-report.md    ← test results

# 5. Human resolves TODOs if needed, then archive
$ flow archive add-user-auth
# → delta specs merge into main specs
# → change moves to archive/ (with all reports preserved)
```

## Error Recovery

If the automated pipeline is interrupted (IDE crash, token limit, network failure), the user re-triggers `/opsx:apply`. The agent determines where to resume by checking which report files exist in the change directory:

- `implement-report.md` exists → skip implement, start from test
- `implement-report.md` + `test-report.md` exist → skip both, start from verify
- etc.

Re-running a stage is safe because each stage reads its inputs (previous reports, specs, code) fresh. No separate state file is needed — the report files themselves are the state.

The `apply.instruction` includes: "Before starting, check which report files already exist in the change directory. Skip stages that have completed reports. Resume from the first stage without a report."

## Design Decisions

### Why extend OpenSpec rather than build from scratch?
OpenSpec already solves spec management, delta specs, schema DAG, and artifact generation. Building on it avoids reinventing these capabilities and stays compatible with the OpenSpec ecosystem.

### Why skill templates rather than hardcoded agent logic?
Templates are IDE-agnostic. Any AI agent that can read markdown instructions can execute the pipeline. This avoids coupling to Claude Code, Cursor, or any specific tool.

### Why a report chain rather than a shared state store?
Markdown reports are human-readable, version-controlled, and archived with the change. They serve as both execution context for downstream stages and audit trail for humans.

### Why fallback with TODO rather than blocking on errors?
The goal is maximum autonomy. Blocking on every uncertainty defeats the purpose. Conservative implementations with clear TODO markers let the pipeline continue while giving humans a precise list of items needing attention.
