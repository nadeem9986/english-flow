# Source ledger

Checked 16 November 2026. Repository pages can change. README features are author claims unless source inspection is explicitly stated. No upstream application was runtime-tested in this research pass.

| ID | Title / publisher | URL | Type and date | Claim used / confidence |
| --- | --- | --- | --- | --- |
| S1 | From Reading Aloud to Peer Interaction, Ri Ju Chol and Marilyn Lewis; Journal of AsiaTEFL, abstract hosted by earticle | https://www.earticle.net/Article/A338427 | Academic case-study abstract, September 2018 | Six-month reading/audio/peer-interaction design and reported benefits. Abstract fetched; limited strength for broad causal/product claims |
| S2 | Digital reading aloud protocols and its effects on EFL fluency; System | https://doi.org/10.1016/j.system.2025.103712 | Academic paper, search date 22 May 2025 | Discovery-only. DOI fetch failed. Abstract search lead suggests mixed results; no numeric efficacy claim relies on it |
| S3 | Echo OpenMind | https://echoopenmind.com/ | Product/operator page; fetched current page | Read-aloud then debate pattern; FAQ separates on-phone recognition and server scoring. High confidence about what vendor says, untested implementation/efficacy |
| S4 | TiefPrompt, Tiefseetauchner | https://github.com/Tiefseetauchner/tiefprompt | Primary repository, current source inspected | Flutter/Android/FOSS path and MIT root license; pubspec and amplitude activation inspected at d8d5ba71f8b62ae732870b01f200d206e7ce6a62. High for inspected source, not runtime |
| S5 | Voice-Activated Teleprompter, Julien Lecomte | https://github.com/jlecomte/voice-activated-teleprompter | Primary repository, current source inspected | React/TS, MIT root license, matcher, recognizer and placeholder test command inspected at cd222c8225b9ac34ab4ecd0b14864de623e66dac. High for source, not runtime |
| S6 | Smart Teleprompter, Voumellis | https://github.com/Voumellis/smart-teleprompter | Primary repository/README and root LICENSE | React/Vite voice following described; MIT root license read directly. Features untested |
| S7 | SpeechRecognition, MDN Web Docs | https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition | Technical reference, fetched current page | Limited availability, server recognition on some browsers, local-processing APIs. High for documented constraints; device support still needs testing |
| S8 | SpeechRecognizer, Android Developers | https://developer.android.com/reference/android/speech/SpeechRecognizer | Official API reference, fetched current page | Likely remote streaming, continuous-recognition warning, on-device availability checks. High for documented API behavior, implementation-specific details remain |
| S9 | sherpa-onnx, k2-fsa | https://github.com/k2-fsa/sherpa-onnx | Primary repository | ASR/TTS/VAD toolkit; Apache-2.0 code metadata. Specific models not selected or cleared |
| S10 | whisper.cpp, ggml-org | https://github.com/ggml-org/whisper.cpp | Primary repository | Local C/C++ inference and MIT code metadata. No phone benchmark or chosen model review |
| S11 | GOPT, YuanGongND | https://github.com/YuanGongND/gopt | Primary research repository, ICASSP 2022 implementation | BSD-3-Clause code metadata, Kaldi GOP pipeline, own-data tutorial bug warning. Not a production validation |
| S12 | Speaking Practice, clloret | https://github.com/clloret/speaking-practice | Primary Android/Kotlin repository | TTS, recognition, phrases/history and GPL-3.0 metadata. Features not tested |
| S13 | QPrompt, Cuperino | https://github.com/Cuperino/QPrompt-Teleprompter | Primary repository | Qt/C++/QML, platform claims, GPLv3 app and CC BY 4.0 translations stated in README. Not built |
| S14 | Speech Teleprompter, Andrey-Roshchupkin | https://github.com/Andrey-Roshchupkin/speech-teleprompter | Primary README | Vue/Web Speech/analytics claims; root LICENSE lookup 404. Reuse terms unresolved, not cleared |
| S15 | Local Teleprompter, ShayneP | https://github.com/ShayneP/local-teleprompter | Primary README | Laptop/NeMo/several-GB setup described; root LICENSE lookup 404. Reuse terms unresolved |
| S16 | Teleprompter, Nokse22 | https://github.com/Nokse22/teleprompter | Primary repository | Python/GTK4, GPLv3, Linux/Flathub context, not native Android |
| S17 | SpeakUp, favzqn | https://github.com/favzqn/speakup | Primary repository | Practice-flow discovery; reuse license not established, not cleared |

## Coverage and limits

Sources span academic evidence, operator/product descriptions, open-source primary repositories and official technical documentation. No independent hands-on review of these particular OSS apps was established, so they are candidates rather than certified reliable dependencies. The study evidence is limited and does not validate this new product. API/model performance, accessibility and accent fairness remain implementation-stage checks. Dependencies/fonts/assets, trademarks, store policies and legal compliance have not received a complete audit.

Two leading repositories were shallow-cloned only for source inspection. Their code was not copied into English Flow. Upstream copyright/license texts were read directly for TiefPrompt, jlecomte and Smart Teleprompter. Other license rows distinguish repository metadata/README evidence from a full legal review.
