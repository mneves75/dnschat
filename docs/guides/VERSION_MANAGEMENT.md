# Version Management

## Updating App Version

To update the app version, modify the `version` field in `package.json`:

```json
{
  "version": "1.0.0"  // Update this value
}
```

The version is automatically displayed in:
- About tab (`src/navigation/screens/About.tsx`)
- App metadata

## Version Guidelines

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version: Breaking changes
- **MINOR** version: New features (backwards compatible)
- **PATCH** version: Bug fixes (backwards compatible)

## Examples

- `1.0.0` → `1.0.1` (bug fix)
- `1.0.0` → `1.1.0` (new feature)
- `1.0.0` → `2.0.0` (breaking change)

## Release Checklist

1. Update version in `package.json`
2. Test the About screen shows correct version
3. Update `CHANGELOG.md` if present
4. Create git tag: `git tag v1.0.1`
5. Build and release