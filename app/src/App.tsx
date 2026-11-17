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
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('dark');
  const [phoneTheme, setPhoneTheme] = useState<'light' | 'dark'>('dark');

  // Apply theme choice: explicit light/dark, or follow the phone's setting.
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const apply = () => {
      const phone = media.matches ? 'light' : 'dark';
      setPhoneTheme(phone);
      const theme = settings.theme === 'system' ? phone : settings.theme;
      root.dataset.theme = theme;
      setEffectiveTheme(theme);
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
        <p className="eyebrow">READ ALOUD / 001</p>
        <h1>English Flow</h1>
        <p className="tagline">Read aloud. Listen back. Retell without the script.</p>
        <button
          type="button"
          className="theme-toggle"
          aria-label={effectiveTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          onClick={() => {
            // Choosing what the phone already uses goes back to "Follow phone" instead of pinning it.
            const target = effectiveTheme === 'light' ? 'dark' : 'light';
            updateSettings({ theme: target === phoneTheme ? 'system' : target });
          }}
        >
          <svg className="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4.2" fill="currentColor" stroke="none" />
            <line x1="12" y1="1.8" x2="12" y2="4.4" />
            <line x1="12" y1="19.6" x2="12" y2="22.2" />
            <line x1="1.8" y1="12" x2="4.4" y2="12" />
            <line x1="19.6" y1="12" x2="22.2" y2="12" />
            <line x1="4.8" y1="4.8" x2="6.6" y2="6.6" />
            <line x1="17.4" y1="17.4" x2="19.2" y2="19.2" />
            <line x1="4.8" y1="19.2" x2="6.6" y2="17.4" />
            <line x1="17.4" y1="6.6" x2="19.2" y2="4.8" />
          </svg>
          <svg className="icon-moon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.6 14.2A8.8 8.8 0 0 1 9.8 3.4a.7.7 0 0 0-.9-.9 10.2 10.2 0 1 0 12.6 12.6.7.7 0 0 0-.9-.9Z" />
          </svg>
        </button>
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

      <hr className="header-divider" />

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
          <p className="hint" aria-label="Theme details">
            Phone reports {phoneTheme} mode &middot; saved choice:{' '}
            {settings.theme === 'system' ? 'Follow phone' : settings.theme} &middot; showing {effectiveTheme}
          </p>
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
