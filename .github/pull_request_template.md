## Summary

<!-- Brief description of changes -->

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Documentation
- [ ] CI/CD

## Checklist

- [ ] `bun run lint` passes
- [ ] `bun run test` passes
- [ ] `bun run verify:public-redaction` passes
- [ ] `gitleaks detect --source . --redact --no-banner --config .gitleaks.toml` passes when docs, release, config, or metadata changed
- [ ] `bun run verify:ios-pods` passes
- [ ] DNS smoke test: `bun run dns:harness -- --message "hello"` when DNS behavior changed
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Updated relevant documentation

## Platforms tested

- [ ] iOS Simulator
- [ ] iOS Device
- [ ] Android Emulator
- [ ] Android Device
- [ ] Web
