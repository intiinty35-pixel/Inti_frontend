const MAP_REQUEST_CACHE_TTL_MS = 60_000;
const MAX_MAP_REQUEST_CACHE_ENTRIES = 50;

interface CacheEntry<T> {
  expiresAt: number;
  promise: Promise<T>;
}

export function createMapRequestCache<T>() {
  const entries = new Map<string, CacheEntry<T>>();

  return (key: string, load: () => Promise<T>): Promise<T> => {
    const cached = entries.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.promise;

    const entry: CacheEntry<T> = {
      expiresAt: Number.POSITIVE_INFINITY,
      promise: Promise.resolve()
        .then(load)
        .then(
          (value) => {
            if (entries.get(key) === entry) {
              entry.expiresAt = Date.now() + MAP_REQUEST_CACHE_TTL_MS;
            }
            return value;
          },
          (error: unknown) => {
            if (entries.get(key) === entry) entries.delete(key);
            throw error;
          },
        ),
    };
    entries.set(key, entry);

    for (const [cachedKey, cachedEntry] of entries) {
      if (cachedEntry.expiresAt <= Date.now()) entries.delete(cachedKey);
    }
    while (entries.size > MAX_MAP_REQUEST_CACHE_ENTRIES) {
      const oldestKey = entries.keys().next().value;
      if (oldestKey === undefined) break;
      entries.delete(oldestKey);
    }

    return entry.promise;
  };
}
