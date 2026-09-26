# DNS Chat brag plan

## Answers

- **What is it?** A mobile chat app that sends your prompt to an AI as a DNS TXT query and shows the TXT answer.
- **Who is it for?** People who want a quick AI answer with no account or API key, and anyone curious about odd network paths.
- **What sets it apart?** The transport. Every prompt is squeezed into one DNS label (`What is DNS?` becomes `what-is-dns`) and sent to `llm.pieter.com` on port 53. It tries native DNS first, then UDP, then TCP.
- **Most impressive or funniest claim:** the thing that turns `google.com` into an IP address will write you a haiku about itself. Real output, queried on 2026-09-26:
  `dig +short TXT write-a-haiku-about-port-53 @llm.pieter.com`
  -> "DNS whispers on port fifty-three / Quietly routing queries / Domain names set free."
- **Visual hook:** a clean terminal running a real `dig`, answered with a poem.
- **Real UI and flow:** the iOS chat screen (grouped canvas, blue user bubble, gray assistant bubble, "Ask me anything..." composer), rebuilt with the app's real `imessagePalette` tokens: type `What is DNS?`, send, get the real resolver answer for `what-is-dns.llm.pieter.com`.
- **Tone:** deadpan, close to the brand's "calm, precise, candid". Nothing is treated as a joke; the premise does the work.
- **Share caption:** "I asked DNS for a haiku. It answered on port 53."

## Angle

The internet's phone book answers back. Play it straight: show the real query, the real answer, the real app, and the honest limit (DNS is observable).

## Identity

- Canvas `#F2F2F7`, surface `#FFFFFF`, Signal Blue `#007AFF` (the only accent), labels `#000` / `#6D6D70`, bubbles `#007AFF` / `#E5E5EA` with black text (the app's AA choice).
- System sans (SF Pro) for everything; SF Mono only for protocol details (command, labels, query names).
- The app icon (`icons/dnschat-icon-light.png`) is the only teal.
- Flat surfaces, hairline separators, motion only when state changes. No neon terminal.

## Storyboard (1920x1080, 30 fps, 23.0 s, 96 BPM, beat = 0.625 s)

| # | Time | Scene | On screen | Sound |
|---|---|---|---|---|
| 1 Hook | 0.00-5.625 | Terminal | Caption "This is a DNS lookup." Command types in, Enter, the haiku prints line by line. Caption swaps to "It wrote a haiku." | Soft pad, key clicks, a low tone when Enter lands, three rising plucks, one per line |
| 2 Reveal | 5.625-8.75 | Title | Dip through the canvas. App icon lands, "DNS Chat", then "An AI chat that travels as DNS queries." | Kick and hat enter, chord change |
| 3 Demo | 8.75-14.375 | Phone | Phone slides in on the right. Composer types "What is DNS?", send, blue bubble, typing dots, the real answer. Left caption: "Ask it what DNS is." then "It answers. Over DNS." | Soft typing ticks, send pluck, answer chime |
| 4 Path | 14.375-18.75 | Signal path | Phone stays. Left side: "What actually left the phone:" `What is DNS?` -> `what-is-dns` -> `TXT what-is-dns.llm.pieter.com`, then the Native / UDP / TCP route with Native marked "answered". | Ticks per step, rising notes |
| 5 Punchline + outro | 18.75-23.0 | Claims + sign-off | "No account." "No API key." "No tracking." one by one, then the candid line "DNS is observable. The app tells you." Icon, "DNS Chat", `github.com/mneves75/dnschat`. | Three notes, final chord, tail |

Durations sum to 23.0 s (scene 4 gained one beat so the route labels hold long enough to read).

## Sources (no invented claims)

- Claims: README "no API keys, no accounts, no tracking"; site footer "DNS continua sendo observável"; onboarding "DNS Is Observable".
- Transport order: README and `src/services/dnsService.ts`.
- Label: the app's `sanitizeDNSMessageReference` run on the demo prompts; query name from `composeDNSQueryName`.
- Answers: live `dig` against `llm.pieter.com`, 2026-09-26.
- No distribution claim (no store link): the public release is not confirmed, so the outro points to the public repo.
