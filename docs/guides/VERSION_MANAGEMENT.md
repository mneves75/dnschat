# Version Management

## Updating App Version

To update the app version, modify the `version` field in **both** `package.json` and `app.json`:

**package.json:**
```json
{
  "version": "1.7.2"  // Update this value
}
```

**app.json (Expo configuration):**
```json
{
  "expo": {
    "version": "1.7.2"  // Keep synchronized with package.json
  }
}
```

The version is automatically displayed in:
- About tab (`src/navigation/screens/About.tsx`)
- App metadata and app stores
- Expo builds and deployments

**⚠️ Important:** Always keep package.json and app.json versions synchronized!

## Version Guidelines

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version: Breaking changes
- **MINOR** version: New features (backwards compatible)
- **PATCH** version: Bug fixes (backwards compatible)

## Examples

- `1.7.1` → `1.7.2` (bug fix/stability improvements - v1.7.2 DNS transport fixes)
- `1.6.0` → `1.7.0` (new feature - v1.7.0 interactive onboarding)
- `1.0.0` → `2.0.0` (breaking change - major architecture change)

## Recent Version History

- **v1.7.2** (2025-08-13): Enhanced DNS transport robustness and error handling
- **v1.7.1** (2025-08-13): Critical infinite render loop fixes
- **v1.7.0** (2025-08-13): Interactive onboarding and advanced DNS preferences
- **v1.6.1** (2025-08-11): UI fixes and enhanced features
- **v1.6.0** (2025-08-11): DNS query logging and HTTPS preferences

## Release Checklist

1. Update version in `package.json`
2. Test the About screen shows correct version
3. Update `CHANGELOG.md` if present
4. Create git tag: `git tag v1.0.1`
5. Build and release