# Flow Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a TypeScript CLI (`flow`) that wraps OpenSpec with a custom schema enabling fully automated implement → test → verify → review pipeline.

**Architecture:** The CLI has one original command (`flow init`) and proxies everything else to `openspec`. The automation is delivered through 4 skill templates (implement.md, test.md, verify.md, review.md) bundled in a custom OpenSpec schema. Standard templates are forked from OpenSpec's `spec-driven` schema at init time.

**Tech Stack:** TypeScript, Node.js >= 20, cac (CLI framework), openspec (npm dependency)

**Spec:** `docs/superpowers/specs/2026-03-23-flow-engine-design.md`

---

## File Map

```
flow-engine/
├── package.json                          # Package config, bin entry, prepare script
├── tsconfig.json                         # TypeScript config
├── README.md                             # User-facing documentation
├── src/
│   ├── cli.ts                            # CLI entry point, cac command routing
│   ├── commands/
│   │   ├── init.ts                       # `flow init` — fork schema, inject templates, update config
│   │   └── proxy.ts                      # Forward unrecognized commands to openspec
│   ├── schema/                           # Bundled schema + automation templates
│   │   ├── schema.yaml                   # flow-engine schema definition
│   │   └── templates/
│   │       ├── implement.md              # Skill: autonomous code implementation
│   │       ├── test.md                   # Skill: spec-driven test generation
│   │       ├── verify.md                 # Skill: three-layer verification
│   │       └── review.md                 # Skill: final summary report
│   └── utils/
│       └── openspec.ts                   # Helpers: detect openspec, run openspec commands
├── tests/
│   ├── commands/
│   │   ├── init.test.ts                  # Tests for flow init path helpers
│   │   └── proxy.test.ts                 # Tests for proxy mechanism
│   ├── e2e/
│   │   └── init.test.ts                  # E2E test for flow init
│   └── utils/
│       └── openspec.test.ts              # Tests for openspec helpers
└── .gitignore
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `src/cli.ts`

- [ ] **Step 1: Initialize git repo**

```bash
cd /Users/siyu/Works/github.com/siyuqian/flow-engine
git init
```

- [ ] **Step 2: Create package.json**

```json
{
  "name": "flow-engine",
  "version": "0.1.0",
  "description": "Fully automated spec-driven development workflow built on OpenSpec",
  "type": "module",
  "bin": {
    "flow": "./dist/cli.js"
  },
  "scripts": {
    "build": "tsc && npm run copy-schema",
    "copy-schema": "node -e \"const fs=require('fs');fs.cpSync('src/schema','dist/schema',{recursive:true})\"",
    "prepare": "npm run build",
    "dev": "tsc --watch",
    "test": "vitest",
    "lint": "tsc --noEmit"
  },
  "engines": {
    "node": ">=20"
  },
  "dependencies": {
    "cac": "^6.7.14"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "vitest": "^3.0.0",
    "@types/node": "^22.0.0"
  }
}
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 4: Create .gitignore**

```
node_modules/
dist/
*.tgz
```

- [ ] **Step 5: Create minimal CLI entry point**

Create `src/cli.ts`:

```typescript
#!/usr/bin/env node
import cac from 'cac';

const cli = cac('flow');

cli.version('0.1.0');
cli.help();

cli.parse();
```

- [ ] **Step 6: Install dependencies and verify build**

```bash
npm install
npm run build
```

Expected: `dist/cli.js` is generated with no errors.

- [ ] **Step 7: Commit**

```bash
git add package.json tsconfig.json .gitignore src/cli.ts package-lock.json
git commit -m "chore: scaffold flow-engine project with cac CLI"
```

---

### Task 2: OpenSpec Utility Helpers

**Files:**
- Create: `src/utils/openspec.ts`
- Create: `tests/utils/openspec.test.ts`

- [ ] **Step 1: Write failing tests for openspec helpers**

Create `tests/utils/openspec.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { isOpenSpecInstalled, runOpenSpec, OPENSPEC_COMMANDS } from '../../src/utils/openspec.js';

describe('OPENSPEC_COMMANDS', () => {
  it('includes expected commands', () => {
    expect(OPENSPEC_COMMANDS).toContain('list');
    expect(OPENSPEC_COMMANDS).toContain('show');
    expect(OPENSPEC_COMMANDS).toContain('validate');
    expect(OPENSPEC_COMMANDS).toContain('archive');
    expect(OPENSPEC_COMMANDS).toContain('schema');
    expect(OPENSPEC_COMMANDS).toContain('status');
    expect(OPENSPEC_COMMANDS).toContain('instructions');
  });

  it('does not include workflow slash commands', () => {
    expect(OPENSPEC_COMMANDS).not.toContain('propose');
    expect(OPENSPEC_COMMANDS).not.toContain('apply');
    expect(OPENSPEC_COMMANDS).not.toContain('ff');
    expect(OPENSPEC_COMMANDS).not.toContain('continue');
  });
});

describe('isOpenSpecInstalled', () => {
  it('returns a boolean', () => {
    const result = isOpenSpecInstalled();
    expect(typeof result).toBe('boolean');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/utils/openspec.test.ts
```

Expected: FAIL — cannot resolve `../src/utils/openspec.js`

- [ ] **Step 3: Implement openspec helpers**

Create `src/utils/openspec.ts`:

```typescript
import { execSync, execFileSync } from 'node:child_process';

export const OPENSPEC_COMMANDS = [
  'list', 'show', 'validate', 'archive',
  'schema', 'view', 'templates', 'status',
  'config', 'update', 'instructions', 'new',
] as const;

export function isOpenSpecInstalled(): boolean {
  try {
    execFileSync('openspec', ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export function runOpenSpec(args: string[], cwd?: string): void {
  execFileSync('openspec', args, { stdio: 'inherit', cwd });
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/utils/openspec.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/openspec.ts tests/utils/openspec.test.ts
git commit -m "feat: add openspec CLI detection and invocation helpers"
```

---

### Task 3: Proxy Command

**Files:**
- Create: `src/commands/proxy.ts`
- Create: `tests/commands/proxy.test.ts`
- Modify: `src/cli.ts`

- [ ] **Step 1: Write failing test for proxy**

Create `tests/commands/proxy.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { isProxiedCommand } from '../../src/commands/proxy.js';

describe('isProxiedCommand', () => {
  it('returns true for known openspec commands', () => {
    expect(isProxiedCommand('list')).toBe(true);
    expect(isProxiedCommand('show')).toBe(true);
    expect(isProxiedCommand('validate')).toBe(true);
    expect(isProxiedCommand('archive')).toBe(true);
    expect(isProxiedCommand('status')).toBe(true);
  });

  it('returns false for flow-engine commands', () => {
    expect(isProxiedCommand('init')).toBe(false);
  });

  it('returns false for unknown commands', () => {
    expect(isProxiedCommand('foo')).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/commands/proxy.test.ts
```

Expected: FAIL

- [ ] **Step 3: Implement proxy command**

Create `src/commands/proxy.ts`:

```typescript
import { OPENSPEC_COMMANDS, isOpenSpecInstalled, runOpenSpec } from '../utils/openspec.js';

export function isProxiedCommand(command: string): boolean {
  return (OPENSPEC_COMMANDS as readonly string[]).includes(command);
}

export function proxyToOpenSpec(args: string[]): void {
  if (!isOpenSpecInstalled()) {
    console.error('Error: openspec CLI is not installed.');
    console.error('Install it with: npm install -g openspec');
    process.exit(1);
  }

  try {
    runOpenSpec(args);
  } catch (err: unknown) {
    const exitCode = (err as { status?: number })?.status ?? 1;
    process.exit(exitCode);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/commands/proxy.test.ts
```

Expected: PASS

- [ ] **Step 5: Wire proxy into CLI**

Update `src/cli.ts`:

```typescript
#!/usr/bin/env node
import cac from 'cac';
import { isProxiedCommand, proxyToOpenSpec } from './commands/proxy.js';

const cli = cac('flow');

cli.version('0.1.0');
cli.help();

// Check for proxied commands before cac parses
const args = process.argv.slice(2);
if (args.length > 0 && isProxiedCommand(args[0])) {
  proxyToOpenSpec(args);
  process.exit(0);
}

cli.parse();
```

- [ ] **Step 6: Build and manual smoke test**

```bash
npm run build
node dist/cli.js --help
```

Expected: Shows help output with version 0.1.0

- [ ] **Step 7: Commit**

```bash
git add src/commands/proxy.ts tests/commands/proxy.test.ts src/cli.ts
git commit -m "feat: add proxy mechanism for openspec CLI commands"
```

---

### Task 4: Bundled Schema File

**Files:**
- Create: `src/schema/schema.yaml`

- [ ] **Step 1: Create flow-engine schema.yaml**

Create `src/schema/schema.yaml`:

```yaml
name: flow-engine
version: 1
description: Fully automated spec-driven development workflow

artifacts:
  # === Human + AI Collaboration Phase ===
  - id: proposal
    generates: proposal.md
    description: Initial proposal document outlining the change
    template: proposal.md
    requires: []

  - id: specs
    generates: "specs/**/*.md"
    description: Detailed specifications for the change
    template: spec.md
    requires: [proposal]

  - id: design
    generates: design.md
    description: Technical design document with implementation details
    template: design.md
    requires: [proposal]

  - id: tasks
    generates: tasks.md
    description: Implementation checklist with trackable tasks
    template: tasks.md
    requires: [specs, design]

  # === Fully Automated Phase ===
  # generates points to the report file (for OpenSpec completion tracking).
  # Actual code/test file changes are produced by the AI agent as directed
  # by the template, outside of OpenSpec's artifact system.
  - id: implement
    generates: implement-report.md
    description: Autonomous code implementation guided by tasks and design
    template: implement.md
    instruction: |
      Implement all tasks autonomously. Follow Uncertainty Resolution Protocol.
    requires: [tasks]

  - id: test
    generates: test-report.md
    description: Spec-driven test generation, execution, and auto-fix
    template: test.md
    instruction: |
      Generate tests from spec scenarios. Run and auto-fix failures.
    requires: [implement]

  - id: verify
    generates: verify-report.md
    description: Three-layer verification — tests, spec alignment, code review
    template: verify.md
    instruction: |
      Three-layer verification: tests, spec alignment, code review.
    requires: [test]

  - id: review
    generates: review-report.md
    description: Final summary report with human action items
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

- [ ] **Step 2: Validate schema format with openspec**

```bash
cd /tmp && mkdir flow-engine-test && cd flow-engine-test
openspec init
mkdir -p openspec/schemas/flow-engine/templates
cp /Users/siyu/Works/github.com/siyuqian/flow-engine/src/schema/schema.yaml openspec/schemas/flow-engine/schema.yaml
# Create placeholder templates so validation passes
touch openspec/schemas/flow-engine/templates/{proposal,spec,design,tasks,implement,test,verify,review}.md
openspec schema validate flow-engine
```

Expected: Validation passes.

- [ ] **Step 3: Clean up test dir and commit**

```bash
rm -rf /tmp/flow-engine-test
cd /Users/siyu/Works/github.com/siyuqian/flow-engine
git add src/schema/schema.yaml
git commit -m "feat: add flow-engine custom schema definition"
```

---

### Task 5: Automation Skill Templates

**Files:**
- Create: `src/schema/templates/implement.md`
- Create: `src/schema/templates/test.md`
- Create: `src/schema/templates/verify.md`
- Create: `src/schema/templates/review.md`

- [ ] **Step 1: Create implement.md template**

Create `src/schema/templates/implement.md`:

```markdown
# Implement

Read tasks.md and implement each task autonomously. Your primary output is **working code**. The report file (implement-report.md) documents what you did.

## Process

1. Read the change's tasks.md, design.md, and specs/ to understand what needs to be built
2. For each unchecked task in tasks.md:
   a. Read any relevant existing code in the project
   b. Write the implementation
   c. Check the task off in tasks.md
   d. Note what you did in implement-report.md
3. After all tasks are complete, finalize implement-report.md

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
- Log the issue in implement-report.md with what was tried
- Continue to next task

## Report Format (implement-report.md)

<!-- List each task and what was done -->

## Completed Tasks
- Task X.Y: <brief description of what was implemented>

## Skipped / Degraded Tasks
- Task X.Y: <reason> | Attempts: <what was tried> | TODO marker: <location>

## Files Changed
- `path/to/file.ts` — <what changed>

## Notes
<!-- Any context the next stage (test) should know -->
```

- [ ] **Step 2: Create test.md template**

Create `src/schema/templates/test.md`:

```markdown
# Test

Generate tests from the spec scenarios (Given/When/Then), run them, and auto-fix failures. Your primary output is **passing test files**. The report file (test-report.md) documents results.

## Process

1. Read the change's specs/ directory for all scenarios
2. Read implement-report.md to understand what was implemented and what was skipped
3. For each spec scenario:
   a. Write a test case that validates the scenario
   b. Run the test
   c. If it fails, attempt to fix (implementation or test) — max 3 attempts per test
   d. Record result in test-report.md
4. Run the full test suite to check for regressions
5. Finalize test-report.md

## Test Design

- One test per spec scenario — the test name should reference the scenario
- Use the project's existing test framework and patterns
- If no test framework exists, choose one appropriate for the tech stack
- Do NOT test tasks marked as skipped/degraded in implement-report.md

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
- Mark the test as skipped with a reason
- Log the issue in test-report.md with what was tried
- Continue to next scenario

## Report Format (test-report.md)

<!-- Summary of test results -->

## Summary
- Total scenarios: X
- Tests written: X
- Tests passing: X
- Tests failing: X
- Tests skipped: X

## Test Results
| Scenario | Test File | Status | Attempts | Notes |
|----------|-----------|--------|----------|-------|
| Scenario name | path/to/test | PASS/FAIL/SKIP | N | ... |

## Failing Tests
- `test name`: <failure reason> | Attempts: <what was tried>

## Regression Check
- Existing test suite: PASS/FAIL (X passed, Y failed)
- New regressions introduced: <list or "none">
```

- [ ] **Step 3: Create verify.md template**

Create `src/schema/templates/verify.md`:

```markdown
# Verify

Execute three layers of verification. Your output is verify-report.md with pass/fail per layer.

## Layer 1: Test Execution

1. Run the full test suite (existing tests + newly generated tests)
2. Record: total tests, passed, failed, skipped
3. Verdict: PASS if all non-skipped tests pass, FAIL otherwise

## Layer 2: Spec Alignment

For each requirement in the change's specs/:
1. Read the requirement and its scenarios
2. Check the implementation — does the code satisfy this requirement?
3. Check test coverage — is there a test for each scenario?
4. Record: requirement name, implementation status, test coverage

Verdict: PASS if all requirements are implemented and tested, FAIL otherwise

## Layer 3: Code Review

Review all code changes made during the implement stage:
1. **Security**: No injection vulnerabilities, proper input validation, no secrets in code
2. **Performance**: No obvious N+1 queries, unnecessary allocations, or blocking operations
3. **Maintainability**: Clear naming, reasonable file sizes, no dead code, follows project conventions
4. **Correctness**: Edge cases handled, error paths covered, no logic errors

Verdict: PASS if no critical issues found, WARN if minor issues, FAIL if critical issues

## Report Format (verify-report.md)

## Overall Verdict
<!-- PASS / WARN / FAIL -->

## Layer 1: Test Execution
- Status: PASS/FAIL
- Total: X | Passed: X | Failed: X | Skipped: X
- Details: <any notable failures>

## Layer 2: Spec Alignment
- Status: PASS/FAIL

| Requirement | Implemented | Tested | Notes |
|-------------|-------------|--------|-------|
| Name | YES/NO/PARTIAL | YES/NO | ... |

- Gaps: <list unimplemented or untested requirements>

## Layer 3: Code Review
- Status: PASS/WARN/FAIL

### Issues Found
| Severity | File | Description |
|----------|------|-------------|
| CRITICAL/WARN/INFO | path | description |

### Summary
- Critical issues: X
- Warnings: X
- Info: X
```

- [ ] **Step 4: Create review.md template**

Create `src/schema/templates/review.md`:

```markdown
# Review

Read all previous reports and generate a final summary. This is the last stage — your output (review-report.md) is what the human reads when they return.

## Process

1. Read implement-report.md, test-report.md, and verify-report.md
2. Read the change's specs/ to compare intended vs actual
3. Compile the final summary

## Report Format (review-report.md)

## Change Summary
<!-- One paragraph: what was this change about, what was the outcome -->

## Completion Status
- Tasks completed: X/Y
- Spec requirements met: X/Y
- Tests passing: X/Y
- Verification: PASS/WARN/FAIL

## Items Requiring Human Attention

### Must Fix (blocking archive)
<!-- Issues that must be resolved before this change can be archived -->
- [ ] <description> — see <file:line>

### Should Fix (non-blocking)
<!-- Issues that should be addressed but don't block archive -->
- [ ] <description> — see <file:line>

### TODOs from Degraded Implementations
<!-- Tasks where the AI used the fallback strategy -->
- [ ] `// TODO(flow-engine): <description>` in `<file:line>` — <what was tried and why it failed>

## Detailed Results

### Implementation
<!-- Key points from implement-report.md -->

### Testing
<!-- Key points from test-report.md -->

### Verification
<!-- Key points from verify-report.md -->
```

- [ ] **Step 5: Commit**

```bash
git add src/schema/templates/
git commit -m "feat: add automation skill templates (implement, test, verify, review)"
```

---

### Task 6: Init Command

**Files:**
- Create: `src/commands/init.ts`
- Create: `tests/commands/init.test.ts`
- Modify: `src/cli.ts`

- [ ] **Step 1: Write failing tests for init**

Create `tests/commands/init.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { getSchemaDir, getTemplatesDir, BUNDLED_SCHEMA_PATH, BUNDLED_TEMPLATES_PATH } from '../../src/commands/init.js';

describe('init paths', () => {
  it('getSchemaDir returns correct path', () => {
    const result = getSchemaDir('/project');
    expect(result).toBe('/project/openspec/schemas/flow-engine');
  });

  it('getTemplatesDir returns correct path', () => {
    const result = getTemplatesDir('/project');
    expect(result).toBe('/project/openspec/schemas/flow-engine/templates');
  });

  it('BUNDLED_SCHEMA_PATH points to schema.yaml', () => {
    expect(BUNDLED_SCHEMA_PATH).toContain('schema.yaml');
  });

  it('BUNDLED_TEMPLATES_PATH points to templates dir', () => {
    expect(BUNDLED_TEMPLATES_PATH).toContain('templates');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run tests/commands/init.test.ts
```

Expected: FAIL

- [ ] **Step 3: Implement init command**

Create `src/commands/init.ts`:

```typescript
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isOpenSpecInstalled, runOpenSpec } from '../utils/openspec.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const BUNDLED_SCHEMA_PATH = path.resolve(__dirname, '../schema/schema.yaml');
export const BUNDLED_TEMPLATES_PATH = path.resolve(__dirname, '../schema/templates');

export function getSchemaDir(projectRoot: string): string {
  return path.join(projectRoot, 'openspec', 'schemas', 'flow-engine');
}

export function getTemplatesDir(projectRoot: string): string {
  return path.join(getSchemaDir(projectRoot), 'templates');
}

const AUTOMATION_TEMPLATES = ['implement.md', 'test.md', 'verify.md', 'review.md'];

export async function initCommand(projectRoot: string): Promise<void> {
  // 1. Check openspec is installed
  if (!isOpenSpecInstalled()) {
    console.error('Error: openspec CLI is not installed.');
    console.error('Install it with: npm install -g openspec');
    process.exit(1);
  }

  // 2. Initialize openspec if needed
  const openspecDir = path.join(projectRoot, 'openspec');
  if (!fs.existsSync(openspecDir)) {
    console.log('Initializing OpenSpec...');
    runOpenSpec(['init', projectRoot]);
    console.log('✓ openspec initialized');
  }

  // 3. Fork spec-driven schema (for standard templates)
  const schemaDir = getSchemaDir(projectRoot);
  if (!fs.existsSync(schemaDir)) {
    console.log('Forking spec-driven schema...');
    runOpenSpec(['schema', 'fork', 'spec-driven', 'flow-engine'], projectRoot);
    console.log('✓ spec-driven schema forked');
  }

  // 4. Overwrite schema.yaml with flow-engine schema
  const schemaYamlDest = path.join(schemaDir, 'schema.yaml');
  fs.copyFileSync(BUNDLED_SCHEMA_PATH, schemaYamlDest);
  console.log('✓ flow-engine schema.yaml installed');

  // 5. Copy automation templates
  const templatesDir = getTemplatesDir(projectRoot);
  for (const template of AUTOMATION_TEMPLATES) {
    const src = path.join(BUNDLED_TEMPLATES_PATH, template);
    const dest = path.join(templatesDir, template);
    fs.copyFileSync(src, dest);
  }
  console.log('✓ automation templates installed');

  // 6. Update config.yaml
  const configPath = path.join(openspecDir, 'config.yaml');
  if (fs.existsSync(configPath)) {
    let config = fs.readFileSync(configPath, 'utf-8');
    if (config.includes('schema:') && !config.includes('schema: flow-engine')) {
      const currentSchema = config.match(/schema:\s*(\S+)/)?.[1];
      console.warn(`Warning: config.yaml already uses schema "${currentSchema}".`);
      console.warn('Updating to flow-engine.');
    }
    config = config.replace(/schema:\s*\S+/, 'schema: flow-engine');
    if (!config.includes('schema:')) {
      config += '\nschema: flow-engine\n';
    }
    fs.writeFileSync(configPath, config);
  } else {
    fs.writeFileSync(configPath, 'schema: flow-engine\n');
  }
  console.log('✓ config.yaml updated (schema: flow-engine)');

  console.log('\nflow-engine initialized. Use \'/opsx:propose <name>\' in your IDE to start.');
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/commands/init.test.ts
```

Expected: PASS

- [ ] **Step 5: Wire init into CLI**

Update `src/cli.ts`:

```typescript
#!/usr/bin/env node
import cac from 'cac';
import { isProxiedCommand, proxyToOpenSpec } from './commands/proxy.js';
import { initCommand } from './commands/init.js';

const cli = cac('flow');

cli.command('init', 'Initialize flow-engine in the current project')
  .action(async () => {
    await initCommand(process.cwd());
  });

cli.version('0.1.0');
cli.help();

// Check for proxied commands before cac parses
const args = process.argv.slice(2);
if (args.length > 0 && isProxiedCommand(args[0])) {
  proxyToOpenSpec(args);
  process.exit(0);
}

cli.parse();
```

- [ ] **Step 6: Build and verify**

```bash
npm run build
node dist/cli.js --help
```

Expected: Shows `init` command in help output.

- [ ] **Step 7: Commit**

```bash
git add src/commands/init.ts tests/commands/init.test.ts src/cli.ts
git commit -m "feat: implement flow init command"
```

---

### Task 7: Copy schema/templates into dist at build time

**Files:**
- Modify: `package.json`

The `src/schema/` directory contains non-TypeScript files (`.yaml`, `.md`) that need to be copied to `dist/` alongside the compiled JS. This must happen before E2E tests since `init` reads from `dist/schema/`.

- [ ] **Step 1: Add a copy script to package.json**

Update `package.json` scripts:

```json
{
  "scripts": {
    "build": "tsc && npm run copy-schema",
    "copy-schema": "node -e \"const fs=require('fs');fs.cpSync('src/schema','dist/schema',{recursive:true})\"",
    "dev": "tsc --watch",
    "test": "vitest",
    "lint": "tsc --noEmit"
  }
}
```

Note: Uses `node -e` with `fs.cpSync` for cross-platform compatibility (no `cp -r`).

- [ ] **Step 2: Verify build includes schema files**

```bash
npm run build
ls dist/schema/
ls dist/schema/templates/
```

Expected: `schema.yaml` and all 4 template `.md` files present in `dist/schema/templates/`.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "build: copy schema and template files to dist on build"
```

---

### Task 8: Integration Test — End-to-End Init

**Files:**
- Create: `tests/e2e/init.test.ts`

- [ ] **Step 1: Write E2E test for flow init**

Create `tests/e2e/init.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import { isOpenSpecInstalled } from '../../src/utils/openspec.js';

// Skip if openspec not installed
const describeIfOpenSpec = isOpenSpecInstalled() ? describe : describe.skip;

describeIfOpenSpec('flow init (e2e)', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-engine-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('initializes a fresh project', () => {
    const cliPath = path.resolve(__dirname, '../../dist/cli.js');
    execSync(`node ${cliPath} init`, { cwd: tmpDir, stdio: 'pipe' });

    // Schema dir exists
    const schemaDir = path.join(tmpDir, 'openspec', 'schemas', 'flow-engine');
    expect(fs.existsSync(schemaDir)).toBe(true);

    // schema.yaml exists and contains flow-engine
    const schemaYaml = fs.readFileSync(path.join(schemaDir, 'schema.yaml'), 'utf-8');
    expect(schemaYaml).toContain('name: flow-engine');
    expect(schemaYaml).toContain('id: implement');
    expect(schemaYaml).toContain('id: test');
    expect(schemaYaml).toContain('id: verify');
    expect(schemaYaml).toContain('id: review');

    // Automation templates exist
    const templatesDir = path.join(schemaDir, 'templates');
    expect(fs.existsSync(path.join(templatesDir, 'implement.md'))).toBe(true);
    expect(fs.existsSync(path.join(templatesDir, 'test.md'))).toBe(true);
    expect(fs.existsSync(path.join(templatesDir, 'verify.md'))).toBe(true);
    expect(fs.existsSync(path.join(templatesDir, 'review.md'))).toBe(true);

    // Standard templates also exist (from fork)
    expect(fs.existsSync(path.join(templatesDir, 'proposal.md'))).toBe(true);
    expect(fs.existsSync(path.join(templatesDir, 'tasks.md'))).toBe(true);

    // Config uses flow-engine schema
    const config = fs.readFileSync(path.join(tmpDir, 'openspec', 'config.yaml'), 'utf-8');
    expect(config).toContain('schema: flow-engine');
  });

  it('is idempotent — running twice does not error', () => {
    const cliPath = path.resolve(__dirname, '../../dist/cli.js');
    execSync(`node ${cliPath} init`, { cwd: tmpDir, stdio: 'pipe' });
    execSync(`node ${cliPath} init`, { cwd: tmpDir, stdio: 'pipe' });

    const schemaYaml = fs.readFileSync(
      path.join(tmpDir, 'openspec', 'schemas', 'flow-engine', 'schema.yaml'),
      'utf-8'
    );
    expect(schemaYaml).toContain('name: flow-engine');
  });
});
```

- [ ] **Step 2: Build and run E2E test**

```bash
npm run build
npx vitest run tests/e2e/init.test.ts
```

Expected: PASS (or SKIP if openspec not installed)

- [ ] **Step 3: Fix any issues found during E2E**

Adjust `src/commands/init.ts` if any paths or behaviors are wrong.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/init.test.ts
git commit -m "test: add end-to-end test for flow init"
```

---

### Task 9: Final Validation

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 2: Build clean**

```bash
rm -rf dist && npm run build
```

Expected: Clean build with no errors.

- [ ] **Step 3: Run flow --help**

```bash
node dist/cli.js --help
```

Expected: Shows `init` command and version.

- [ ] **Step 4: Validate schema with openspec in a temp project**

```bash
cd /tmp && mkdir flow-final-test && cd flow-final-test
node /Users/siyu/Works/github.com/siyuqian/flow-engine/dist/cli.js init
openspec schema validate flow-engine
```

Expected: Schema validation passes.

- [ ] **Step 5: Clean up and commit**

```bash
rm -rf /tmp/flow-final-test
cd /Users/siyu/Works/github.com/siyuqian/flow-engine
git add -A
git commit -m "chore: final validation — all tests passing, schema valid"
```

---

### Task 10: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create README.md**

```markdown
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

```bash
npx github:siyuqian/flow-engine archive add-user-auth
```

Delta specs merge into your main specs. The change (with all reports) moves to archive.

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
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with installation and usage instructions"
```
