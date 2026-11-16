# English Flow

English speaking practice built around a simple idea: **text moves from bottom to top while you read it aloud.**

**Status:** web prototype v0.3.0 in [`app/`](app/) (React/TypeScript PWA, unit-tested and runtime-verified in desktop Chrome), built on the research and project foundation from 16 November 2026. No APK, store release, adopted upstream code or chosen outbound license yet. "English Flow" is a working title, not a cleared brand name.

## The proposed practice loop

1. **Listen** to a short example with natural phrasing.
2. **Read aloud** using the upward-scrolling teleprompter. Pause, adjust the speed and repeat without pressure.
3. **Listen back** to your own recording and practise one difficult phrase.
4. **Hide the script and retell** the idea in your own words, then answer a follow-up question.

The teleprompter is the starting point. Reading a script smoothly and speaking spontaneously are different tasks, so the product should practise both. Faster scrolling is not a measure of better English.

## Start here

| Document | Purpose |
| --- | --- |
| [app/](app/) | The runnable web prototype: setup, test and verification notes |
| [SEEDFILE.md](SEEDFILE.md) | Original concept, scope, decisions and unanswered questions |
| [RESEARCH.md](RESEARCH.md) | Evidence, product direction and ranked technical options |
| [OSS_SHORTLIST.md](OSS_SHORTLIST.md) | Reuse candidates, licenses and source-level checks |
| [BUILD_PLAN.md](BUILD_PLAN.md) | Proposed MVP, architecture, milestones and acceptance tests |
| [SOURCES.md](SOURCES.md) | Source ledger and limits of verification |
| [IMPROVEMENTS.md](IMPROVEMENTS.md) | Risks and checks to review before any build is delivered |

## Recommendation

Start with an offline-capable reader plus local recording/playback. Evaluate **TiefPrompt (Flutter, MIT)** as the closest mobile scrolling foundation. For optional speech-following, study **jlecomte/voice-activated-teleprompter (React/TypeScript, MIT)**. Keep manual/timed scrolling available if recognition fails.

Android-first is a proposal, not a confirmed platform decision. Confirm platform and whether this is a personal tool or a product before implementation. No paid AI service is needed for the first reader prototype.

## Rights and privacy

No third-party code, models, datasets, lessons, fonts or artwork have been copied into this repository. The shortlist is research, not an adoption decision. No outbound open-source license has been selected. Any future reuse needs exact revision and dependency/license checks, preserved notices and separate model/content review. Do not upload recordings or scripts to a service without an explicit opt-in and clear disclosure.
