import { useState } from 'react';
import type { Script } from './types';
import { newId, saveScripts, wordCount } from './store';

interface Props {
  scripts: Script[];
  setScripts: (s: Script[]) => void;
  onOpen: (id: string) => void;
}

const SAMPLE: Script = {
  id: 'sample-welcome',
  name: 'Welcome passage',
  text: 'Reading aloud is one of the simplest ways to practise spoken English.\n\nPick a short passage. Read it slowly the first time. Listen to where you pause and where you rush.\n\nThen record yourself. When you listen back, notice one thing you want to change, not ten.\n\nFinally, hide the text and explain the same ideas in your own words. That is where real fluency grows.',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export function Scripts({ scripts, setScripts, onOpen }: Props) {
  const [editing, setEditing] = useState<Script | null>(null);

  const persist = (next: Script[]) => {
    setScripts(next);
    saveScripts(next);
  };

  const save = () => {
    if (!editing || !editing.text.trim()) return;
    const now = Date.now();
    const exists = scripts.some((s) => s.id === editing.id);
    const next = exists
      ? scripts.map((s) => (s.id === editing.id ? { ...editing, updatedAt: now } : s))
      : [...scripts, { ...editing, id: editing.id || newId(), createdAt: now, updatedAt: now }];
    persist(next);
    setEditing(null);
  };

  const remove = (id: string) => persist(scripts.filter((s) => s.id !== id));

  if (editing) {
    return (
      <div className="editor">
        <input
          className="name-input"
          value={editing.name}
          onChange={(e) => setEditing({ ...editing, name: e.target.value })}
          placeholder="Script name"
        />
        <textarea
          value={editing.text}
          onChange={(e) => setEditing({ ...editing, text: e.target.value })}
          placeholder="Paste or write the passage you want to practise reading aloud."
          rows={14}
        />
        <div className="controls">
          <button type="button" className="primary" onClick={save} disabled={!editing.text.trim()}>
            Save
          </button>
          <button type="button" className="ghost" onClick={() => setEditing(null)}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="scripts">
      {scripts.length === 0 && (
        <p className="empty">
          No scripts yet. Add a short passage, then read it aloud, record yourself, and retell it
          without the text.
        </p>
      )}
      <ul className="script-list">
        {scripts.map((s) => (
          <li key={s.id}>
            <button type="button" className="script-open" onClick={() => onOpen(s.id)}>
              <span className="script-name">{s.name}</span>
              <span className="script-meta">{wordCount(s.text)} words</span>
            </button>
            <button type="button" className="ghost" onClick={() => setEditing(s)} aria-label={`Edit ${s.name}`}>
              Edit
            </button>
            <button
              type="button"
              className="ghost danger"
              onClick={() => remove(s.id)}
              aria-label={`Delete ${s.name}`}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <div className="controls">
        <button
          type="button"
          className="primary"
          onClick={() => setEditing({ id: newId(), name: '', text: '', createdAt: 0, updatedAt: 0 })}
        >
          New script
        </button>
        {scripts.length === 0 && (
          <button type="button" className="ghost" onClick={() => persist([SAMPLE])}>
            Add sample passage
          </button>
        )}
      </div>
    </div>
  );
}
