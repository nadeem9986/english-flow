# English Flow - web prototype

Private English speaking practice: read aloud with a bottom-to-top teleprompter,
record yourself, listen back, then retell without the script.

Everything runs in the browser. Scripts live in localStorage, recordings in
IndexedDB. No server, no account, no analytics, no paid speech service.

## Status

Prototype v0.2.0. The Scripts tab includes built-in practice lessons (warm-up, sound contrasts, stress and rhythm, linking, everyday talk) that open straight into the reader; they stay in the app bundle and never touch stored scripts. Verified in desktop Chrome at a 390x844 mobile viewport:
reader scroll/scrub/countdown/retell, recording + playback + persistence across
reload, light/dark themes, service worker activation. Not yet verified on a
physical Android phone (mic permission flow, wake lock, MediaRecorder format).

## Develop

```sh
npm install
npm run dev
```

## Test and build

```sh
npm test     # vitest unit tests
npm run build
npm run preview   # serve the production build locally
```

`scripts/verify*.mjs` are the puppeteer smoke tests used before delivery; they
drive the preview build in headless Chrome (`--use-fake-device-for-media-stream`
supplies a test microphone).

Dependency versions are pinned exactly in package.json.
