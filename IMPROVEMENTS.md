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
| Camera stays on after leaving the screen or app | Stream tracks not stopped on unmount/hidden | Stop all tracks on visibilitychange and unmount; verify track.readyState === 'ended' in the smoke test |
| Camera preview silently grabs the microphone | getUserMedia called with audio:true for a video-only preview | Request video only (audio:false) so the opt-in recorder keeps the mic; guard with a unit test |
| Camera keeps running when toggled off mid-permission-prompt | getUserMedia resolves after the user already cancelled | Track a request id; stop the stream immediately when it resolves stale |
| White reading text disappears over the camera image | Theme colors reused over a live video background | Force white text plus a dark scrim and text shadow in Camera mode; screenshot-check in both themes |
| Camera preview looks soft or blocky on phones | getUserMedia requested with only facingMode, so the browser hands back its default (often 640x480) which is then stretched full-screen | Request width/height/frameRate as `ideal` hints (1920x1080 at 30) so capable cameras deliver HD; never use exact/min so weak cameras still open; guard with a unit test that the hints stay present |

| Camera quality is tuned from guesses, not the real device | Simulated Chrome cannot show what a specific phone's browser delivers; hints were assumed to work | Camera-on readout shows the actually delivered track size, fps, facing, max offered and displayed size (describeCameraStream, unit-tested); read it from the real phone before claiming a model-specific result |
| Camera preview looks dull or soft on a phone whose delivered stream is already 1080x1920@30 | Resolution was not the limit on the Moto Edge 40 Neo (readout confirmed); the dark overlay lowered contrast and focus control was unknown | Lighter scrim and fades (white text kept readable with a stronger shadow, checked on bright/mid/colourful synthetic backgrounds in both themes); readout adds focus mode/distance/zoom only if the browser reports them; request continuous focus only if the track lists it. Overlay contrast is not optical sharpness; physical effect on the phone is unverified |

| GitHub web upload silently renames files instead of replacing | Multi-file upload queue prefixed every file (1-README.md, 6-Reader.tsx); a mis-targeted filename fill containing '/' created a nested garbage path and CI failed on the mangled tree | Never use the upload page for replacements; edit/create one file at a time in the web editor, pick the editor ref by its 'file contents' label (not the filename field), then byte-compare each committed file via API and diff the whole repo tree against the expected file set before delivery |

Review this file before each build; add actual mistakes with cause and a test that prevents recurrence.

| Camera recording stops or hides the camera preview, or leaves the mic open | Recorder and camera hook both own tracks; stopping "all tracks" in the recorder would kill the preview video track | Recorder opens and stops only the microphone; the camera hook owns its video track; camera toggle disabled while recording; verify on a fake camera+mic that the preview track stays live after Stop, the mic ends, and the camera track ends after Camera off |
| Video recording saved in a container the phone cannot replay | MediaRecorder support for webm/mp4 differs by browser | Pick the container with isTypeSupported (vp9/vp8 webm, then mp4), save the real blob.type, mark hasVideo, replay in a video element, check videoWidth/duration and no media error. Real-phone playback is unverified until the user tries it |
| Old audio-only recordings break when video is added | New metadata field assumed present | hasVideo is optional; absent means audio-only and keeps the audio player |
