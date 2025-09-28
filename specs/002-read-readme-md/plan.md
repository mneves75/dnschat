
# Implementation Plan: DNSChat - DNS-Based AI Communication App

**Branch**: `002-read-readme-md` | **Date**: 2025-09-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-read-readme-md/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
DNS-based mobile chat application for iOS and Android that sends messages to AI services via DNS TXT queries. Features multi-method DNS fallback, local encrypted storage, cross-platform deployment, and comprehensive logging. Primary innovation is using DNS infrastructure for enhanced privacy and network resilience compared to traditional chat APIs.

## Technical Context
**Language/Version**: TypeScript 5.9, Swift 6 (iOS native modules), React Native 0.81.4
**Primary Dependencies**: Expo SDK 54, React Navigation 7, Zustand, AsyncStorage, dns-packet
**Storage**: AsyncStorage (React Native), encrypted local storage, 30-day log retention
**Testing**: Jest 29.7, TypeScript strict mode, native module testing
**Target Platform**: iOS 16+, Android API 21+, cross-platform mobile deployment
**Project Type**: mobile - React Native app with native DNS modules
**Performance Goals**: 3s app launch, 10s DNS query timeout, 60 msgs/min rate limit
**Constraints**: DNS protocol limitations, mobile memory constraints, offline queuing capability
**Scale/Scope**: Individual user app, indefinite conversation history, multi-server fallback

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **No Constitution Available**: Template constitution found - no specific project constraints to validate against. Proceeding with standard React Native mobile development practices and security-first approach per existing codebase patterns.

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->
```
# React Native Mobile App Structure
src/
├── components/           # Reusable UI components
├── screens/             # Screen components (Expo Router)
├── services/            # DNS, storage, logging services
├── context/             # React Context providers
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── constants/           # App constants

__tests__/
├── components/          # Component unit tests
├── services/            # Service unit tests
├── integration/         # Cross-service tests
└── mocks/               # Test mocks

ios/
├── DNSNative/           # Native DNS Swift module
└── DNSChat.xcodeproj/   # iOS project configuration

android/
└── app/src/main/java/   # Native DNS Java module

modules/
└── dns-native/          # Shared native module package
```

**Structure Decision**: Mobile app structure selected based on existing React Native/Expo codebase. Features native DNS modules for iOS (Swift) and Android (Java) with shared TypeScript services layer. Expo Router handles navigation, Zustand manages state, and AsyncStorage provides persistence.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- DNS Service Contract → contract test + implementation tasks [P]
- Storage Service Contract → contract test + implementation tasks [P]
- Chat Interface Contract → contract test + implementation tasks [P]
- Each data model entity → TypeScript interface + validation tasks [P]
- Each functional requirement → integration test task
- Each acceptance scenario from quickstart → validation test task
- Implementation tasks to make all tests pass

**Ordering Strategy**:
- TDD order: Contract tests → Integration tests → Implementation
- Dependency order: Data models → Storage services → DNS services → UI components
- Cross-platform order: TypeScript interfaces → iOS native → Android native → React Native
- Mark [P] for parallel execution (independent files/modules)

**Specific Task Categories**:
1. **Data Model Tasks** (5-7 tasks): TypeScript interfaces, validation, migrations
2. **Contract Test Tasks** (9 tasks): 3 contracts × 3 test files each
3. **Native Module Tasks** (6 tasks): iOS Swift implementation, Android Java implementation
4. **Service Implementation** (8-10 tasks): DNS service, storage service, rate limiting
5. **UI Component Tasks** (6-8 tasks): Chat interface, settings screens, logging views
6. **Integration Tasks** (4-6 tasks): End-to-end user scenarios
7. **Performance Tasks** (3-4 tasks): Memory management, query optimization
8. **Security Tasks** (3-4 tasks): Input sanitization, encryption, server whitelisting

**Estimated Output**: 35-40 numbered, ordered tasks in tasks.md

**Quality Gates**:
- All contract tests must fail initially (no implementation)
- All integration tests based on quickstart scenarios
- All tasks reference specific functional requirements
- Clear acceptance criteria for each task

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
