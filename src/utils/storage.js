const STORAGE_PREFIX = 'ag_';

export function getJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
    return fallback;
  } catch {
    console.warn(`[storage] 讀取 ${key} 失敗，使用預設值`);
    try { localStorage.removeItem(STORAGE_PREFIX + key); } catch { /* 清除失敗可忽略 */ }
    return fallback;
  }
}

export function setJSON(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      console.warn(`[storage] ${key} 儲存失敗：localStorage 容量已滿`);
    }
    return false;
  }
}

export function removeKey(key) {
  try { localStorage.removeItem(STORAGE_PREFIX + key); } catch { /* removeItem 可忽略 */ }
}

export function getRaw(key) {
  try { return localStorage.getItem(STORAGE_PREFIX + key); } catch { return null; }
}
