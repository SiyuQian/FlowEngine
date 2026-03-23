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
