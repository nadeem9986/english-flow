import { useEffect, useState } from 'react';
import type { RecordingMeta } from './types';
import { extForRecording } from './recording';
import { deleteRecording, getRecordingBlob, listRecordings } from './db';

function fmtDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function Recordings() {
  const [items, setItems] = useState<RecordingMeta[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<string | null>(null);

  const refresh = () => {
    listRecordings()
      .then((all) => setItems(all.sort((a, b) => b.createdAt - a.createdAt)))
      .catch(() => setItems([]));
  };

  useEffect(refresh, []);

  useEffect(
    () => () => {
      Object.values(urls).forEach((u) => URL.revokeObjectURL(u));
    },
    [urls],
  );

  const togglePlay = async (id: string) => {
    if (open === id) {
      setOpen(null);
      return;
    }
    if (!urls[id]) {
      const blob = await getRecordingBlob(id);
      if (!blob) return;
      setUrls((u) => ({ ...u, [id]: URL.createObjectURL(blob) }));
    }
    setOpen(id);
  };

  const exportOne = async (rec: RecordingMeta) => {
    const blob = await getRecordingBlob(rec.id);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date(rec.createdAt).toISOString().slice(0, 10);
    a.href = url;
    a.download = `${rec.scriptName || 'practice'}-${rec.kind}-${date}.${extForRecording(rec.mimeType)}`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
  };

  const remove = async (id: string) => {
    await deleteRecording(id);
    if (urls[id]) URL.revokeObjectURL(urls[id]);
    setUrls((u) => {
      const next = { ...u };
      delete next[id];
      return next;
    });
    refresh();
  };

  return (
    <div className="recordings">
      {items.length === 0 && <p className="empty">No recordings yet. Record an attempt from any script.</p>}
      <ul className="rec-list">
        {items.map((r) => (
          <li key={r.id} className="rec-item">
            <div className="rec-head">
              <span className="script-name">{r.scriptName || 'Practice'}</span>
              <span className={`badge ${r.kind}`}>{r.kind === 'retell' ? 'Retell' : 'Reading'}</span>
              {r.hasVideo && <span className="badge">Video</span>}
            </div>
            <div className="rec-meta">
              {new Date(r.createdAt).toLocaleString()} &middot; {fmtDuration(r.durationMs)}
            </div>
            {open === r.id && urls[r.id] &&
              (r.hasVideo ? (
                <video className="rec-video" controls autoPlay playsInline src={urls[r.id]} />
              ) : (
                <audio controls autoPlay src={urls[r.id]} />
              ))}
            <div className="controls">
              <button type="button" className="ghost" onClick={() => togglePlay(r.id)}>
                {open === r.id ? 'Close' : r.hasVideo ? 'Watch' : 'Listen'}
              </button>
              <button type="button" className="ghost" onClick={() => exportOne(r)}>
                Export
              </button>
              <button type="button" className="ghost danger" onClick={() => remove(r.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {items.length > 0 && (
        <p className="hint">
          Recordings live only in this browser's storage, which the phone may clear under storage
          pressure. Export the ones you want to keep.
        </p>
      )}
    </div>
  );
}
