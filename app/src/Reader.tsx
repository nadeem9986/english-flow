import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Script, Settings } from './types';
import { readingDurationSeconds, wordCount } from './store';
import { useRecorder } from './useRecorder';
import { useCamera } from './useCamera';

interface Props {
  script: Script;
  settings: Settings;
  onExit: () => void;
}

type Phase = 'ready' | 'countdown' | 'playing' | 'paused' | 'retell';

export function Reader({ script, settings, onExit }: Props) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [countdown, setCountdown] = useState(settings.countdownSeconds);
  const [progress, setProgress] = useState(0); // logical fraction 0..1, survives resize
  const progressRef = useRef(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);
  const recorder = useRecorder();
  const camera = useCamera();

  const words = useMemo(() => wordCount(script.text), [script.text]);
  const durationSec = useMemo(() => readingDurationSeconds(words, settings.wpm), [words, settings.wpm]);

  const scrollablePx = useCallback(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return 0;
    // Text travels its own height plus the viewport height (fully enter bottom, leave top).
    return content.scrollHeight + viewport.clientHeight * 0.6;
  }, []);

  const applyProgress = useCallback(
    (fraction: number) => {
      const clamped = Math.min(1, Math.max(0, fraction));
      progressRef.current = clamped;
      setProgress(clamped);
      const viewport = viewportRef.current;
      const content = contentRef.current;
      if (!viewport || !content) return;
      const startOffset = viewport.clientHeight * 0.6;
      const y = startOffset - clamped * scrollablePx();
      content.style.transform = `translateY(${y}px)`;
    },
    [scrollablePx],
  );

  const releaseWakeLock = useCallback(() => {
    wakeLockRef.current?.release().catch(() => undefined);
    wakeLockRef.current = null;
  }, []);

  const requestWakeLock = useCallback(() => {
    const nav = navigator as Navigator & {
      wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> };
    };
    if (!nav.wakeLock) return;
    nav.wakeLock
      .request('screen')
      .then((lock) => {
        wakeLockRef.current = lock;
      })
      .catch(() => undefined);
  }, []);

  const pause = useCallback(() => {
    setPhase((p) => (p === 'playing' || p === 'countdown' ? 'paused' : p));
    releaseWakeLock();
  }, [releaseWakeLock]);

  // Elapsed-time motion loop: position advances by real elapsed seconds, not frames.
  useEffect(() => {
    if (phase !== 'playing') return;
    requestWakeLock();
    lastTickRef.current = performance.now();
    const total = scrollablePx();
    const pxPerSec = durationSec > 0 ? total / durationSec : 0;
    const tick = (now: number) => {
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      if (pxPerSec > 0 && total > 0) {
        const next = progressRef.current + (pxPerSec * dt) / total;
        if (next >= 1) {
          applyProgress(1);
          setPhase('paused');
          releaseWakeLock();
          return;
        }
        applyProgress(next);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [phase, durationSec, scrollablePx, applyProgress, releaseWakeLock]);

  // Pause safely when the app is backgrounded; re-acquire wake lock when visible again.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        pause();
      } else if (phase === 'playing') {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [pause, phase, requestWakeLock]);

  useEffect(() => () => releaseWakeLock(), [releaseWakeLock]);

  // Re-apply logical position when layout-affecting settings change.
  useEffect(() => {
    applyProgress(progress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.fontSize, settings.lineHeight, script.text]);

  const beginCountdown = () => {
    if (settings.countdownSeconds <= 0) {
      setPhase('playing');
      return;
    }
    setCountdown(settings.countdownSeconds);
    setPhase('countdown');
  };

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      setPhase('playing');
      return;
    }
    const t = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, countdown]);

  const restart = () => {
    applyProgress(0);
    setPhase('ready');
    releaseWakeLock();
  };

  const enterRetell = () => {
    pause();
    setPhase('retell');
  };

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  // Attach the camera stream to the <video> as soon as either appears.
  const setCameraVideo = useCallback(
    (el: HTMLVideoElement | null) => {
      if (el && camera.stream && el.srcObject !== camera.stream) {
        el.srcObject = camera.stream;
        el.play().catch(() => undefined);
      }
    },
    [camera.stream],
  );

  const cameraOn = camera.stream !== null;
  const [videoSize, setVideoSize] = useState('');
  const readVideoSize = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    setVideoSize(v.videoWidth && v.videoHeight ? `${v.videoWidth}\u00d7${v.videoHeight}` : '');
  };
  const inReader = phase !== 'retell';

  return (
    <div className="reader">
      <header className="reader-top">
        <button type="button" className="ghost" onClick={onExit}>
          &larr; Scripts
        </button>
        <span className="reader-title">{script.name}</span>
        <span className="reader-meta">
          {words} words &middot; {settings.wpm} wpm
        </span>
      </header>

      {inReader ? (
        <div
          className={cameraOn ? 'viewport camera-on' : 'viewport'}
          ref={viewportRef}
          style={{ fontSize: settings.fontSize, lineHeight: settings.lineHeight }}
        >
          {cameraOn && (
            <>
              <video className="camera-feed" ref={setCameraVideo} onLoadedMetadata={readVideoSize} onResize={readVideoSize} autoPlay playsInline muted aria-label="Front camera preview" />
              <div className="camera-scrim" aria-hidden="true" />
            </>
          )}
          <div className="reading-band" aria-hidden="true" />
          <div className="content" ref={contentRef}>
            {script.text.split(/\n+/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <div className="fade fade-top" aria-hidden="true" />
          <div className="fade fade-bottom" aria-hidden="true" />
          {phase === 'countdown' && (
            <div className="countdown" role="status">
              {countdown}
            </div>
          )}
        </div>
      ) : (
        <div className="retell">
          <h2>Now say it in your own words</h2>
          <p>The script is hidden. Explain the same ideas without reading.</p>
        </div>
      )}

      <div className="scrub">
        <input
          type="range"
          min={0}
          max={1000}
          value={Math.round(progress * 1000)}
          onChange={(e) => applyProgress(Number(e.target.value) / 1000)}
          aria-label="Reading position"
        />
      </div>

      <div className="controls">
        <button type="button" onClick={restart} className="ghost">
          Restart
        </button>
        {phase === 'playing' || phase === 'countdown' ? (
          <button type="button" className="primary" onClick={pause}>
            Pause
          </button>
        ) : (
          <button type="button" className="primary" onClick={beginCountdown}>
            {phase === 'paused' ? 'Resume' : 'Start'}
          </button>
        )}
        {inReader && (
          <button type="button" className="ghost" onClick={enterRetell}>
            Hide text &amp; retell
          </button>
        )}
        {phase === 'retell' && (
          <button type="button" className="ghost" onClick={() => setPhase('paused')}>
            Show script
          </button>
        )}
        <button
          type="button"
          className={cameraOn ? 'ghost camera-active' : 'ghost'}
          disabled={camera.state === 'requesting' || recorder.state === 'recording'}
          aria-pressed={cameraOn}
          onClick={camera.toggle}
        >
          {camera.state === 'requesting' ? 'Starting camera\u2026' : cameraOn ? 'Camera off' : 'Camera'}
        </button>
      </div>
      {camera.error && <p className="error">{camera.error}</p>}
      {cameraOn && camera.details && (
        <p className="camera-details" aria-label="Camera details">
          {camera.details}
          {videoSize ? ` \u00b7 showing ${videoSize}` : ''}
        </p>
      )}

      <div className="record-bar">
        {recorder.state === 'recording' ? (
          <>
            <span className="rec-dot" aria-hidden="true" /> Recording {fmt(recorder.elapsedMs)}
            <button type="button" className="primary" onClick={recorder.stop}>
              Stop
            </button>
          </>
        ) : (
          <button
            type="button"
            className="ghost"
            disabled={recorder.state === 'requesting' || recorder.state === 'saving'}
            onClick={() => recorder.start(script.id, script.name, phase === 'retell' ? 'retell' : 'scripted')}
          >
            {recorder.state === 'requesting' ? 'Asking for mic\u2026' : 'Record this attempt'}
          </button>
        )}
        {recorder.state !== 'recording' && cameraOn && (
          <button
            type="button"
            className="ghost"
            disabled={recorder.state === 'requesting' || recorder.state === 'saving'}
            onClick={() =>
              recorder.start(
                script.id,
                script.name,
                phase === 'retell' ? 'retell' : 'scripted',
                camera.stream?.getVideoTracks()[0] ?? null,
              )
            }
          >
            Record with camera
          </button>
        )}
        {recorder.state === 'saving' && <span>Saving&hellip;</span>}
      </div>
      {recorder.error && <p className="error">{recorder.error}</p>}
    </div>
  );
}
