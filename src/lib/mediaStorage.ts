// Media Storage Service using IndexedDB for large files (Videos, PDFs, Images)
import { uploadPublicMedia } from './supabase';

const DB_NAME = 'EduPlatformMediaStore';
const DB_VERSION = 1;
const STORE_NAME = 'media_files';

export interface StoredMediaFile {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'video' | 'file';
  sizeFormatted: string;
  sizeBytes: number;
  mimeType: string;
  blob?: Blob;
  dataUrl?: string;
  uploadedAt: string;
}

// In-memory cache for fast blob URLs
const blobUrlCache = new Map<string, string>();

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function getFileType(mime: string, name: string): 'pdf' | 'image' | 'video' | 'file' {
  if (mime.includes('pdf') || name.toLowerCase().endsWith('.pdf')) return 'pdf';
  if (mime.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(name)) return 'image';
  if (mime.startsWith('video/') || /\.(mp4|webm|mov|mkv|avi)$/i.test(name)) return 'video';
  return 'file';
}

export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a file through the backend API. Browser-only storage is retained only for local development.
 */
export async function saveMediaFile(file: File): Promise<StoredMediaFile & { url: string }> {
  const type = getFileType(file.type, file.name);
  const sizeFormatted = formatFileSize(file.size);

  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:4000/api');
    const form = new FormData();
    form.append('file', file, file.name);

    const response = await fetch(`${apiBase.replace(/\/$/, '')}/upload-media`, {
      method: 'POST',
      body: form,
    });

    if (response.ok) {
      const payload = await response.json();
      const finalUrl = payload.url || payload.publicUrl || payload.fileUrl;
      if (finalUrl) {
        return {
          id: payload.id || `media_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          name: file.name,
          type,
          sizeFormatted,
          sizeBytes: file.size,
          mimeType: file.type || 'application/octet-stream',
          uploadedAt: new Date().toISOString(),
          url: finalUrl,
        };
      }
    }
  } catch (err) {
    if (import.meta.env.PROD) {
      try {
        const publicUrl = await uploadPublicMedia(file);
        return {
          id: `supabase_${Date.now()}`,
          name: file.name,
          type,
          sizeFormatted,
          sizeBytes: file.size,
          mimeType: file.type || 'application/octet-stream',
          uploadedAt: new Date().toISOString(),
          url: publicUrl,
        };
      } catch (storageError) {
        console.warn('Supabase media fallback failed:', storageError);
      }
    }
    if (import.meta.env.PROD) {
      throw new Error('Media serveri ishlamayapti. Bunny.net sozlamalarini tekshiring.');
    }
    console.warn('Backend upload unavailable, falling back to local storage:', err);
  }

  if (import.meta.env.PROD) {
    try {
      const publicUrl = await uploadPublicMedia(file);
      return {
        id: `supabase_${Date.now()}`,
        name: file.name,
        type,
        sizeFormatted,
        sizeBytes: file.size,
        mimeType: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString(),
        url: publicUrl,
      };
    } catch (storageError) {
      console.warn('Supabase media fallback failed:', storageError);
    }
  }

  if (import.meta.env.PROD) {
    throw new Error('Fayl serverga yuklanmadi. Bunny.net CDN sozlamalarini to‘ldiring.');
  }

  const id = `media_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  let dataUrl: string | undefined = undefined;
  if (file.size < 15 * 1024 * 1024) {
    try {
      dataUrl = await fileToDataUrl(file);
    } catch {
      // ignore
    }
  }

  const record: StoredMediaFile = {
    id,
    name: file.name,
    type,
    sizeFormatted,
    sizeBytes: file.size,
    mimeType: file.type || 'application/octet-stream',
    blob: file,
    dataUrl,
    uploadedAt: new Date().toISOString(),
  };

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not store file in IndexedDB, using fallback:', err);
  }

  const objectUrl = URL.createObjectURL(file);
  blobUrlCache.set(id, objectUrl);

  return {
    ...record,
    url: dataUrl || objectUrl,
  };
}

/**
 * Resolves a media URL, whether it is a dataUrl, remote http(s) URL, or an IndexedDB media ID
 */
export async function resolveMediaUrl(urlOrId?: string): Promise<string> {
  if (!urlOrId) return '';
  if (urlOrId.startsWith('data:') || urlOrId.startsWith('http://') || urlOrId.startsWith('https://')) {
    return urlOrId;
  }
  if (urlOrId.startsWith('media_')) {
    const fromDb = await getMediaUrl(urlOrId);
    if (fromDb) return fromDb;
  }
  return urlOrId;
}

/**
 * Retrieves a media file blob or URL from IndexedDB
 */
export async function getMediaUrl(id: string): Promise<string | null> {
  if (blobUrlCache.has(id)) {
    return blobUrlCache.get(id)!;
  }

  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => {
        const record = req.result as StoredMediaFile | undefined;
        if (!record) {
          resolve(null);
          return;
        }

        if (record.blob) {
          const url = URL.createObjectURL(record.blob);
          blobUrlCache.set(id, url);
          resolve(url);
        } else if (record.dataUrl) {
          resolve(record.dataUrl);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Deletes a media file from IndexedDB
 */
export async function deleteMediaFile(id: string): Promise<void> {
  if (blobUrlCache.has(id)) {
    URL.revokeObjectURL(blobUrlCache.get(id)!);
    blobUrlCache.delete(id);
  }

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not delete from IndexedDB:', err);
  }
}
