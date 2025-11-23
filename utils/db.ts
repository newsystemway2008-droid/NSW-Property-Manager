import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'PropertyManagerDB';
const STORE_NAME = 'files';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

const initDB = () => {
  if (dbPromise) {
    return dbPromise;
  }
  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
  return dbPromise;
};

export const addFile = async (file: File): Promise<string> => {
  const db = await initDB();
  const fileId = `${Date.now()}-${file.name}`;
  await db.put(STORE_NAME, file, fileId);
  return fileId;
};

export const getFile = async (fileId: string): Promise<File | undefined> => {
  const db = await initDB();
  return db.get(STORE_NAME, fileId);
};

export const deleteFile = async (fileId: string): Promise<void> => {
  const db = await initDB();
  await db.delete(STORE_NAME, fileId);
};

export const deleteFiles = async (fileIds: string[]): Promise<void> => {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await Promise.all([...fileIds.map(id => tx.store.delete(id)), tx.done]);
};
