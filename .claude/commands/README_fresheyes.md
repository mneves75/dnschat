# Claude Code Custom Commands

## Available Commands

### `/freshyeyes` - Ultra-Thorough Code Review
Performs a comprehensive code review with "fresh eyes" on all recently written or modified code, applying John Carmack-level scrutiny.

**Aliases:** `/fresh`, `/review`, `/carmack`

**Usage:**
```bash
# Review all recent changes (default)
/freshyeyes

# Review specific scope
/freshyeyes scope=worker/src

# Security-focused review
/freshyeyes focus=security

# Quick review
/freshyeyes depth=quick

# Combined parameters
/freshyeyes scope=worker/src/handlers focus=security depth=deep
```

**Parameters:**
- `scope`: Review scope ('recent', 'all', or specific paths) - default: 'recent'
- `focus`: Focus area ('security', 'performance', 'logic', 'all') - default: 'all'  
- `depth`: Review depth ('quick', 'normal', 'deep') - default: 'deep'

**What it reviews:**
1. **Critical Bugs** - Memory leaks, race conditions, security vulnerabilities
2. **Logic Issues** - Off-by-one errors, incorrect conditionals, edge cases
3. **Performance** - N+1 queries, algorithm efficiency, caching opportunities
4. **Code Quality** - Variable shadowing, dead code, naming conventions

**Output Format:**
The command produces a prioritized report with:
- 🔴 CRITICAL issues that block production
- 🟡 HIGH priority issues that should be fixed soon
- 🟢 MEDIUM priority improvements
- 🔵 LOW priority nice-to-haves
- 📊 Summary statistics
- ✅ Actionable fix recommendations

## How Fresh Eyes Works

The `/freshyeyes` command triggers Claude to:
1. Re-read all recently modified code with a fresh perspective
2. Apply systematic bug-hunting patterns
3. Check for common pitfalls and anti-patterns
4. Verify security best practices
5. Analyze performance implications
6. Review code maintainability

This is especially useful after:
- Implementing new features
- Refactoring existing code
- Fixing bugs (to ensure no new bugs were introduced)
- Before code reviews or deployments
- When something "feels off" but you can't pinpoint it

## Installation

These commands are automatically available in Claude Code when working in this repository. The command definitions are stored in:
- `.claude/commands/freshyeyes.md` - Human-readable documentation
- `.claude/commands/freshyeyes.json` - Machine-readable configuration

## Creating New Commands

To create a new slash command:
1. Create a `.md` file with documentation in `.claude/commands/`
2. Create a `.json` file with configuration in `.claude/commands/`
3. Test the command in Claude Code

## Best Practices

1. **Use before commits**: Run `/freshyeyes` before committing major changes
2. **Focus when needed**: Use `focus=security` before handling sensitive data
3. **Quick checks**: Use `depth=quick` for rapid iteration during development
4. **Deep dives**: Use `depth=deep` before production deployments

## Example Review Session

```bash
# After implementing a new feature
/freshyeyes scope=worker/src/handlers

# Output:
# 🔍 Fresh Eyes Code Review Report
# 
# 🔴 CRITICAL ISSUES
# 1. SQL Injection vulnerability in checkout.ts:45
#    - User input not sanitized before query
#    - Fix: Use parameterized queries
#
# 🟡 HIGH PRIORITY
# 1. Missing error handling in stripe-webhook.ts:102
#    - Webhook could fail silently
#    - Fix: Add try-catch with proper logging
#
# [... continues with full report ...]
```

## Tips

- Run `/freshyeyes` after long coding sessions when you might be tired
- Use it before asking for human code reviews to catch obvious issues
- Combine with git diff to focus on changed files
- Save reports for documentation of fixes made

Remember: Fresh Eyes is like having John Carmack review your code - it will find issues you might have overlooked!