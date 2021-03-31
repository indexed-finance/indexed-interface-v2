import { useEffect, useMemo } from "react";

const storageKeyCache: Record<string, 1> = {};

interface StorageEntry<T> {
  entry: T;
  store(entry: T): void;
  retrieve(): T;
  clear(): void;
}

export function useStorageEntry<T>(key: string, fallback: T): StorageEntry<T> {
  const handlers = useMemo<Omit<StorageEntry<T>, "entry">>(
    () => ({
      store(entry) {
        try {
          console.log("here");
          window.localStorage.setItem(key, JSON.stringify(entry, null, 2));
        } catch {}
      },
      retrieve() {
        try {
          return (
            (JSON.parse(window.localStorage.getItem(key) ?? "") as T) ??
            fallback
          );
        } catch {
          return fallback;
        }
      },
      clear() {
        try {
          window.localStorage.clearItem(key);
        } catch {}
      },
    }),
    [key, fallback]
  );

  // Effect:
  // Handle caching to prevent accidentally reusing the same key.
  useEffect(() => {
    if (storageKeyCache[key]) {
      throw new Error(`Non-unique key ${key} given to useStorage`);
    } else {
      storageKeyCache[key] = 1;

      return () => {
        handlers.clear();
        delete storageKeyCache[key];
      };
    }
  }, [key, handlers]);

  return {
    entry: handlers.retrieve(),
    ...handlers,
  };
}
