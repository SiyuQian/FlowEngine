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
