# Open-source shortlist

Checked 16 November 2026. Rank is by fit to this project, not stars. These projects have **not been adopted, built or runtime-tested** for English Flow. Root licenses are not a complete dependency, asset or model audit.

| Rank / role | Project | Verified fit | Terms / main risk | Verdict |
| --- | --- | --- | --- | --- |
| 1: mobile reader | [TiefPrompt](https://github.com/Tiefseetauchner/tiefprompt) | Flutter/Dart, Android build path; scripts, adjustable speed/font, reading indicator, themes, countdown, wake lock | Root LICENSE is MIT, copyright 2026 Lena Tauchner. FOSS/freemium entrypoints; many dependencies/assets to audit | Best mobile foundation to evaluate, not an automatic wholesale import |
| 2: speech alignment | [voice-activated-teleprompter](https://github.com/jlecomte/voice-activated-teleprompter) | React/TypeScript; browser recognition with text matching, interim results and a bounded reference window | Root MIT license verified, Julien Lecomte. Browser support, recognition-service privacy, weak test command | Best focused reference for optional word-following logic |
| 3: web alternative | [Smart Teleprompter](https://github.com/Voumellis/smart-teleprompter) | React/Vite/Tailwind; README describes voice following, highlighting and configurable lookahead | Root MIT license verified. README feature claims not runtime-tested | Compare if web-first is chosen |
| 4: Android learning reference | [Speaking Practice](https://github.com/clloret/speaking-practice) | Kotlin; mobile voice recognition, TTS, custom phrases and attempt history | GitHub reports GPL-3.0. Distribution of covered derivatives carries copyleft/source obligations | Useful product reference; don't copy into a permissive/proprietary app without a deliberate license decision |
| 5: mature teleprompter reference | [QPrompt](https://github.com/Cuperino/QPrompt-Teleprompter) | Qt/C++/QML; README lists Android and desktop support | GPLv3 for app; translations CC BY 4.0. Heavier stack for this MVP | Reference for reader controls, not preferred base |
| Later: on-device ASR | [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx) | Speech recognition, synthesis and VAD toolkit | Code reported Apache-2.0; chosen model licenses and mobile performance need separate checks | Evaluate a small streaming model only after reader MVP |
| Later: local ASR | [whisper.cpp](https://github.com/ggml-org/whisper.cpp) | C/C++ Whisper inference, Android support documented in repository | MIT code; model and packaging checks still needed; latency, memory and battery need measurement | Strong offline-transcription candidate, not a pronunciation scorer |
| Research only | [GOPT](https://github.com/YuanGongND/gopt) | Research implementation for multi-aspect pronunciation assessment | BSD-3-Clause reported. Kaldi GOP feature pipeline; README warns of a bug in own-data inference tutorial; models/datasets need separate terms | Not an MVP drop-in and not validated for this audience |

## Actual source inspection of the two leading references

### TiefPrompt

Inspected revision `d8d5ba71f8b62ae732870b01f200d206e7ce6a62`, latest shallow-cloned revision when checked. Commit author timestamp: 29 October 2026.

- `pubspec.yaml`: Dart SDK constraint `^3.13.0`; Riverpod, Drift, settings storage, record and wake-lock dependencies. Toolchain compatibility must be checked on a clean build, not assumed.
- `lib/providers/voice_activation_provider.dart`: opens a PCM microphone stream and reads **audio amplitude** every 200 ms. This is sound-level activation, not recognized-word tracking. Noise can activate it; do not advertise it as understanding the text.
- FOSS and freemium entrypoints exist. Use the FOSS path for a feasibility build; inspect all dependencies/assets, purchase code and project identity before any reuse.
- Test files are present, including database migration tests. They were not executed in this research pass.

### jlecomte/voice-activated-teleprompter

Inspected revision `cd222c8225b9ac34ab4ecd0b14864de623e66dac`, latest shallow-cloned revision when checked. Commit author timestamp: 11 September 2026.

- `src/lib/speech-matcher.ts`: tokenizes recognition output and compares nearby reference substrings with Levenshtein distance. Useful for alignment, but there is no trustworthy learner-pronunciation score in this algorithm.
- `src/lib/speech-recognizer.ts`: uses `SpeechRecognition`/`webkitSpeechRecognition`, requests continuous/interim results and restarts recognition on end while listening. It feature-detects support. Production use needs explicit permission/error handling, lifecycle tests, bounded restart/backoff and user-visible recovery.
- `package.json`: `test` is `exit 0`, not an effective automated test suite. A green `npm test` here proves nothing about alignment or microphone behavior. Add real tests before reuse.

## Screened out / unresolved

- [Andrey-Roshchupkin/speech-teleprompter](https://github.com/Andrey-Roshchupkin/speech-teleprompter): README claims MIT and includes analytics, but a direct root `LICENSE` read returned 404. Could be another filename; not enough evidence to clear copying. Treat as a reference until exact terms are found.
- [ShayneP/local-teleprompter](https://github.com/ShayneP/local-teleprompter): laptop-focused NeMo stack, README warns of several-GB initial setup. Direct root `LICENSE` read returned 404. Not a practical mobile MVP base; exact reuse terms unresolved.
- [Nokse22/teleprompter](https://github.com/Nokse22/teleprompter): Python/GTK4 and GPLv3, useful Linux reader but not an Android code base merely because its layout is responsive.
- [favzqn/speakup](https://github.com/favzqn/speakup): promising practice flow, but no root license was established in the fetched metadata. Do not treat source visibility as reuse permission.

## Before adopting any code

Pin a revision; inventory code, dependencies, fonts, icons, audio and models; keep the original license/copyright notices; review required attribution and copyleft; replace branding/application IDs/analytics; inspect supply-chain and network behavior; build from a clean checkout; run actual tests; validate the exact APK on-device/emulator. A private repository does not remove distribution obligations later. No license for English Flow is chosen by this research.
