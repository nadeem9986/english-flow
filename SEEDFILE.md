# SEEDFILE: English Flow

## Origin and intent

Nadeem, 16 November 2026: create a repository for an English-speaking practice idea seen in Instagram apps. Words should move **from the bottom to the top like a teleprompter**, and the learner reads them aloud. Research the topic deeply and find open-source projects that can be used.

No reel, named app or visual reference has been supplied. Do not claim any discovered app is the one he saw. The request covers research and a suitable repository foundation; it is not a request for a complete deployed product.

## Confirmed scope

- English speaking practice.
- Bottom-to-top scrolling text for reading aloud.
- Open-source research and reusable-project comparison.
- A private repository containing enough project context to resume later.

## Proposed, not confirmed

- Working title: English Flow. Rename freely before branding; no trademark/domain check done.
- Android-first mobile app, potentially Flutter, after a small feasibility spike.
- Short, level-appropriate passages, local recording/playback and a listen/read/retell loop.
- No account, cloud backend, paid model, streak pressure or numeric pronunciation score in the first prototype.
- Voice-following and speech feedback are later options, not prerequisites for scrolling.

## Decisions deliberately left open

1. Android app, installable web app or both?
2. Personal learning tool or product intended for other users?
3. Initial audience and English level? Do not assume Nadeem's level.
4. Fixed-speed scroll only, or should it eventually follow speech?
5. Which reference project, if any, should be adopted? Compare real build cost before choosing.
6. Outbound app license and final branding remain undecided.

These questions need not delay the research already completed. They matter before committing to a full implementation.

## Product guardrails

- Smooth bottom-to-top motion, a stable reading focus area, generous line spacing and visible pause controls.
- Adjustable font size and speed, countdown, restart, manual repositioning and reduced-motion/manual mode.
- Never reward speed at the expense of intelligibility or comfort.
- Do not call recognized-word matching a pronunciation assessment. ASR may guess a word despite poor articulation, or reject intelligible accented speech.
- No forced accent removal. Target intelligibility and learner-chosen models of speech.
- Stop/release the microphone on pause/exit/background and visibly show when it is active.
- Recordings remain local by default, with delete/export controls and no analytics containing audio or scripts.
- Verify the actual release artifact on Android before asking the user to test an APK. Automated tests alone do not establish runtime behavior.

## Current state

Documentation only. No implementation or upstream import. Read RESEARCH, OSS_SHORTLIST, BUILD_PLAN and IMPROVEMENTS before starting. Source observations were checked on 16 November 2026; dependencies and APIs can change.
