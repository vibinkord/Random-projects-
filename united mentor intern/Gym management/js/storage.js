// js/storage.js
// Stable localStorage wrapper (NO DUPLICATES)

const PREFIX = "gym_";

function key(name) {
  return PREFIX + name;
}

export function readCollection(name) {
  const raw = localStorage.getItem(key(name));
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function writeCollection(name, data) {
  localStorage.setItem(key(name), JSON.stringify(data));
}

export function insertItem(name, item) {
  const col = readCollection(name);
  col.push(item);
  writeCollection(name, col);
}

export function updateItem(name, id, updates) {
  const col = readCollection(name);
  const index = col.findIndex(i => i.id === id);
  if (index === -1) return false;
  col[index] = { ...col[index], ...updates };
  writeCollection(name, col);
  return true;
}

export function deleteItem(name, id) {
  const col = readCollection(name).filter(i => i.id !== id);
  writeCollection(name, col);
}

export function generateId(prefix = "") {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
