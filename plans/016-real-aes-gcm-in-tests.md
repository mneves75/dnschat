# Plan 016: Test encryption against real AES-GCM instead of an identity cipher

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 749334c..HEAD -- __tests__/setup.jest.js src/services/encryptionService.ts src/services/storageService.ts __tests__/encryptionService.key.spec.ts __tests__/storageService.corruption.spec.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW-MED
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `749334c`, 2026-07-28

## Why this matters

"Local encrypted history" is one of this app's four product promises, alongside
no accounts, no API keys and no tracking. It is stated in `SECURITY.md` and
`docs/data-inventory.md`, and chat history plus DNS logs are encrypted at rest
with AES-GCM.

The global Jest setup replaces `@noble/ciphers/aes.js` with an identity
function for every one of the 130 suites. `encrypt` returns its plaintext
unchanged; `decrypt` returns its ciphertext unchanged; the key and nonce are
ignored entirely. So no test in the repo would fail if AES-GCM were removed,
keyed with a constant, or fed a reused nonce. The one confidentiality assertion
that exists passes only because the payload is hex-encoded, not because it is
encrypted.

It also makes an entire user-visible failure path untestable: `decrypt` can
never throw, so the "likely encryption key mismatch" branch — what a user hits
after a key rotation or a SecureStore reset — has no coverage at all.

`@noble/ciphers` is pure JavaScript and fast. There is no reason the tests
cannot run the real thing.

## Current state

Files involved:

- `__tests__/setup.jest.js:75-80` — the global cipher mock, applied to every
  suite via `setupFiles`.
- `src/services/encryptionService.ts:182-213` — the encrypt/decrypt surface.
- `src/services/storageService.ts:294` — the key-mismatch hint that no test
  reaches.
- `__tests__/storageService.corruption.spec.ts:150-159` — the confidentiality
  assertion that is currently vacuous.
- `__tests__/encryptionService.key.spec.ts` — existing key-handling coverage.

The mock (`__tests__/setup.jest.js:75-80`, complete):

```js
jest.mock('@noble/ciphers/aes.js', () => ({
  gcm: () => ({
    encrypt: (plaintext) => Uint8Array.from(plaintext),
    decrypt: (ciphertext) => Uint8Array.from(ciphertext),
  }),
}));
```

Note the neighbouring mock immediately above it
(`__tests__/setup.jest.js:64-73`) replaces `@noble/hashes/sha2.js` with Node's
real `crypto.createHash('sha256')`. That one is a legitimate speed/parity
substitution and is **not** in scope — it computes real SHA-256.

The production surface (`src/services/encryptionService.ts:185-209`):

```ts
export const encryptString = async (plaintext: string): Promise<string> => {
...
  const cipher = gcm(key, nonce).encrypt(utf8ToBytes(plaintext));
...
export const decryptString = async (payload: string): Promise<string> => {
...
  const plaintext = gcm(key, nonce).decrypt(cipher);
```

The vacuous assertion (`__tests__/storageService.corruption.spec.ts:153-156`):

```ts
      const migratedPayload = String(migrationCall?.[1]);
      expect(migratedPayload).toContain("enc:v1:");
      expect(migratedPayload).not.toContain("Legacy Chat");
```

With the identity cipher, `encryptString` produces
`enc:v1:<nonce>:<hex(plaintext)>`, so `not.toContain("Legacy Chat")` passes
because of hex encoding alone. Swap AES-GCM for a no-op in production and this
test still passes.

The untested branch (`src/services/storageService.ts:294`):

```ts
      hint = ' (likely encryption key mismatch)';
```

`grep -rn "key mismatch" __tests__/` returns nothing.

Repo conventions:

- Tests are Jest with `ts-jest` (`jest.config.js`), `testEnvironment: "node"`,
  run with `--runInBand`.
- `__tests__/setup.jest.js` is a `setupFiles` entry, so anything mocked there
  is global. Removing a global mock can surface failures in unrelated suites;
  expect to fix a handful of payload-shape assertions.
- The repo bans emoji in tracked files (`__tests__/repo.noEmoji.spec.ts`).
- The repo cannot use `finally` blocks — the React Compiler cannot lower them.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `pnpm install --frozen-lockfile` | exit 0 |
| Typecheck | `pnpm run typecheck` | exit 0, no output |
| Encryption suite | `pnpm run test --testPathPattern=encryptionService` | all pass |
| Storage suite | `pnpm run test --testPathPattern=storageService` | all pass |
| Full suite | `pnpm run test` | 129 suites passed, 1 skipped |
| Suite timing | `pnpm run test` | note the reported time before and after |

Two environment notes that will otherwise cost you an hour:

- **Never put a `--` separator before a script's flags.** pnpm forwards `--`
  literally, so `pnpm run test -- --bail` matches zero tests and exits 1.
- **Use the Node version in `.node-version` (24).** Example:
  `PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH" pnpm run test`.
- If `pnpm run test` fails in `__tests__/repo.noCredentials.spec.ts` with
  "project.pbxproj contains DEVELOPMENT_TEAM entries", the operator's tree has
  a local iOS signing team set. Pre-existing and unrelated. Report it; do not
  edit the pbxproj.

## Scope

**In scope** (the only files you should modify):

- `__tests__/setup.jest.js` — remove the `@noble/ciphers/aes.js` mock only
- `__tests__/encryptionService.key.spec.ts` — new cases
- `__tests__/storageService.corruption.spec.ts` — strengthen the
  confidentiality assertion
- Any other existing spec that breaks purely because ciphertext is now real
  (payload length or shape assertions). Fix the assertion; do not restore the
  mock locally.

**Out of scope** (do NOT touch, even though they look related):

- `src/services/encryptionService.ts` and `src/services/storageService.ts` —
  this plan changes **tests only**. If real AES-GCM exposes a production bug,
  that is a STOP condition, not something to patch here.
- The `@noble/hashes/sha2.js` mock at `__tests__/setup.jest.js:64-73` — it
  computes real SHA-256 via Node crypto and is a legitimate substitution.
- The `expo-secure-store` mock and key-derivation mocks, if any — key *storage*
  is a separate concern from cipher correctness.
- `jest.config.js` — no config change should be needed.

## Git workflow

- Branch: `advisor/016-real-aes-gcm-in-tests`
- Conventional Commits, matching this repo's history. Example from `git log`:
  `chore(scripts): add verify:react-doctor to gate suite`
  For this plan: `test(crypto): run the real AES-GCM cipher in tests`
- Do NOT push and do NOT open a PR.

## Steps

### Step 1: Record the baseline

```bash
pnpm run test 2>&1 | tail -6
```

**Verify**: note the suite count and wall-clock time. You will compare after
removing the mock; a large slowdown is a signal worth reporting.

### Step 2: Prove the current assertion is vacuous

Temporarily change the identity mock so `encrypt` returns its input and
`decrypt` does too (it already does) — instead, confirm the weakness directly:
add a throwaway assertion in `__tests__/storageService.corruption.spec.ts`
checking that the hex body of the migrated payload decodes back to the
plaintext. It will pass, demonstrating the payload is merely hex-encoded.

Remove the throwaway assertion before committing. Its only purpose is to
document the starting point in your report.

**Verify**: the throwaway assertion passes, then is removed.

### Step 3: Remove the cipher mock

Delete the `jest.mock('@noble/ciphers/aes.js', ...)` block from
`__tests__/setup.jest.js`. Leave the SHA-256 mock above it untouched.

**Verify**: `pnpm run test` and record every failure. Expect a small number,
concentrated in storage/encryption suites, caused by ciphertext now differing
in length and content from plaintext.

### Step 4: Fix the broken assertions the right way

For each failure, fix the *assertion*, not the cipher. Payload-shape checks
should assert on structure (`enc:v1:` prefix, nonce present, body is
hex) and on round-trip behavior (`decryptString(encryptString(x)) === x`), not
on exact lengths derived from the identity cipher.

**Verify**: `pnpm run test` passes again with the mock gone.

### Step 5: Strengthen the confidentiality assertion

In `__tests__/storageService.corruption.spec.ts`, replace the
`not.toContain("Legacy Chat")` check with one that would fail against a no-op
cipher: assert that the hex body of the migrated payload does **not** decode to
anything containing the plaintext marker, and that `decryptIfEncrypted` still
round-trips it correctly (that part already exists at line 157-159 — keep it).

**Verify**: `pnpm run test --testPathPattern=storageService.corruption` passes.
Then temporarily stub `gcm` back to the identity function in that one file,
re-run, and confirm the new assertion **fails**. Remove the stub.

### Step 6: Cover the failure paths that were previously unreachable

Add to `__tests__/encryptionService.key.spec.ts`:

- ciphertext bytes differ from plaintext bytes for a known input;
- `decryptString` rejects when a single byte of the ciphertext body is flipped
  (GCM authentication-tag failure);
- `decryptString` rejects when the payload was encrypted under a different key.

Then add a storage-level case asserting that a payload encrypted under a
different key surfaces the `likely encryption key mismatch` hint from
`src/services/storageService.ts:294`.

**Verify**: `pnpm run test --testPathPattern=encryptionService` and
`pnpm run test --testPathPattern=storageService`
→ all pass, including the four new cases.

### Step 7: Full gate

**Verify**: `pnpm run typecheck` exits 0; `pnpm run test` passes; compare the
wall-clock time against Step 1 and report the delta.

## Test plan

New cases:

- **Cipher is real**: ciphertext bytes differ from plaintext for a fixed input.
- **Tamper detection**: flipping one ciphertext byte makes `decryptString`
  reject.
- **Wrong key**: decrypting a payload produced under a different key rejects.
- **Key-mismatch hint**: `storageService` surfaces the "likely encryption key
  mismatch" hint for a payload it cannot decrypt.
- **Round-trip preserved**: existing encrypt/decrypt behavior still works
  end to end.

Structural pattern: `__tests__/encryptionService.key.spec.ts` for the cipher
cases, `__tests__/storageService.corruption.spec.ts` for the storage case.

The negative control in Step 5 (stub the identity cipher back, watch the new
assertion fail) is what proves the confidentiality test is no longer vacuous.
Do not skip it.

## Done criteria

ALL must hold:

- [ ] `grep -n "noble/ciphers" __tests__/setup.jest.js` returns nothing
- [ ] `grep -rn "noble/ciphers" __tests__/` shows no suite re-mocking the cipher
- [ ] The four new cases from the test plan exist and pass
- [ ] The confidentiality assertion in `storageService.corruption.spec.ts` fails when the cipher is stubbed to identity (negative control run and reported)
- [ ] No file under `src/` is modified
- [ ] `pnpm run typecheck` exits 0
- [ ] `pnpm run test` passes
- [ ] Suite wall-clock time reported, before and after
- [ ] `git status` shows no modified files outside the in-scope list
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Removing the mock exposes a **production** bug in
  `src/services/encryptionService.ts` or `src/services/storageService.ts` —
  for example a nonce reused across payloads, a key of the wrong length, or a
  decrypt path that swallows an authentication failure. Report it with
  `file:line`. That is a finding, and fixing it inside a test-only plan would
  bury a real security change in a test commit.
- The full suite slows by more than roughly 3x. Report the timing rather than
  reinstating the mock; a targeted mock in one hot suite is a different, deliberate
  decision.
- `@noble/ciphers` cannot run under the `node` test environment for a reason
  you cannot resolve (missing Web Crypto, ESM interop). Report the exact error.
- More than a handful of suites fail in Step 3, or failures appear in suites
  unrelated to storage/encryption.

## Maintenance notes

- The rule worth keeping: never globally mock a primitive whose correctness is
  the thing under test. Speed substitutions like the SHA-256 one are fine
  because they compute the same function; an identity cipher does not.
- A reviewer should ask for the Step 5 negative-control output. A
  confidentiality assertion that cannot fail is how this survived for so long.
- Deliberately deferred: property-based or cross-version payload tests (for
  example decrypting a payload produced by an older app version). Worth doing
  when the payload format next changes; `enc:v1:` is already versioned for it.
