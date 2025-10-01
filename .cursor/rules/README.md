# Cursor Rules for DNSChat

This directory contains Cursor rules that help with development by providing context about the codebase structure, conventions, and patterns.

## Available Rules

### 1. Project Structure (`project-structure.mdc`)

**Always Applied** - Provides comprehensive overview of the entire project

- Entry points and configuration
- Core architecture and navigation
- Native DNS integration
- Key behaviors and conventions

### 2. TypeScript Conventions (`typescript-conventions.mdc`)

**Applies to**: `*.ts`, `*.tsx` files

- Compiler settings and type safety
- Import patterns and code style
- Best practices and anti-patterns

### 3. DNS Service Architecture (`dns-service-architecture.mdc`)

**Applies to**: DNS-related files and services

- DNS query flow and fallback chains
- Native integration details
- Message sanitization and configuration
- Background handling

### 4. State and Storage Management (`state-and-storage.mdc`)

**Applies to**: Context and service files

- Context architecture and APIs
- Service layer patterns
- Data types and key principles
- Storage conventions

### 5. Navigation Patterns (`navigation-patterns.mdc`)

**Applies to**: Navigation and screen files

- Navigation architecture and screen structure
- Deep linking configuration
- Adding new screens and icons
- Navigation patterns and best practices

### 6. Expo Config and Commands (`expo-config-and-commands.mdc`)

**Applies to**: Configuration and build files

- Expo configuration details
- Build commands and scripts
- Native setup and development workflow
- Platform-specific considerations

### 7. React Component Patterns (`component-patterns.mdc`)

**Applies to**: React component files

- Component structure and state management
- Props and interfaces
- Styling and UI patterns
- Component categories and best practices

### 8. Security and Privacy (`security-and-privacy.mdc`)

**Always Applied** - Security guidelines for all development

- Data storage security
- Network security and input validation
- Native module security
- Privacy considerations and platform security

### 9. Native Module Development (`native-modules.mdc`)

**Fetchable Rule** - Guidelines for iOS and Android native module development

- DNS native module architecture
- iOS and Android implementation patterns
- Native module testing and debugging
- Platform-specific considerations

### 10. DNS Service Implementation (`dns-service.mdc`)

**Fetchable Rule** - Detailed DNS service architecture and implementation

- Query flow and pipeline
- Response parsing and rate limiting
- Native module integration
- Performance metrics and optimization

### 11. Security Best Practices (`security.mdc`)

**Fetchable Rule** - In-depth security implementation details

- Encryption and storage service
- DNS query sanitization
- Code and network security
- Platform-specific security measures

### 12. UI Styling & Design System (`ui-styling.mdc`)

**Fetchable Rule** - UI styling, theming, and component guidelines

- Theme system and color palette
- Component styling patterns
- Liquid Glass native effects
- Accessibility requirements

### 13. Build & Deployment (`build-deployment.mdc`)

**Fetchable Rule** - Build, deployment, and version management

- Development and build commands
- iOS and Android build processes
- EAS Build configuration
- Release process and CI/CD

### 14. TypeScript Patterns (`typescript-patterns.mdc`)

**Applies to**: `*.ts`, `*.tsx` files

- TypeScript strict mode patterns
- React component type patterns
- Service and context types
- Common utilities and error handling

### 15. Testing Guidelines (`testing.mdc`)

**Fetchable Rule** - Testing patterns and best practices

- Unit and integration testing
- Service and component testing
- Mocking patterns
- Coverage and debugging

## Usage

These rules are automatically applied by Cursor based on their configuration:

- **`alwaysApply: true`** - Applied to every request
- **`globs: pattern`** - Applied to files matching specific patterns
- **`description: string`** - Applied when the description matches the request

## Rule Development

When creating new rules:

1. Use `.mdc` extension
2. Include proper frontmatter with metadata
3. Reference files using `[filename](mdc:filename)` format
4. Keep rules focused and specific
5. Update this README when adding new rules

## Benefits

These rules help developers:

- Understand the codebase structure quickly
- Follow established patterns and conventions
- Avoid common pitfalls and anti-patterns
- Maintain consistency across the project
- Navigate complex native integrations
