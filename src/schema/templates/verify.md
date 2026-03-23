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
