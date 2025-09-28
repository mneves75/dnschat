# Tasks: DNSChat - DNS-Based AI Communication App

**Input**: Design documents from `/specs/002-read-readme-md/`
**Prerequisites**: plan.md (✓), research.md (✓), data-model.md (✓), contracts/ (✓), quickstart.md (✓)

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → ✓ Found: TypeScript 5.9, Swift 6, React Native 0.81.4
   → ✓ Extract: Expo SDK 54, React Navigation 7, Zustand, AsyncStorage
2. Load optional design documents:
   → ✓ data-model.md: 4 entities (ChatMessage, DNSQueryLog, UserSettings, ConversationHistory)
   → ✓ contracts/: 3 service contracts (DNS, Storage, ChatInterface)
   → ✓ research.md: Multi-method DNS fallback, TDD approach
   → ✓ quickstart.md: 5 test scenarios, performance validation
3. Generate tasks by category:
   → ✓ Setup: TypeScript types, native module integration
   → ✓ Tests: 3 contract tests + 5 integration scenarios
   → ✓ Core: 4 data models + 3 service implementations
   → ✓ Integration: native modules, encryption, rate limiting
   → ✓ Polish: performance, security validation, documentation
4. Apply task rules:
   → ✓ Different files marked [P] for parallel execution
   → ✓ Tests before implementation (TDD)
   → ✓ Dependencies tracked and ordered
5. Result: 38 numbered tasks ready for execution
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- All file paths are absolute and specific

## Path Conventions
- **React Native Mobile**: `src/`, `__tests__/`, `ios/`, `android/`, `modules/dns-native/`
- Based on existing project structure from plan.md

## Phase 3.1: Setup and Foundation

- [ ] **T001** Create TypeScript interfaces from data model in `src/types/chat.ts`
- [ ] **T002** [P] Create TypeScript interfaces for DNS types in `src/types/dns.ts`
- [ ] **T003** [P] Create TypeScript interfaces for settings in `src/types/settings.ts`
- [ ] **T004** [P] Configure Jest test environment for native modules in `jest.config.js`
- [ ] **T005** Create test mocks for native DNS modules in `__tests__/mocks/dns-native.ts`

## Phase 3.2: Contract Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Service Contract Tests
- [ ] **T006** [P] Contract test DNSServiceContract in `__tests__/contracts/dns-service.contract.test.ts`
- [ ] **T007** [P] Contract test StorageServiceContract in `__tests__/contracts/storage-service.contract.test.ts`
- [ ] **T008** [P] Contract test ChatInterfaceContract in `__tests__/contracts/chat-interface.contract.test.ts`

### Integration Test Scenarios (from quickstart.md)
- [ ] **T009** [P] Integration test "Send First Message" scenario in `__tests__/integration/first-message.test.ts`
- [ ] **T010** [P] Integration test "DNS Fallback Mechanism" in `__tests__/integration/dns-fallback.test.ts`
- [ ] **T011** [P] Integration test "Rate Limiting" in `__tests__/integration/rate-limiting.test.ts`
- [ ] **T012** [P] Integration test "Conversation History" in `__tests__/integration/conversation-history.test.ts`
- [ ] **T013** [P] Integration test "Network Resilience" in `__tests__/integration/network-resilience.test.ts`

### Data Validation Tests
- [ ] **T014** [P] Unit test ChatMessage validation in `__tests__/types/chat-message.test.ts`
- [ ] **T015** [P] Unit test DNSQueryLog validation in `__tests__/types/dns-query-log.test.ts`
- [ ] **T016** [P] Unit test UserSettings migration in `__tests__/types/user-settings.test.ts`

## Phase 3.3: Data Models and Core Types (ONLY after tests are failing)

### TypeScript Data Models
- [ ] **T017** [P] Implement ChatMessage model with validation in `src/models/ChatMessage.ts`
- [ ] **T018** [P] Implement DNSQueryLog model with validation in `src/models/DNSQueryLog.ts`
- [ ] **T019** [P] Implement UserSettings model with validation in `src/models/UserSettings.ts`
- [ ] **T020** [P] Implement ConversationHistory model with validation in `src/models/ConversationHistory.ts`

### Core Utility Functions
- [ ] **T021** [P] Create DNS input sanitization utilities in `src/utils/dns-sanitizer.ts`
- [ ] **T022** [P] Create message validation utilities in `src/utils/message-validator.ts`
- [ ] **T023** [P] Create encryption/decryption utilities in `src/utils/encryption.ts`

## Phase 3.4: Service Layer Implementation

### DNS Service Implementation
- [ ] **T024** Implement DNSService class implementing DNSServiceContract in `src/services/DNSService.ts`
- [ ] **T025** Create DNS method priority manager in `src/services/DNSMethodManager.ts`
- [ ] **T026** Implement rate limiting service in `src/services/RateLimitService.ts`

### Storage Service Implementation
- [ ] **T027** Implement StorageService class implementing StorageServiceContract in `src/services/StorageService.ts`
- [ ] **T028** Create conversation management service in `src/services/ConversationService.ts`
- [ ] **T029** Implement settings migration service in `src/services/SettingsMigrationService.ts`

### Native Module Integration
- [ ] **T030** Update iOS DNSResolver Swift module for new requirements in `ios/DNSNative/DNSResolver.swift`
- [ ] **T031** Update Android DNS module for new requirements in `modules/dns-native/android/DNSResolver.java`
- [ ] **T032** Create React Native bridge integration in `modules/dns-native/index.ts`

## Phase 3.5: UI Components and Chat Interface

### Chat Interface Implementation
- [ ] **T033** Implement ChatInterface class implementing ChatInterfaceContract in `src/components/ChatInterface.tsx`
- [ ] **T034** Create chat message rendering components in `src/components/ChatMessage.tsx`
- [ ] **T035** Implement DNS logs viewer component in `src/components/DNSLogsViewer.tsx`

## Phase 3.6: Integration and Polish

### System Integration
- [ ] **T036** Integrate all services in main app context in `src/context/ChatContext.tsx`
- [ ] **T037** Add performance monitoring and optimization in `src/utils/performance-monitor.ts`

### Final Validation
- [ ] **T038** Run complete quickstart validation scenarios and performance tests

## Dependencies

### Critical Dependencies
- **T001-T005** (Setup) must complete before all other tasks
- **T006-T016** (Tests) must complete and FAIL before T017-T038
- **T017-T020** (Models) must complete before T024-T029 (Services)
- **T024-T032** (Services/Native) must complete before T033-T035 (UI)
- **T033-T035** (UI) must complete before T036-T038 (Integration)

### Parallel Execution Blocks
1. **Setup Block**: T001-T005 can run in parallel
2. **Test Block**: T006-T016 can run in parallel (different files)
3. **Model Block**: T017-T020 can run in parallel (different files)
4. **Utility Block**: T021-T023 can run in parallel (different files)
5. **Service Block**: T027-T029 can run in parallel (independent services)
6. **UI Block**: T034-T035 can run in parallel (different components)

## Parallel Execution Examples

### Launch Test Block (T006-T016) Together:
```
Task: "Contract test DNSServiceContract in __tests__/contracts/dns-service.contract.test.ts"
Task: "Contract test StorageServiceContract in __tests__/contracts/storage-service.contract.test.ts"
Task: "Contract test ChatInterfaceContract in __tests__/contracts/chat-interface.contract.test.ts"
Task: "Integration test Send First Message in __tests__/integration/first-message.test.ts"
Task: "Integration test DNS Fallback in __tests__/integration/dns-fallback.test.ts"
Task: "Integration test Rate Limiting in __tests__/integration/rate-limiting.test.ts"
```

### Launch Model Block (T017-T020) Together:
```
Task: "Implement ChatMessage model with validation in src/models/ChatMessage.ts"
Task: "Implement DNSQueryLog model with validation in src/models/DNSQueryLog.ts"
Task: "Implement UserSettings model with validation in src/models/UserSettings.ts"
Task: "Implement ConversationHistory model with validation in src/models/ConversationHistory.ts"
```

## Success Criteria

### Test Validation
- ✅ All contract tests initially fail (no implementation exists)
- ✅ All integration tests cover quickstart scenarios
- ✅ All data model validation tests pass after implementation

### Implementation Validation
- ✅ DNS service supports multi-method fallback
- ✅ Storage service implements encryption and retention policies
- ✅ Rate limiting enforces 60 messages/minute limit
- ✅ Native modules integrate correctly on both platforms

### Performance Validation
- ✅ App launches within 3 seconds
- ✅ DNS queries complete within 10 seconds
- ✅ UI remains responsive during DNS operations
- ✅ Memory usage stable during extended sessions

## Notes
- **[P] tasks** = different files, can run in parallel
- **Verify tests fail** before implementing
- **Commit after each task** for clean git history
- **Run `npm run typecheck`** after TypeScript changes
- **Test on both iOS and Android** simulators
- Follow existing code patterns from current DNSChat codebase

## Task Generation Rules Applied

✅ **From Contracts**: 3 contract files → 3 contract test tasks [P]
✅ **From Data Model**: 4 entities → 4 model creation tasks [P]
✅ **From User Stories**: 5 quickstart scenarios → 5 integration tests [P]
✅ **Ordering**: Setup → Tests → Models → Services → UI → Integration
✅ **Dependencies**: Properly tracked and prevent invalid parallel execution

## Validation Checklist

- [x] All contracts have corresponding tests (T006-T008)
- [x] All entities have model tasks (T017-T020)
- [x] All tests come before implementation (T006-T016 before T017+)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] TDD approach enforced (tests must fail before implementation)
- [x] All functional requirements covered by implementation tasks
- [x] Cross-platform native module integration included
- [x] Performance and security requirements addressed