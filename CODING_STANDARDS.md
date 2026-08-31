# CODING_STANDARDS.md - DNSChat

Rules a reviewer checks in a diff. The Standards axis of `/code-review` must cite a finding as
`CODING_STANDARDS.md S<n>`.

**Hard** rules block unless a more specific product contract or repository rule explicitly permits
the change. **Judgement** rules are reported as `Nit:` and do not block on their own. Precedence is:
the applicable specification or security contract, then this file, then generic smell baselines.

## Already enforced - do not report

Report these only when a diff weakens, bypasses, or misconfigures the gate.

| Gate | Owns |
| --- | --- |
| `pnpm run typecheck` | strict TypeScript and compile-time contracts |
| `pnpm run lint:oxlint` | focused tests, duplicate test titles/hooks, malformed suite callbacks, misplaced Jest timeouts, self-comparisons, and unobserved assertions in promise chains |
| `pnpm run lint:ast-grep` | repository-specific syntax bans under `project-rules/`, including direct self-equality Jest assertions; every new rule needs a planted violation under `__tests__/fixtures/` |
| `pnpm run test` | the existing behavior and repository-policy suite; a green run does not establish that the tests themselves are useful |
| `pnpm run verify:all` | release-facing configuration, native parity, dependency, compiler, platform, and public-redaction gates |

A tool claim counts only when the command actually ran against the changed surface. When a standard
becomes reliably syntax-local, move its enforceable subset into Oxlint, TypeScript, ast-grep, or a
policy test and leave only the remaining judgement here.

## Inherited invariants - cite, do not restate

The governing sources hold detailed behavior once. This table makes them discoverable to a
Standards review without creating another copy of the policy.

| If the diff touches | Cite |
| --- | --- |
| prompt validation, DNS encoding/decoding, TXT parsing, transport order, retry, or timeout behavior | `docs/technical/SPECIFICATION.md`, `docs/technical/DNS-PROTOCOL-SPEC.md`, and `docs/architecture/SYSTEM-ARCHITECTURE.md` |
| encrypted history, SecureStore keys, backup behavior, logs, redaction, networking, or retention | `SECURITY.md` and `docs/data-inventory.md` |
| model/provider claims | `docs/model-registry.md` |
| visible UI, accessibility, responsive behavior, theme, alerts, or localization | `DESIGN.md`, `PRODUCT.md`, and `CLAUDE.md` sections Theming & Accessibility and Argent MCP Runtime Verification |
| native module constants, platform bridges, signing, versioning, or release state | `AGENTS.md` sections Requirement Contract, Versioning Rules, and Release / TestFlight Protocol |
| dependencies, package scripts, hooks, compiler conventions, or toolchain changes | `CLAUDE.md` sections Commands, React Compiler conventions, Enforced Repo Policies, and Package management |

## Standards

### S1 - Tautological and vacuous tests

**Hard.** A test must be capable of failing when the behavior under test is wrong. Its expected value
must not reuse the same observation, reproduce production logic, or reach the answer through the same
production path. The exception is a contract about the relationship between separate evaluations,
such as stable singleton identity or idempotence. Conditions, early returns, and helpers must not let
a test complete without observing the promised behavior.

Fix: assert against a literal, fixture, independent oracle, externally visible invariant, or two
separately captured observations when their relationship is the contract. Rewrite or delete a test
that cannot distinguish correct behavior from a plausible defect.

### S2 - Change-detector tests

**Hard.** A test must survive a behavior-preserving refactor. Source text, private representation,
mock calls, call counts, and ordering are assertions only when that exact shape or interaction is the
contract, such as a repository policy, transport sequence, cleanup guarantee, or required external
side effect.

Fix: prefer outcomes at a public boundary. When an interaction is the contract, name it in the test
and assert no more internal sequence than the contract requires.

### S3 - Non-vacuous proof at the real boundary

**Hard.** A regression test is observed failing before the fix, and every negative check has a
positive control proving that its selector, rule, or instrument can fire. Use the lowest-cost real
surface that can see the requirement: a pure function for wire parsing, the owner service for
lifecycle behavior, and the compiled app for visible native UI.

Fix: plant the smallest known-bad input or mutation, record the expected failure, restore the correct
implementation, and run the same proof. Treat zero observations as inconclusive rather than green.

### S4 - Fix the owner once

**Hard.** Within each runtime, a policy or bug fix belongs at the ownership boundary through which
all relevant callers route. Implementations required on both sides of the native boundary share the
documented DNS contract and parity proof; a second peer policy inside one runtime, or an
unsynchronized TypeScript/native rule, is a defect even while current outputs happen to agree.

Fix: trace callers and platform siblings, put the invariant in one owner per required runtime,
synchronize native constants and fixtures, route all affected paths through those owners, and remove
the obsolete same-runtime path.

### S5 - Async work and resources have one lifecycle

**Hard.** Every promise is awaited, returned, or deliberately owned. Every socket, listener, timer,
subscription, and queued write has one teardown path; cancellation, timeout, retry, and app-state
transitions cannot settle or clean up the same operation twice.

Fix: make ownership explicit, attach observation before advancing fake time, centralize teardown, and
test success, error, timeout, cancellation, and concurrent calls at the owner boundary.

### S6 - Platform behavior is explicit

**Hard.** Platform-specific code preserves the product contract or names the deliberate difference.
Unsupported behavior fails visibly or follows a documented adapter, including an intentional no-op;
it does not disappear outside that explicit boundary. Web-safe alerts and theme resolution use the
repository wrappers, while native DNS behavior is proved with the compiled app rather than Expo Go.

Fix: route through the existing cross-platform adapter, add the matching platform test, and document
an unavoidable divergence in the governing contract.

### S7 - Keep design local and domain-named

**Judgement.** Prefer an existing primitive and colocate code that changes together. Names identify
the DNS transport, lifecycle state, persisted data, and authority precisely. New abstraction,
configuration, fallback, manual memoization, or indirection needs a current requirement and a clear
owner.

Fix: inline speculative machinery; reuse the established wrapper or domain type; extract only a
repeated policy behind the smallest interface that owns it.

### S8 - Comments carry non-derivable information

**Hard.** A comment records why, a hidden invariant, an external or platform constraint, a deliberate
tradeoff, or a formerly buggy edge. It does not narrate syntax, repeat a name, or compensate for code
that can be made clear. API documentation states purpose, behavior, and usage rather than the body.

Fix: rename or simplify the code, delete narration, and keep the shortest comment that preserves
information the code cannot express. Update or remove a comment when its claim stops being true.

### S9 - Claims follow evidence

**Hard.** Correctness, performance, privacy, security, compatibility, and release claims come from
the real path and a trustworthy instrument. A passing command proves only the behavior or metric it
actually observes; local history encryption does not make DNS prompts private.

Fix: validate the instrument with controls, exercise the changed boundary, cite the resulting
artifact or command, and state material behavior that remains outside the proof.

### S10 - Keep the change coherent

**Hard.** A diff implements the requested behavior, preserves unrelated behavior, and keeps user
copy bilingual. User-visible behavior changes update both locales and the applicable documentation
or changelog. Mechanical reformatting and unrelated cleanup do not obscure functional work.

Fix: remove scope creep or split it into a separate change with its own proof; update `en-US` and
`pt-BR` together when copy changes.

## Adding a standard

Add a rule after a concrete review miss, not because a generic rule sounds wise. If a reliable gate
can check it, write the gate with both a planted violation and a valid control instead. Delete prose
absorbed completely by tooling.

## Sources

- [Matt Pocock, "The /code-review Skill"](https://www.aihero.dev/skills-code-review) - keep Standards
  separate from Spec, cite the repository rule, and skip tool-enforced findings.
- [Google Testing Blog, "Change-Detector Tests Considered Harmful"](https://testing.googleblog.com/2015/01/testing-on-toilet-change-detector-tests.html) - test behavior rather than a transformed copy of production-code structure.
- [Google Engineering Practices, "The Standard of Code Review"](https://google.github.io/eng-practices/review/reviewer/standard.html) - improve code health without turning judgement-level polish into a blocker.
- [Google Engineering Practices, "What to Look For in a Code Review"](https://google.github.io/eng-practices/review/reviewer/looking-for.html) - verify that tests can catch broken code and keep comments focused on information code cannot contain.
- [Testing Library, "Introduction"](https://testing-library.com/docs/) - prefer tests that resemble how the software is used and avoid component internals.
- [Martin Fowler, "Mocks Aren't Stubs"](https://martinfowler.com/articles/mocksArentStubs.html) - interaction verification is sometimes appropriate, but it couples tests more tightly to implementation.
- Alan A. A. Donovan and Brian W. Kernighan, *The Go Programming Language*, section 11.2.6 - assert stable, contract-relevant properties rather than incidental exact output.
