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
