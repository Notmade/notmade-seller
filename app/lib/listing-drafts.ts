// Listing drafts, kept in this browser until the backend can store them (it has no drafts route). A
// draft has never reached the server, so it cannot be reviewed or go live. IndexedDB holds the photos
// too; each seller only sees their own drafts. Every call fails soft: no storage means no drafts.
import type { Listing } from "./product-listing";

export interface ListingDraft { id: string; sellerId: string; listing: Listing; photos: File[]; savedAt: string }

const DB = "nm_seller"; const STORE = "listing_drafts";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => { req.result.createObjectStore(STORE, { keyPath: "id" }); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const req = run(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }).finally(() => db.close());
}

export const draftsAvailable = () => typeof indexedDB !== "undefined";

export async function saveDraft(d: ListingDraft): Promise<boolean> {
  try { await tx("readwrite", (s) => s.put(d)); return true; } catch { return false; }
}

export async function listDrafts(sellerId: string): Promise<ListingDraft[]> {
  try {
    const all = await tx<ListingDraft[]>("readonly", (s) => s.getAll());
    return all.filter((d) => d.sellerId === sellerId).sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  } catch { return []; }
}

export async function getDraft(id: string, sellerId: string): Promise<ListingDraft | null> {
  try {
    const d = await tx<ListingDraft | undefined>("readonly", (s) => s.get(id));
    return d?.sellerId === sellerId ? d : null;
  } catch { return null; }
}

export async function deleteDraft(id: string): Promise<void> {
  try { await tx("readwrite", (s) => s.delete(id)); } catch { /* nothing to clean up */ }
}
