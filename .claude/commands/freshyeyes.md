# /freshyeyes - Comprehensive Code Review

## Command
`/freshyeyes`

## Description
Performs an ultra-thorough code review with "fresh eyes" on all recently written or modified code, searching meticulously for bugs, errors, problems, issues, and confusion. Write tests too! This review is conducted as if John Carmack will be reviewing the code.

## Prompt
Great, now I want you to carefully read over all of the new code you just wrote and other existing code you just modified with "fresh eyes," looking super carefully for any obvious bugs, errors, problems, issues, confusion, etc. Write tests before it starts its implementation. John Carmack will review all! ultra think !

## Review Checklist
When this command is invoked, perform the following:

### 1. Critical Bug Analysis
- Memory leaks or resource management issues
- Race conditions and concurrency problems
- Security vulnerabilities (SQL injection, XSS, etc.)
- Null/undefined reference errors
- Type safety violations

### 2. Logic and Flow Issues
- Off-by-one errors
- Incorrect conditional logic
- Missing error handling
- Unhandled edge cases
- Infinite loops or recursion problems

### 3. Performance Problems
- N+1 query problems
- Inefficient algorithms (O(n²) where O(n) is possible)
- Unnecessary re-renders or computations
- Missing caching opportunities
- Database query optimization issues

### 4. Code Quality Issues
- Variable shadowing
- Dead code
- Magic numbers/strings that should be constants
- Inconsistent naming conventions
- Missing validation or sanitization

### 5. Integration Problems
- API contract violations
- Incorrect environment variable usage
- Missing or incorrect configuration
- Dependency version conflicts
- Cross-platform compatibility issues

### 6. Testing Gaps
- Untested critical paths
- Missing edge case tests
- Incorrect test assertions
- Test coverage gaps

### 7. Documentation Issues
- Misleading or outdated comments
- Missing critical documentation
- Unclear function/variable names
- Complex code without explanation

## Output Format
The review should produce:
1. A prioritized list of issues (CRITICAL, HIGH, MEDIUM, LOW)
2. Specific file paths and line numbers
3. Clear explanation of each issue
4. Suggested fixes with code examples
5. A summary of patterns that need attention

## Example Usage
```
/freshyeyes
```

This will trigger a comprehensive review of all recent code changes, applying Carmack-level scrutiny to find any issues that could affect correctness, performance, security, or maintainability.