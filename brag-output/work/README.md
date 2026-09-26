# brag video sources

Deterministic sources for `../brag.mp4`. Every frame is a pure function of time (`window.__seek(t)` in `index.html`).

1. Copy the system fonts next to the page (they are Apple-licensed and not committed):
   `cp /System/Library/Fonts/SFNS.ttf assets/sfpro.ttf && cp /System/Library/Fonts/SFNSMono.ttf assets/sfmono.ttf`
2. Audio: `node audio.mjs` writes `mix.wav`; normalize to -14 LUFS and limit true peak before muxing.
3. Stills: `PLAYWRIGHT_MODULE=<path to playwright/index.mjs> node render.mjs stills 1.0,4.4`
4. Video: `node render.mjs video video-silent.mp4 30 4 4` (30 fps, 4 motion-blur subframes, 4 workers), then mux with the audio.

The resolver answers shown were queried live from `llm.pieter.com` on 2026-09-26.
