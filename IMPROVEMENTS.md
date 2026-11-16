# Improvements and pre-delivery checks

No English Flow build has been delivered yet. These are known traps identified during research, not invented claims of failures in this project.

| Risk / lesson | Cause | Preventive check |
| --- | --- | --- |
| A build passes tests but fails on the phone | Compile/test success does not prove runtime behavior | Install and exercise the exact artifact on Android before delivery |
| A reference project reports tests passing with no checks | jlecomte package has `test: exit 0` | Inspect test scripts and add real alignment/lifecycle tests |
| "Voice activated" is mistaken for word following | TiefPrompt inspected code measures amplitude | Label sound activation accurately; don't claim speech understanding |
| Local scripts are mistaken for private/offline recognition | Browser/native recognizers may use remote services | Explicit service disclosure, opt-in, offline fallback and traffic check |
| ASR matching becomes a fake pronunciation score | Transcription guesses words and varies with accent/noise | Keep matching separate; validate actual pronunciation methods before scoring |
| Third-party code is copied without complete terms | Root license mistaken for all assets/models/dependencies | Pin and inventory each adopted component; preserve required notices |
| User recordings leak into repo or telemetry | Debugging logs, backups or test fixtures contain personal data | Use synthetic/original fixtures; exclude recordings, secrets and local stores |
| Scrolling gets faster but speaking does not transfer | Training only rehearsed scripts | Include retelling and fresh speaking prompts, with separate progress records |

Review this file before each build; add actual mistakes with cause and a test that prevents recurrence.
