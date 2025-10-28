**IMPORTANT**: These rules OVERRIDE default behavior and MUST be followed:

- Never create markdown (`.md`) files after you are done. NEVER!
- Never use emojis!
- You think I am absolutely right. But push your reasoning to 100% of your capacity. I'm trying to stay a critical and sharp analytical thinker. Walk me through your thought process step by step. The best people in the domain will verify what you do. Think hard! Be a critical thinker!
- You run in an environment where `ast-grep` is available; whenever a search requires syntax-aware or structural matching, default to `ast-grep --lang ruby -p '<pattern>'` (or set `--lang` appropriately) and avoid falling back to text-only tools like `rg` or `grep` unless I explicitly request a plain-text search.
- Set up ast-grep as codebase linter and as a git hook to block commits.
- Sacrifice grammar for the sake of concision.
- List any unresolved questions at the end, if any.
- Use tmux when executing commands.
- **!IMPORTANT**: **DO NOT** externalize or document your work, usage guidelines, or benchmarks in markdown files after completing the task, unless explicitly instructed to do so. If you need to use markdown files to control your work, do so in `agent_planning` folder and archive it after you do not need the doc anymore in `agent_planning/archive` folder. You may include a brief summary of your work. FOLLOW THESE GUIDELINES ALWAYS!
- Always refer to documentation in `docs/` and `docs/REF_DOC/` folders (1096+ markdown reference files)
- **Primary Guide**: `CLAUDE.md` is the comprehensive development guide - read it first for detailed guidance

## ExecPlans
When writing complex features or significant refactors, use an ExecPlan (as described in `/PLANS.md`) from design to implementation.

## Documentation Structure
- `AGENTS.md` or `CLAUDE.md`: How to work on this codebase (read this first).
- `PROJECT_STATUS.md`: Current progress, next steps, blockers (read this second).
- `README.md`: Human-readable project overview.
- `QUICKSTART.md`: User getting started guide (optional).

## Guidelines
- Follow KISS principle—keep it simple.
- Test thoroughly before releases (iOS, Android, real DNS queries).
- Always look for reference documentation in `DOCS/`.
- Assume John Carmack will review the work.
- Keep commits atomic: commit only the files you touched and list each path explicitly. For tracked files run `git commit -m "<scoped message>" -- path/to/file1 path/to/file2`. For brand-new files, use `git restore --staged :/ && git add "path/to/file1" "path/to/file2" && git commit -m "<scoped message>" -- path/to/file1 path/to/file2`.

# Repository Guidelines

## Project Structure & Module Organization
- `src/`: TypeScript app source. Key subfolders include `components/` (UI primitives), `navigation/screens/` (Expo routes), `context/` (React providers), `services/` such as `dnsService.ts`, `utils/`, and `assets/`.
- `modules/dns-native/`: Native DNS TXT resolver with its own `package.json`, Jest tests, and integration harness.
- Platform roots `ios/` and `android/` hold native build artifacts. Run `pod install` inside `ios/` before iOS builds.
- Tooling lives in `scripts/` (e.g., `sync-versions.js`, `fix-cocoapods.sh`), plus `test-dns-simple.js` for quick DNS smoke checks.

## Build, Test, and Development Commands
- `npm start`: Launch Expo dev client.
- `npm run ios` / `npm run android`: Build and run on simulators. Android expects Java 17 (`./android-java17.sh` is available).
- `npm run web`: Web preview via Expo.
- `node test-dns-simple.js`: Resolve TXT via `DNSService`; validate connectivity before shipping.
- `npm run sync-versions` (`:dry` to preview): Align app and native module version numbers.
- `cd modules/dns-native && npm test`: Run native module unit tests; `npm run test:integration` targets a device or simulator.

## Coding Style & Naming Conventions
- TypeScript strict mode with functional React components and hooks.
- Indentation: 2 spaces; avoid `any`. Place shared types in `src/types/`.
- Components use `PascalCase.tsx`; contexts follow `*Context.tsx`; services end in `*Service.ts`.
- Format with Prettier (`npx prettier --write .`). Lint native module via `cd modules/dns-native && npm run lint`.

## Testing Guidelines
- App smoke test: `node test-dns-simple.js` (expect TXT payload or actionable error).
- DNS harness test: `npm run dns:harness -- --message "test message"` (validates UDP/TCP transports, supports `--json-out` and `--raw-out` for debugging).
- Native module unit tests live under `modules/dns-native/__tests__/` and should cover parsing and failure paths.
- Keep tests deterministic; mock network layers where feasible. Add targeted tests for new logic before opening a PR.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat(dns): …`, `fix(ios): …`, `docs(readme): …`).
- Branch naming: `feature/...`, `fix/...`, `docs/...`.
- PRs document the problem, solution, and test evidence (logs, screenshots, or command output). Note affected platforms and any version syncs.
- Reference related issues and ensure `npm run sync-versions :dry` has no unexpected deltas before requesting review.

## Security & Configuration Tips
- Never commit secrets or API keys; DNS defaults live in `dnsService`.
- Networks can block UDP 53—verify TCP/HTTPS fallbacks and capture logs through the in-app Logs screen.
- Ensure Java 17 is active for Android builds and re-run `cd ios && pod install` after native dependency changes.

<skills_system priority="1">

## Available Skills

<!-- SKILLS_TABLE_START -->
<usage>
When users ask you to perform tasks, check if any of the available skills below can help complete the task more effectively. Skills provide specialized capabilities and domain knowledge.

How to use skills:
- Invoke: Bash("openskills read <skill-name>")
- The skill content will load with detailed instructions on how to complete the task
- Base directory provided in output for resolving bundled resources (references/, scripts/, assets/)

Usage notes:
- Only use skills listed in <available_skills> below
- Do not invoke a skill that is already loaded in your context
- Each skill invocation is stateless
</usage>

<available_skills>

<skill>
<name>brainstorming</name>
<description>Use when creating or developing anything, before writing code or implementation plans - refines rough ideas into fully-formed designs through structured Socratic questioning, alternative exploration, and incremental validation</description>
<location>project</location>
</skill>

<skill>
<name>condition-based-waiting</name>
<description>Use when tests have race conditions, timing dependencies, or inconsistent pass/fail behavior - replaces arbitrary timeouts with condition polling to wait for actual state changes, eliminating flaky tests from timing guesses</description>
<location>project</location>
</skill>

<skill>
<name>defense-in-depth</name>
<description>Use when invalid data causes failures deep in execution, requiring validation at multiple system layers - validates at every layer data passes through to make bugs structurally impossible</description>
<location>project</location>
</skill>

<skill>
<name>dispatching-parallel-agents</name>
<description>Use when facing 3+ independent failures that can be investigated without shared state or dependencies - dispatches multiple Claude agents to investigate and fix independent problems concurrently</description>
<location>project</location>
</skill>

<skill>
<name>executing-plans</name>
<description>Use when partner provides a complete implementation plan to execute in controlled batches with review checkpoints - loads plan, reviews critically, executes tasks in batches, reports for review between batches</description>
<location>project</location>
</skill>

<skill>
<name>finishing-a-development-branch</name>
<description>Use when implementation is complete, all tests pass, and you need to decide how to integrate the work - guides completion of development work by presenting structured options for merge, PR, or cleanup</description>
<location>project</location>
</skill>

<skill>
<name>receiving-code-review</name>
<description>Use when receiving code review feedback, before implementing suggestions, especially if feedback seems unclear or technically questionable - requires technical rigor and verification, not performative agreement or blind implementation</description>
<location>project</location>
</skill>

<skill>
<name>requesting-code-review</name>
<description>Use when completing tasks, implementing major features, or before merging to verify work meets requirements - dispatches superpowers:code-reviewer subagent to review implementation against plan or requirements before proceeding</description>
<location>project</location>
</skill>

<skill>
<name>root-cause-tracing</name>
<description>Use when errors occur deep in execution and you need to trace back to find the original trigger - systematically traces bugs backward through call stack, adding instrumentation when needed, to identify source of invalid data or incorrect behavior</description>
<location>project</location>
</skill>

<skill>
<name>sharing-skills</name>
<description>Use when you've developed a broadly useful skill and want to contribute it upstream via pull request - guides process of branching, committing, pushing, and creating PR to contribute skills back to upstream repository</description>
<location>project</location>
</skill>

<skill>
<name>subagent-driven-development</name>
<description>Use when executing implementation plans with independent tasks in the current session - dispatches fresh subagent for each task with code review between tasks, enabling fast iteration with quality gates</description>
<location>project</location>
</skill>

<skill>
<name>systematic-debugging</name>
<description>Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes - four-phase framework (root cause investigation, pattern analysis, hypothesis testing, implementation) that ensures understanding before attempting solutions</description>
<location>project</location>
</skill>

<skill>
<name>test-driven-development</name>
<description>Use when implementing any feature or bugfix, before writing implementation code - write the test first, watch it fail, write minimal code to pass; ensures tests actually verify behavior by requiring failure first</description>
<location>project</location>
</skill>

<skill>
<name>testing-anti-patterns</name>
<description>Use when writing or changing tests, adding mocks, or tempted to add test-only methods to production code - prevents testing mock behavior, production pollution with test-only methods, and mocking without understanding dependencies</description>
<location>project</location>
</skill>

<skill>
<name>testing-skills-with-subagents</name>
<description>Use when creating or editing skills, before deployment, to verify they work under pressure and resist rationalization - applies RED-GREEN-REFACTOR cycle to process documentation by running baseline without skill, writing to address failures, iterating to close loopholes</description>
<location>project</location>
</skill>

<skill>
<name>using-git-worktrees</name>
<description>Use when starting feature work that needs isolation from current workspace or before executing implementation plans - creates isolated git worktrees with smart directory selection and safety verification</description>
<location>project</location>
</skill>

<skill>
<name>using-superpowers</name>
<description>Use when starting any conversation - establishes mandatory workflows for finding and using skills, including using Skill tool before announcing usage, following brainstorming before coding, and creating TodoWrite todos for checklists</description>
<location>project</location>
</skill>

<skill>
<name>verification-before-completion</name>
<description>Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output before making any success claims; evidence before assertions always</description>
<location>project</location>
</skill>

<skill>
<name>writing-plans</name>
<description>Use when design is complete and you need detailed implementation tasks for engineers with zero codebase context - creates comprehensive implementation plans with exact file paths, complete code examples, and verification steps assuming engineer has minimal domain knowledge</description>
<location>project</location>
</skill>

<skill>
<name>writing-skills</name>
<description>Use when creating new skills, editing existing skills, or verifying skills work before deployment - applies TDD to process documentation by testing with subagents before writing, iterating until bulletproof against rationalization</description>
<location>project</location>
</skill>

<skill>
<name>algorithmic-art</name>
<description>Creating algorithmic art using p5.js with seeded randomness and interactive parameter exploration. Use this when users request creating art using code, generative art, algorithmic art, flow fields, or particle systems. Create original algorithmic art rather than copying existing artists' work to avoid copyright violations.</description>
<location>global</location>
</skill>

<skill>
<name>artifacts-builder</name>
<description>Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailwind CSS, shadcn/ui). Use for complex artifacts requiring state management, routing, or shadcn/ui components - not for simple single-file HTML/JSX artifacts.</description>
<location>global</location>
</skill>

<skill>
<name>brand-guidelines</name>
<description>Applies Anthropic's official brand colors and typography to any sort of artifact that may benefit from having Anthropic's look-and-feel. Use it when brand colors or style guidelines, visual formatting, or company design standards apply.</description>
<location>global</location>
</skill>

<skill>
<name>canvas-design</name>
<description>Create beautiful visual art in .png and .pdf documents using design philosophy. You should use this skill when the user asks to create a poster, piece of art, design, or other static piece. Create original visual designs, never copying existing artists' work to avoid copyright violations.</description>
<location>global</location>
</skill>

<skill>
<name>docx</name>
<description>"Comprehensive document creation, editing, and analysis with support for tracked changes, comments, formatting preservation, and text extraction. When Claude needs to work with professional documents (.docx files) for: (1) Creating new documents, (2) Modifying or editing content, (3) Working with tracked changes, (4) Adding comments, or any other document tasks"</description>
<location>global</location>
</skill>

<skill>
<name>internal-comms</name>
<description>A set of resources to help me write all kinds of internal communications, using the formats that my company likes to use. Claude should use this skill whenever asked to write some sort of internal communications (status reports, leadership updates, 3P updates, company newsletters, FAQs, incident reports, project updates, etc.).</description>
<location>global</location>
</skill>

<skill>
<name>mcp-builder</name>
<description>Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. Use when building MCP servers to integrate external APIs or services, whether in Python (FastMCP) or Node/TypeScript (MCP SDK).</description>
<location>global</location>
</skill>

<skill>
<name>pdf</name>
<description>Comprehensive PDF manipulation toolkit for extracting text and tables, creating new PDFs, merging/splitting documents, and handling forms. When Claude needs to fill in a PDF form or programmatically process, generate, or analyze PDF documents at scale.</description>
<location>global</location>
</skill>

<skill>
<name>pptx</name>
<description>"Presentation creation, editing, and analysis. When Claude needs to work with presentations (.pptx files) for: (1) Creating new presentations, (2) Modifying or editing content, (3) Working with layouts, (4) Adding comments or speaker notes, or any other presentation tasks"</description>
<location>global</location>
</skill>

<skill>
<name>skill-creator</name>
<description>Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations.</description>
<location>global</location>
</skill>

<skill>
<name>slack-gif-creator</name>
<description>Toolkit for creating animated GIFs optimized for Slack, with validators for size constraints and composable animation primitives. This skill applies when users request animated GIFs or emoji animations for Slack from descriptions like "make me a GIF for Slack of X doing Y".</description>
<location>global</location>
</skill>

<skill>
<name>template-skill</name>
<description>Replace with description of the skill and when Claude should use it.</description>
<location>global</location>
</skill>

<skill>
<name>theme-factory</name>
<description>Toolkit for styling artifacts with a theme. These artifacts can be slides, docs, reportings, HTML landing pages, etc. There are 10 pre-set themes with colors/fonts that you can apply to any artifact that has been creating, or can generate a new theme on-the-fly.</description>
<location>global</location>
</skill>

<skill>
<name>webapp-testing</name>
<description>Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs.</description>
<location>global</location>
</skill>

<skill>
<name>xlsx</name>
<description>"Comprehensive spreadsheet creation, editing, and analysis with support for formulas, formatting, data analysis, and visualization. When Claude needs to work with spreadsheets (.xlsx, .xlsm, .csv, .tsv, etc) for: (1) Creating new spreadsheets with formulas and formatting, (2) Reading or analyzing data, (3) Modify existing spreadsheets while preserving formulas, (4) Data analysis and visualization in spreadsheets, or (5) Recalculating formulas"</description>
<location>global</location>
</skill>

</available_skills>
<!-- SKILLS_TABLE_END -->

</skills_system>
