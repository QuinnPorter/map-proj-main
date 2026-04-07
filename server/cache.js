// Simple in-memory cache with TTL
const store = new Map();

export function getCache(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function setCache(key, value, ttlMs = 3600000) {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

export function deleteCache(key) {
  store.delete(key);
}

export function getCacheKeys() {
  return [...store.keys()];
}
