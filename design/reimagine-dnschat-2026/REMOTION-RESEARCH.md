# DNSChat Remotion implementation contract

Research date: 2026-08-04. Technical claims below use current official Remotion documentation. The visual direction is a project recommendation, not a claim that any aesthetic is universally "best" in 2026.

## Decision

Create one blank Remotion project in `video/` with two 1920x1080, 30 fps compositions:

| Composition ID | Duration | Purpose | Delivery |
| --- | ---: | --- | --- |
| `DNSChatLaunch` | 30 seconds / 900 frames | Product launch: problem, mechanism, proof, trust boundary, GitHub CTA | `public/video/dnschat-launch.mp4` |
| `DNSChatTutorial` | 75 seconds / 2250 frames | Silent-first walkthrough: start a chat, send a safe demo prompt, inspect fallback logs, change settings, review local history | `public/video/dnschat-tutorial.mp4` |

The landing page should use native responsive `<video controls preload="metadata" poster="...">` elements. This is cheaper and more robust than adding `@remotion/player` solely for playback. Remotion Player remains an option only if runtime-customized video content becomes a requirement; the official Player can embed a composition in React and exposes controls, volume, fullscreen, click-to-play, and keyboard playback behavior.

Keep both masters 16:9 for the landing page. An optional 1080x1350 social crop may reuse the launch composition only if all essential text and the phone mockup already fit a centered 1080x1080 safe region; do not build a separate layout system for it.

## Scaffold and dependency plan

Run from the repository root:

```bash
npx create-video@latest --yes --blank video
cd video
pnpm install
pnpm exec remotion skills add
pnpm exec remotion add @remotion/media --package-manager=pnpm
```

`create-video` detects an enclosing git repo and, with `--yes`, skips the interactive prompt and `git init` (verified in `packages/create-video/src/init.ts` on remotion-dev/main: `isInsideGitRepo && isYesFlagSelected()` → continue; `getGitStatus` only runs when `!isInsideGitRepo`). It does not create a nested repo/submodule — correct monorepo behavior; verify the `video/` dir has no `.git` after scaffolding. Only pre-fix CLI versions prompted interactively; the `--yes` flag is the safe path on current releases.

The `remotion add` CLI (not `pnpm add`) detects the scaffolded Remotion version and pins `@remotion/media` to the same exact version. All `remotion` and `@remotion/*` packages must stay on the same exact version; Remotion's package docs warn against version drift. Verify alignment after install with `pnpm exec remotion versions`.

No animation, icon, chart, caption, audio-library, or video-player dependency is required. Use React, CSS, Remotion's `Sequence`, `Series`, `spring`, `interpolate`, and `random`, plus `Audio` from `@remotion/media`. Store fonts, screenshots, generated backgrounds, captions, and audio under `video/public/` and load them with `staticFile()`.

## Shared structure

```text
video/
  public/
    audio/                 # project-synthesized WAV files
    fonts/                 # locally served, license recorded
    screens/               # re-imagined demo screens; no real user data
  src/
    Root.tsx               # only the two compositions
    launch/LaunchVideo.tsx
    tutorial/TutorialVideo.tsx
    shared/                # tokens, DeviceFrame, Scene, Cursor, captions, audio cues
    data/demo.ts            # all fictional prompts, names, threads, logs
```

`Root.tsx` owns dimensions, frame rate, durations, and IDs. Scene timing is expressed in frames in one timeline array per composition. Shared components must remain presentational; do not create a scene registry, plugin system, or generic animation framework.

## Visual and motion direction

Use the re-imagined DNSChat screens as the hero, not generic stock art. The visual system should feel technical but calm: deep ink background, high-contrast neutral type, one electric DNS signal accent, fine grid or packet-route lines, softly lit device glass, and sparse grain. Use a locally bundled variable sans for headlines/UI and a locally bundled mono face only for DNS labels, transports, and logs. Record font licenses beside the font files.

Typography hierarchy at 1920x1080:

- Hero: 96-120 px, 0.92-1.0 line height, at most 7 words.
- Scene headline: 64-80 px, at most 2 lines.
- Supporting copy: 32-40 px, at most 2 lines.
- UI labels: never below 24 px in the rendered master.
- Captions: 38-44 px on an opaque or strongly blurred high-contrast backing plate.

Motion should be frame-driven and seek-safe. Favor hard editorial cuts, masked pushes, cursor-led zooms, and brief spatial continuity between real UI states. Use one primary movement per beat. Typical timing: 8-12 frames for click feedback, 12-18 for small UI reveals, 18-26 for scene entrances, and 6-10 frames of stillness after important copy. Use `spring()` for physical UI arrivals and `interpolate()` for deterministic opacity/position changes. Avoid perpetual floating, particle overload, simulated camera shake, and a different transition for every scene.

The reference patterns inform the direction as follows:

- The official "Launch Video on X" prompt uses a timed multi-scene structure, progressive terminal/UI reveals, staggered entrances, app-window framing, and a final GitHub CTA. Reuse the discipline, not its 8-scene density or unrelated product content.
- The official VVTerm promotion prompt asks for a roughly 20-second Apple-presentation-style cut with restrained typography and product assets. Reuse that restraint for the tutorial's chapter cards and zoomed UI details.

## Launch composition: 30 seconds

All examples are fictional and must not resemble a personal profile.

| Time | Frames | Beat | Required content |
| --- | ---: | --- | --- |
| 0:00-0:03 | 0-89 | Hook | `AI chat, carried by DNS.` Packet line resolves into the DNSChat mark and phone. |
| 0:03-0:08 | 90-239 | Send | Demo prompt `Explain DNS in one sentence` is typed; character ticks align exactly with glyph reveals; send tap has one click cue. |
| 0:08-0:13 | 240-389 | Transport | Native -> UDP -> TCP is visualized as an ordered fallback path. Do not imply every request uses every fallback. |
| 0:13-0:18 | 390-539 | Response | TXT packets assemble into a concise assistant answer; show visible success status and a subtle completion cue. |
| 0:18-0:23 | 540-689 | Product proof | Fast triptych: encrypted local history, searchable threads, inspectable DNS logs. Claims must match the app specification. |
| 0:23-0:27 | 690-809 | Trust boundary | `No account. No API key. No tracking.` followed by `DNS traffic is observable. Never send secrets.` The warning must be readable, not a legal-footnote flash. |
| 0:27-0:30 | 810-899 | CTA | `DNSChat` + `Open source on GitHub` + repository URL. Hold the final frame for at least 45 frames. |

Do not use avatars, headshots, real handles, inboxes, device IDs, location, or realistic private conversations. Use neutral thread titles such as `DNS basics`, `Explain caching`, and `TXT record example`.

## Tutorial composition: 75 seconds

The tutorial must work muted. It uses persistent step labels, burned-in instructional captions, visible cursor/tap focus, and no voiceover dependency.

| Time | Frames | Chapter | Required action |
| --- | ---: | --- | --- |
| 0:00-0:05 | 0-149 | Intro | State the outcome: send a short prompt through DNS and inspect what happened. |
| 0:05-0:14 | 150-419 | Safety | Show onboarding/privacy copy; emphasize that DNS is observable and demo prompts contain no personal or secret data. |
| 0:14-0:25 | 420-749 | New chat | Open a new thread; type `Explain DNS caching briefly`; show the 120-character pre-sanitization limit only if the redesigned UI exposes it. |
| 0:25-0:37 | 750-1109 | Send and receive | Send, show pending state, then a fictional response. Explain that the prompt becomes a DNS-safe label and the answer arrives in TXT records. |
| 0:37-0:50 | 1110-1499 | Logs | Open logs; highlight attempts and the Native -> UDP -> TCP fallback order. Explicitly say fallbacks depend on network/runtime conditions. |
| 0:50-1:00 | 1500-1799 | Settings | Show allowlisted server selection and theme/language controls. Never show arbitrary resolver entry if the real product does not allow it. |
| 1:00-1:09 | 1800-2069 | History | Return to searchable encrypted local history; show a neutral demo thread and deletion/clear behavior only if represented accurately in the final UI. |
| 1:09-1:15 | 2070-2249 | Close | Recap `Short prompts. Visible transport. Local history.` End on GitHub CTA and the DNS observability warning. |

## Audio and captions

Create two or three short keyboard-tick WAV variants and one low UI-confirmation tone locally with a deterministic Node script using only built-in APIs. Commit the generated WAV files and a short `audio/README.md` stating they are project-authored synthetic sounds. This avoids personal recordings, external attribution, and uncertain stock-audio licenses.

Cycle tick variants deterministically from the character index; never call `Math.random()`. Keep typing cues quiet and high-passed, skip ticks for silent pauses, use a distinct lower tick for space/return, and cap concurrent effects so fast typing does not clip. Use `Audio` from `@remotion/media`, which Remotion recommends for new audio and exact timeline synchronization. A music bed is deliberately omitted; add one only after a track license and public redistribution rights are recorded in-repo.

Captions and instructional labels must be authored as local timed data, not fetched during render. Burn them into both videos and publish a matching text transcript beside each landing embed. Keep a caption to one or two short lines, inside the central safe region, with sufficient contrast and enough screen time to read. Do not communicate state by color or sound alone. Keyboard sounds reinforce visible typing; they never replace it.

On the landing page, do not autoplay videos with sound. Remotion's autoplay guidance notes that browsers block audio without user interaction and discourages `autoPlay` for compositions containing audio. Use native controls, a descriptive poster, a visible title, and a user-initiated play action.

## Deterministic render rules

- Inputs are local and immutable during a render: no live API calls, current timestamps, user profiles, or remote CDN assets.
- Use `random('stable-seed-' + index)` for any grain, route jitter, or decorative distribution. Remotion documents `random()` as deterministic for a stable seed and warns that `Math.random()` can vary across render threads.
- Every animation derives from `useCurrentFrame()` and composition FPS. No CSS animation, wall clock, `setTimeout`, or unseeded randomness.
- Load all files through `staticFile()`. Fonts must block rendering until loaded; use Remotion's render-delay mechanism only inside the font-loading component and cancel on failure.
- Keep demo content in one checked-in data module, shared by the videos and transcript source, so screenshots and captions cannot silently diverge.
- Render twice in CI or locally and compare duration, dimensions, stream codecs, and SHA-256 only after confirming the encoder settings are deterministic on the same machine/toolchain. Pixel-frame spot checks at chapter boundaries are the primary visual gate.

## Render and validation commands

Run inside `video/`:

```bash
pnpm exec remotion compositions
pnpm exec remotion render DNSChatLaunch out/dnschat-launch.mp4 --codec=h264 --audio-codec=aac --crf=18
pnpm exec remotion render DNSChatTutorial out/dnschat-tutorial.mp4 --codec=h264 --audio-codec=aac --crf=18
pnpm exec remotion still DNSChatLaunch out/dnschat-launch-poster.png --frame=825
pnpm exec remotion still DNSChatTutorial out/dnschat-tutorial-poster.png --frame=60
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate:format=duration -of json out/dnschat-launch.mp4
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate:format=duration -of json out/dnschat-tutorial.mp4
cp out/dnschat-launch.mp4 out/dnschat-launch-poster.png out/dnschat-tutorial.mp4 out/dnschat-tutorial-poster.png ../public/video/
```

The last step is the publication step: the landing page consumes `public/video/` at the repository root, so the four validated assets must be copied there after validation. If the landing page is a GitHub Pages site, the copy must land on the branch/site directory that Pages serves.

Required evidence before embedding:

1. Both compositions enumerate and render without warnings or missing assets.
2. Both MP4 files are H.264/AAC, 1920x1080, 30 fps, and match the contracted durations.
3. Frame captures at every chapter boundary show no clipping, unreadable type, private data, or false product claims.
4. Listen once at normal volume and once on laptop speakers; typing is audible but does not mask instructional content.
5. Landing playback is keyboard operable, exposes controls and transcripts, and is checked at mobile and desktop widths.
6. Final public outputs remain under GitHub's per-file limit; if a render exceeds it, increase CRF (higher value, e.g. from 18 toward 24) or lower the target bitrate, or host release assets elsewhere rather than using Git LFS for a GitHub Pages runtime dependency. Decreasing CRF below 18 raises quality and file size, which makes the violation worse.

## Sources

All accessed 2026-08-04:

- [Creating a new project](https://www.remotion.dev/docs/) - current `create-video` blank scaffold and Studio workflow.
- [Render your video](https://www.remotion.dev/docs/render) - composition-based CLI rendering.
- [Launch Video on X prompt](https://www.remotion.dev/prompts/launch-video-on-x) - scene timing, UI staging, product-window framing, and CTA reference.
- [Promotion video for VVTerm prompt](https://www.remotion.dev/prompts/promotion-video-for-vvterm) - concise presentation-style reference.
- [`Audio` from `@remotion/media`](https://www.remotion.dev/docs/media/audio) - recommended audio component, timeline timing, and volume control.
- [`staticFile()`](https://www.remotion.dev/docs/staticfile) - local public-asset loading.
- [`random()`](https://www.remotion.dev/docs/random) - seeded deterministic randomness and multi-thread rendering warning.
- [`delayRender()` / `useDelayRender()`](https://www.remotion.dev/docs/delay-render) - render blocking and failure handling for asynchronous assets.
- [Captions](https://www.remotion.dev/docs/captions) and [displaying captions](https://www.remotion.dev/docs/captions/displaying) - caption data, timing, and sequence rendering.
- [`@remotion/player`](https://www.remotion.dev/docs/player) and [`Player`](https://www.remotion.dev/docs/player/player) - React embedding and playback controls.
- [Combatting autoplay issues](https://www.remotion.dev/docs/player/autoplay) - user-interaction requirement for audio playback.
- [`@remotion/transitions`](https://www.remotion.dev/docs/transitions) - official transition/timing options; intentionally not added because the core package is enough for this two-video scope.
- [`@remotion/sfx`](https://www.remotion.dev/docs/sfx) - attribution-free packaged effects are available, including mouse clicks; intentionally not added because a project-synthesized keyboard sound better matches the requested action and has a simpler provenance trail.

## Remaining decisions before implementation

- Confirm the final public repository URL used in the CTA.
- Confirm whether the final landing page ships English only or paired English/pt-BR video variants. The app is bilingual, but duplicating four renders should happen only if localization is explicitly required.
- Validate that every redesigned screen used in the videos matches the implemented landing/app demo state; this contract must not turn speculative mockups into product claims.
