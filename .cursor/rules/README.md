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
