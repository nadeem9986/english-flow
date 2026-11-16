# English fluency through a teleprompter

Research brief, 16 November 2026.

## Answer

The idea is feasible, but a teleprompter should be one part of a speaking-practice loop, not a promise of fluent conversation. Build a comfortable bottom-to-top reader first, add local recording/playback, and follow each reading with a short retell without the script. The strongest mobile reuse candidate found is **TiefPrompt (Flutter, MIT)**. The strongest focused reference for word-following is **jlecomte/voice-activated-teleprompter (React/TypeScript, MIT)**. Start with timed/manual scrolling; treat speech following and validated pronunciation assessment as separate later features.

## Ranked paths

| Path | What it buys | Cost and uncertainty | Recommendation |
| --- | --- | --- | --- |
| Android-first reader, evaluate TiefPrompt | Existing mobile scrolling, script/settings persistence and reader controls | Flutter/toolchain and dependency audit; education flow still new work | Best proposed path if an Android app is confirmed |
| Web-first, study jlecomte or Smart Teleprompter | Faster browser prototype of voice-following; reusable TypeScript alignment ideas | Recognition/browser limitations, remote audio processing and mobile lifecycle issues | Good if link-based access matters more than predictable mobile/offline behavior |
| Original Kotlin/Compose reader | Tight Android audio/lifecycle integration and a small tailored app | More original reader UI work; selected references are not native Compose drop-ins | Worth comparing in a small spike, not ruled out |
| Full pronunciation engine from day one | Potential phoneme/prosody feedback | Data/model rights, calibration, fairness, inference cost and weak mobile fit | Do not make this the MVP dependency |

No path has been built or benchmarked in this pass. There is no evidence yet that a fork is cheaper than an original small reader.

## Criteria and assumptions

The user explicitly asked for scrolling read-aloud practice, deep research, useful open-source projects and a repository. No reel/app reference was provided. Mobile use is plausible; Android-first is proposed rather than confirmed. Evaluation prioritized smooth reading, learner control, recording, license clarity, privacy and a realistic route to a reliable first version. "English Flow" is a working repository name only.

## 1. What read-aloud practice can and cannot establish

A 2018 six-month EFL case study by Ri Ju Chol and Marilyn Lewis combined reading aloud, audio models and follow-up peer interaction. Its abstract reports benefits for accuracy, fluency and confidence, and describes oral reading as a **scaffold for interaction**. That supports a mixed practice loop, not a causal claim that upward motion alone improves conversation. The article's abstract was read on earticle [S1]; full-method/result limitations were not independently audited.

A 2025 paper on digital read-aloud protocols appeared in search with an abstract describing 88 adult EFL learners and mixed reading-rate results across proficiency groups. Its DOI page could not be fetched, so it is **discovery-only**, not a verified source for numeric efficacy claims in this report [S2]. Do not advertise "research-proven fluency" from it.

Product-design inference: scripted reading reduces the need to invent vocabulary and sentence structure while speaking. Retelling and answering new questions put that work back into the task. Therefore the app should distinguish:

- **Reading delivery:** audible practice, phrase grouping, pauses, repeated attempts and self-listening.
- **Unscripted speaking:** formulating an answer without seeing the exact words.
- **Pronunciation assessment:** an acoustic evaluation needing more than whether transcription matched the script.

These are related but not interchangeable. Do not label reading speed, a streak, recognized words or a single recording as a certified fluency level.

## 2. Proposed lesson and interaction

A short session could be: select a topic/comfortable difficulty → listen to a model → read aloud with upward scroll → replay one section → hide the script and retell → answer a follow-up. This is a design proposal, not a tested curriculum or a validated learning intervention.

Use short original passages about daily life, work, travel or topics the learner chooses. Offer slower speed, manual mode, large type, a stable focus band and easy pause/restart. Prefer words-per-minute guidance to an opaque speed slider only if wrapping and font changes are handled correctly. Never force users to chase text that is too fast. Avoid distracting per-word error flashes while they are speaking.

A useful progress view separates sessions practised, passages revisited and unscripted attempts. If adding words/minute or pause estimates later, state their definition, recognition dependency and uncertainty. Improvement on a rehearsed passage is not automatically improvement on a new conversation.

## 3. Existing product pattern, without guessing the Instagram app

[Echo OpenMind](https://echoopenmind.com/) describes reading aloud with word highlighting, then a voice debate [S3]. This is a useful category example, not an identified match to the reel and not independent evidence of efficacy. Its own FAQ distinguishes on-phone recognition from detailed server-side scoring after a recording is uploaded. That is a useful reminder to specify privacy per feature rather than call an entire app "offline" because one step works offline.

Do not copy its lessons, interface assets, branding or screenshots. Its marketing claims are operator descriptions, not independently tested results. The project should be its own product, not a clone of an unverified reference.

## 4. Scrolling is simpler than speech following

Timed scrolling is deterministic and can work without a microphone or service. A sound-level gate can pause when no voice is detected, but noise can trigger it. **Recognized-word following** is a third mode: it must infer the reader's location from uncertain transcripts and cope with skips, corrections and repeated phrases.

Source inspection found that TiefPrompt's current voice activation reads microphone amplitude, not recognized words. jlecomte's matcher uses tokenization and nearby Levenshtein comparisons, while its recognizer uses browser SpeechRecognition. Both are useful, but neither is an English teacher. See OSS_SHORTLIST for revisions and exact files inspected [S4, S5].

Keep timed/manual mode as the reliable baseline. For word-following, use limited lookahead, confidence gates and manual resync; do not let a low-confidence guess skip paragraphs. Add real regression tests before adopting alignment logic.

## 5. Recognition, local models and privacy

**Browser option:** MDN labels SpeechRecognition as limited availability. It notes that in some browsers, including Chrome, audio is sent to a service and recognition will not work offline. Newer local-processing properties/language-pack APIs exist, but their presence in documentation does not guarantee support on target devices [S7]. Feature-detect and test; don't silently fall back from local to cloud.

**Android option:** Android's SpeechRecognizer documentation says the implementation is likely to stream audio to remote servers and is not intended for continuous recognition because of battery/bandwidth use. On-device availability must be checked; creating an on-device recognizer can fail when unsupported [S8]. A wrapper does not make these constraints disappear.

**Self-contained local option:** sherpa-onnx and whisper.cpp are credible tools to evaluate later [S9, S10]. Choose a specific model, verify its own license and language coverage, and benchmark cold start, download/storage size, latency, memory, battery and accuracy on actual target phones. Neither root code license automatically clears every model, and neither toolkit's existence proves a good low-end-phone experience.

**Data policy for the first version:** local scripts and recordings; no account required; no audio analytics; visible recording state; explicit deletion; explicit export only. Any later service needs opt-in, purpose, destination, retention/deletion explanation and a usable non-cloud mode. Recordings can contain sensitive personal or work details.

## 6. Pronunciation scoring is a different project

Transcription matching is useful for finding the current line and approximate omitted words. It is not reliable phoneme scoring: recognizers can normalize a mispronounced word or fail on intelligible accents/noise. Do not punish accent differences as errors without a clear, learner-chosen pronunciation goal and validation.

GOPT is relevant research code for multi-aspect pronunciation assessment, but its documented pipeline uses Kaldi GOP features and trained assessment models. Its README warns of an unresolved bug in its own-data inference tutorial [S11]. That makes it a research direction, not an easy production feature. Evaluate datasets, model terms, demographic/accent fit and human-rating agreement before using any numeric score with learners. No assessment engine was adopted here.

## 7. License and implementation decision

MIT-licensed finalist code can be reused commercially subject to its notices, but full reuse still needs dependencies, assets and attribution checks. GPL references are not unusable, but distributing covered derivatives brings source/license obligations; that decision should be deliberate. Two other teleprompter repos had README license claims or headings but root LICENSE reads returned 404. They are not cleared for copying.

No third-party code or content was placed in this repo. No outbound app license has been chosen. Private visibility is access control, not a substitute for license review or recording privacy.

## What would change the recommendation?

- A supplied reel could change the reading UI/interaction target, but not the need for license/privacy checks.
- Web-first would move the React references up; Android-only and strict local audio could favor original Kotlin or a carefully chosen Flutter shell.
- A mandatory no-network/offline constraint would rule out an unqualified browser-recognition dependency.
- A validated need for sound-level feedback would add a separate research/model stage, not justify a fake score.
- A clean-build spike could show that adopting TiefPrompt costs more than a small original reader.

## Next decision

Confirm the platform and personal-tool/product goal before implementing. Keep the first usable milestone small: **read → record → replay → retell**, with no paid service or unvalidated pronunciation score.

Sources and verification limits are in [SOURCES.md](SOURCES.md). The implementation stages and readiness checks are in [BUILD_PLAN.md](BUILD_PLAN.md).
