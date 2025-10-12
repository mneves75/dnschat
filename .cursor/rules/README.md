# Cursor Rules for DNSChat

This directory contains Cursor rules that help with development by providing context about the codebase structure, conventions, and patterns.

## Available Rules

### 1. Project Structure (`project-structure.mdc`)

**Always Applied** - Provides comprehensive overview of the entire project

- Expo Router architecture with file-based routing
- Core architecture and state management
- Native DNS and Liquid Glass integration
- Key behaviors and conventions

### 2. TypeScript Conventions (`typescript-conventions.mdc`)

**Applies to**: `*.ts`, `*.tsx` files

- Compiler settings and type safety
- Import patterns and code style
- Best practices and anti-patterns

### 3. Expo Router Navigation (`expo-router-navigation.mdc`)

**Applies to**: `app/**/*.tsx`, `app/**/*.ts` files

- File-based routing patterns and structure
- Tab and modal navigation configuration
- Deep linking and dynamic routes
- Navigation hooks and best practices

### 4. Liquid Glass Design System (`liquid-glass-design-system.mdc`)

**Applies to**: `src/design-system/**/*.tsx`, `src/design-system/**/*.ts`, `src/components/glass/**/*.tsx`

- iOS 26+ native liquid glass effects
- Platform fallbacks and performance optimization
- Glass component patterns and usage
- Accessibility integration

### 5. Testing Patterns (`testing-patterns.mdc`)

**Applies to**: `__tests__/**/*.spec.ts`, `__tests__/**/*.test.ts`, `__tests__/**/*.spec.tsx`, `__tests__/**/*.test.tsx`

- Jest configuration and test organization
- Mock strategies and test utilities
- DNS service and glass system testing
- Performance and integration testing

### 6. Build and Deployment (`build-deployment.mdc`)

**Applies to**: `package.json`, `app.json`, `eas.json`, `scripts/**/*.js`, `ios/**/*.pbxproj`, `android/**/*.gradle`, `CHANGELOG.md`

- Version management and sync process
- EAS Build configuration and profiles
- Platform-specific build requirements
- Release management and deployment

### 7. Accessibility and Internationalization (`accessibility-i18n.mdc`)

**Applies to**: `src/i18n/**/*.ts`, `src/context/AccessibilityContext.tsx`, `src/components/**/*.tsx`

- Multi-language support (en-US, pt-BR)
- Accessibility patterns and screen reader support
- Motion reduction and high contrast support
- Font scaling and keyboard navigation

### 8. DNS Service Architecture (`dns-service-architecture.mdc`)

**Applies to**: DNS-related files and services

- DNS query flow and fallback chains
- Native integration details
- Message sanitization and configuration
- Background handling

### 9. State and Storage Management (`state-and-storage.mdc`)

**Applies to**: Context and service files

- Context architecture and APIs
- Service layer patterns
- Data types and key principles
- Storage conventions

### 10. React Component Patterns (`component-patterns.mdc`)

**Applies to**: React component files

- Component structure and state management
- Props and interfaces
- Styling and UI patterns
- Component categories and best practices

### 11. Security and Privacy (`security-and-privacy.mdc`)

**Always Applied** - Security guidelines for all development

- Data storage security
- Network security and input validation
- Native module security
- Privacy considerations and platform security

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
