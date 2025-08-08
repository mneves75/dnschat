# Bug Fix

Streamline bug fixing workflow from issue creation to pull request.

## Process:

### Before Starting:
1. **GitHub**: Create an issue with a short descriptive title
2. **Git**: Create and checkout a feature branch (`git checkout -b fix/<issue-description>`)

### Fix the Bug:
1. Reproduce the issue
2. Write failing test that demonstrates the bug
3. Implement the fix
4. Verify test passes
5. Run full test suite
6. Review code changes

### On Completion:
1. **Git**: Commit with descriptive message referencing the issue
   - Format: `fix: <description> (#<issue-number>)`
2. **Git**: Push the branch to remote repository
3. **GitHub**: Create PR and link the issue
   - Use "Fixes #<issue-number>" in PR description
   - Add relevant labels and reviewers

## Best Practices:
- Keep changes focused on the specific bug
- Include regression tests
- Update documentation if behavior changes
- Consider edge cases and related issues