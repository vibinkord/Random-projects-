// js/logger.js
import { readCollection, writeCollection } from "./storage.js";

const LOG_KEY = "logs";

export function logEvent(action, payload = {}) {
  const logs = readCollection(LOG_KEY);
  const entry = {
    id: Date.now().toString(36),
    action,
    payload,
    createdAt: new Date().toISOString(),
  };
  logs.push(entry);
  writeCollection(LOG_KEY, logs);
  console.info("[LOG]", action, payload);
}
