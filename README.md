# flow-engine

Fully automated spec-driven development workflow built on [OpenSpec](https://github.com/Fission-AI/OpenSpec).

Write a spec with AI, then walk away — flow-engine handles implementation, testing, verification, and review automatically.

## How It Works

```
[You + AI]                              [Fully Automated]
propose → specs → design → tasks   →   implement → test → verify → review
```

1. **You write a spec** with AI using OpenSpec's standard workflow (`/opsx:propose`)
2. **You trigger apply** (`/opsx:apply`) and walk away
3. **AI executes the full pipeline** — implements code, generates tests, runs multi-layer verification, produces a final review report
4. **You come back** and read the report. Fix any TODOs. Archive.

When AI encounters uncertainty, it follows a 4-level protocol: research the codebase → search the web → run experiments → fallback with TODO. It only stops when nothing else can be tried.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [OpenSpec](https://github.com/Fission-AI/OpenSpec) CLI installed globally:
  ```bash
  npm install -g openspec
  ```
- An IDE with an AI agent that supports OpenSpec slash commands (Claude Code, Cursor, etc.)

## Installation

```bash
npx github:siyuqian/flow-engine init
```

This command:
1. Initializes OpenSpec in your project (if not already done)
2. Installs the `flow-engine` custom schema with automation templates
3. Sets `flow-engine` as the default schema

## Usage

### 1. Start a new change (in your IDE)

```
> /opsx:propose add-user-auth
```

AI collaborates with you to create:
- `proposal.md` — why this change is needed
- `specs/` — requirements with Given/When/Then scenarios
- `design.md` — technical approach
- `tasks.md` — implementation checklist

Review and approve these before continuing.

### 2. Run the automated pipeline (in your IDE)

```
> /opsx:apply
```

AI automatically executes:

| Stage | What it does | Output |
|-------|-------------|--------|
| **Implement** | Writes code for each task | `implement-report.md` + code changes |
| **Test** | Generates tests from spec scenarios, runs them | `test-report.md` + test files |
| **Verify** | 3-layer check: tests, spec alignment, code review | `verify-report.md` |
| **Review** | Final summary with human action items | `review-report.md` |

### 3. Check results

```bash
openspec status --change add-user-auth
```

Read the reports directly:
- `openspec/changes/add-user-auth/review-report.md` — start here
- `openspec/changes/add-user-auth/verify-report.md` — verification details
- `openspec/changes/add-user-auth/test-report.md` — test results

### 4. Archive when done

```
> /flow-engine:archive add-user-auth
```

Delta specs merge into your main specs. The change (with all reports) moves to archive.

After archiving, you'll be prompted to update project documentation:

```
> /flow-engine:update-docs add-user-auth
```

This reviews README.md, CLAUDE.md, and AGENTS.md against the archived change and suggests updates. You can also run it independently at any time for a full documentation review:

```
> /flow-engine:update-docs
```

## Resuming After Interruption

If the pipeline is interrupted (IDE crash, token limit, etc.), just re-run `/opsx:apply`. The AI checks which report files exist and resumes from where it left off.

## CLI Commands

```bash
# Initialize flow-engine in a project
npx github:siyuqian/flow-engine init

# All OpenSpec CLI commands are proxied:
npx github:siyuqian/flow-engine list
npx github:siyuqian/flow-engine show <name>
npx github:siyuqian/flow-engine status --change <name>
npx github:siyuqian/flow-engine validate
npx github:siyuqian/flow-engine archive <name>
npx github:siyuqian/flow-engine schema <subcommand>
```

## Custom Schema

flow-engine extends OpenSpec's `spec-driven` schema with 4 automated stages. The schema and templates are installed in your project at `openspec/schemas/flow-engine/`.

You can customize the templates to adjust automation behavior — they are plain markdown files that instruct the AI agent.

## License

MIT
