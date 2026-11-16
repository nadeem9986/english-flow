import { useEffect, useState } from 'react';
import type { Script, Settings } from './types';
import { loadScripts, loadSettings, saveSettings } from './store';
import { Scripts } from './Scripts';
import { Reader } from './Reader';
import { Recordings } from './Recordings';

type View = 'scripts' | 'recordings';

export default function App() {
  const [scripts, setScripts] = useState<Script[]>(() => loadScripts());
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [view, setView] = useState<View>('scripts');
  const [openScript, setOpenScript] = useState<Script | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Apply theme choice: explicit light/dark, or follow the phone's setting.
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const apply = () => {
      const theme = settings.theme === 'system' ? (media.matches ? 'light' : 'dark') : settings.theme;
      root.dataset.theme = theme;
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [settings.theme]);

  const updateSettings = (patch: Partial<Settings>) => {
    setSettings((s) => {
      const next = { ...s, ...patch };
      saveSettings(next);
      return next;
    });
  };

  if (openScript) {
    return <Reader script={openScript} settings={settings} onExit={() => setOpenScript(null)} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>English Flow</h1>
        <p className="tagline">Read aloud. Listen back. Retell without the script.</p>
      </header>

      <nav className="tabs">
        <button
          type="button"
          className={view === 'scripts' ? 'tab active' : 'tab'}
          onClick={() => {
            setView('scripts');
            setShowSettings(false);
          }}
        >
          Scripts
        </button>
        <button
          type="button"
          className={view === 'recordings' ? 'tab active' : 'tab'}
          onClick={() => {
            setView('recordings');
            setShowSettings(false);
          }}
       >
          Recordings
        </button>
        <button type="button" className="tab" onClick={() => setShowSettings((v) => !v)}>
          Settings
        </button>
      </nav>

      {showSettings && (
        <section className="settings">
          <label>
            Reading speed: {settings.wpm} wpm
            <input
              type="range"
              min={60}
              max={220}
              step={5}
              value={settings.wpm}
              onChange={(e) => updateSettings({ wpm: Number(e.target.value) })}
            />
          </label>
          <label>
            Text size: {settings.fontSize}px
            <input
              type="range"
              min={18}
              max={48}
              value={settings.fontSize}
              onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
            />
          </label>
          <label>
            Line spacing: {settings.lineHeight.toFixed(1)}
            <input
              type="range"
              min={1.2}
              max={2.2}
              step={0.1}
              value={settings.lineHeight}
              onChange={(e) => updateSettings({ lineHeight: Number(e.target.value) })}
            />
          </label>
          <label>
            Theme
            <select
              value={settings.theme}
              onChange={(e) => updateSettings({ theme: e.target.value as Settings['theme'] })}
            >
              <option value="system">Follow phone</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </label>
          <label>
            Countdown: {settings.countdownSeconds}s
            <input
              type="range"
              min={0}
              max={5}
              value={settings.countdownSeconds}
              onChange={(e) => updateSettings({ countdownSeconds: Number(e.target.value) })}
            />
          </label>
        </section>
      )}

      <main>{view === 'scripts' ? <Scripts scripts={scripts} setScripts={setScripts} onOpen={setOpenScript} /> : <Recordings />}</main>

      <footer className="app-footer">
        <p>Your scripts and recordings stay on this device. No account needed.</p>
      </footer>
    </div>
  );
}
