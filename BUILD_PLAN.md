# Proposed build plan

This is a plan, not a commitment to a framework or an implementation already in progress.

## Milestone 0: decide and prove the base

Confirm Android vs web and personal tool vs product. Time-box a clean FOSS TiefPrompt build and a small original reader spike, comparing complexity and dependency burden. Choose reuse only if it materially reduces work. Keep GPL references separate unless the owner deliberately chooses a compatible distribution model. Do not combine Flutter and React apps just to reuse a small matcher; port only licensed logic that is needed, preserving notices.

## Milestone 1: reader without speech AI

- Import/paste plain text and save named scripts locally.
- Bottom-to-top smooth timed scroll, visible play/pause, countdown, restart and manual position control.
- Adjustable speed, font size, line spacing and reading window; light/dark/system themes and reduced-motion/manual mode.
- Keep screen awake only during reading. Pause safely on interruptions and backgrounding. Preserve draft/position on recreation.
- Use elapsed time rather than frame count for motion. Changing text size/screen orientation must preserve the logical reading position rather than jump to a wrong paragraph.
- Use original short practice passages initially. Maintain content provenance; do not scrape copyrighted articles or Instagram scripts into the app.

## Milestone 2: practise, listen back, retell

- Optional local microphone recording, permission explanation, visible recording state, playback, delete and explicit export.
- Stop and release microphone resources on pause/exit/background. Handle denied permission, interrupted calls, missing mic, disk-full and audio-route changes.
- A reference-audio/TTS option, clearly separate from recording to avoid speaker feedback. Check device voice availability; don't promise identical/offline voices everywhere.
- Hide the text after reading and offer a short retell or personal follow-up prompt. Keep scripted and unscripted attempts separate.
- Record session duration and learner notes. No fabricated 0-100 fluency/CEFR score.

## Milestone 3: optional speech following

Add a recognition-provider interface only after the reader works. Try on-device support first where available, benchmark on target phones, and retain timed/manual mode. Cloud recognition requires clear service/data disclosure and explicit opt-in. Speech-to-text matching is approximate: show "not confidently matched" rather than marking every mismatch as a pronunciation mistake.

Alignment tests: repeated words, contractions, numbers, punctuation, skipped sentences, self-correction, going off-script, silence/noise, different English accents, duplicate/interim/final results, and permission/service failure. Use confidence gating, limited lookahead and an obvious manual resync control so a guess cannot jump the whole script.

## Proposed architecture

- **Reader:** pure timeline/position logic separated from UI and gesture controls.
- **Script store:** local scripts, logical position and display preferences.
- **Session store:** attempt type, duration and optional recording reference. Deleting a recording must delete the underlying file.
- **Audio:** recording/playback service with explicit lifecycle ownership.
- **Recognition adapter (later):** events for partial/final transcript, error and availability; no direct dependency from reader on a vendor.
- **Alignment engine (later):** pure, independently testable token matching.
- **Content:** versioned original/licensed lessons and retell prompts.

No server, account, paid LLM, camera recording or analytics is needed for the first usable reader. This is an implementation recommendation, not a claim that all later speech feedback is free.

## Definition of ready to share a build

- Clean reproducible build, dependency/license inventory and no secrets in source/history.
- Real automated tests, not a placeholder success command.
- Exact artifact installs and launches on supported Android versions; microphone, scroll, playback and persistence exercised at runtime.
- Visual inspection at small/large font and narrow/wide screens, both themes, rotation and long passages. No clipping, overlap, low contrast or hidden pause button.
- Pause/resume speed is stable across refresh rates; no accidental reset or sudden jump after changing settings.
- Airplane-mode test distinguishes offline reader/recording from unavailable recognition/TTS. No hidden upload traffic.
- Permission denial and retry, incoming call/audio focus, background/foreground and process recreation tested.
- Save progress, install the signed update over the existing app and verify progress remains. Never require uninstalling as the normal update route.
- Review IMPROVEMENTS before every delivery. Do not call a prototype released or store-ready.

## Later validation

For learning value, compare repeated-reading performance with a fresh unscripted prompt over time. Ask users about comprehensibility and confidence. Automated speech measures need accent/noise fairness checks and human-rated calibration before they can support pronunciation claims.
