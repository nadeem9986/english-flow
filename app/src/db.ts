import type { RecordingMeta } from './types';

const DB_NAME = 'english-flow';
const DB_VERSION = 1;
const META_STORE = 'recordings';
const BLOB_STORE = 'blobs';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(BLOB_STORE)) {
        db.createObjectStore(BLOB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(store: string, mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const req = run(t.objectStore(store));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
        t.onerror = () => reject(t.error);
      }),
  );
}

export async function putRecording(meta: RecordingMeta, blob: Blob): Promise<void> {
  await tx(BLOB_STORE, 'readwrite', (s) => s.put(blob, meta.id));
  await tx(META_STORE, 'readwrite', (s) => s.put(meta));
}

export function listRecordings(): Promise<RecordingMeta[]> {
  return tx(META_STORE, 'readonly', (s) => s.getAll() as IDBRequest<RecordingMeta[]>);
}

export function getRecordingBlob(id: string): Promise<Blob | undefined> {
  return tx(BLOB_STORE, 'readonly', (s) => s.get(id) as IDBRequest<Blob | undefined>);
}

export async function deleteRecording(id: string): Promise<void> {
  await tx(BLOB_STORE, 'readwrite', (s) => s.delete(id));
  await tx(META_STORE, 'readwrite', (s) => s.delete(id));
}
