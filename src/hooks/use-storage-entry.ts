import { useEffect, useMemo } from "react";

const storageKeyCache: Record<string, 1> = {};

export default function useStorageEntry(key: string) {
  const handlers = useMemo(
    () => ({
      store(entry: any) {
        try {
          window.localStorage.setItem(
            key,
            typeof entry === "object"
              ? JSON.stringify(entry, null, 2)
              : entry.toString()
          );
        } catch {}
      },
      retrieve(fallback?: any) {
        try {
          return window.localStorage.getItem(key) ?? fallback;
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
    [key]
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

  if (window?.localStorage) {
    return;
  } else {
    return null;
  }
}
