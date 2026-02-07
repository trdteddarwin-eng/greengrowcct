// ============================================================
// GreenGrow Digital CCT — Local Storage Utilities
// ============================================================

import type { CallSession } from "@/lib/types";
import { defaultPlaybookText } from "@/lib/default-playbook";

const PLAYBOOK_KEY = "cct-playbook";
const CALL_HISTORY_KEY = "cct-call-history";

/**
 * Returns the user's stored playbook text, or the default playbook
 * if none has been saved.
 */
export function getPlaybook(): string {
  if (typeof window === "undefined") return defaultPlaybookText;
  try {
    const stored = localStorage.getItem(PLAYBOOK_KEY);
    return stored ?? defaultPlaybookText;
  } catch {
    return defaultPlaybookText;
  }
}

/**
 * Saves custom playbook text to localStorage.
 */
export function savePlaybook(text: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PLAYBOOK_KEY, text);
  } catch (error) {
    console.error("Failed to save playbook to localStorage:", error);
  }
}

/**
 * Returns the full call history from localStorage, sorted by most
 * recent first.
 */
export function getCallHistory(): CallSession[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CALL_HISTORY_KEY);
    if (!stored) return [];
    const history: CallSession[] = JSON.parse(stored);
    return history.sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  } catch {
    return [];
  }
}

/**
 * Saves a completed call session to localStorage, appending it
 * to the existing history.
 */
export function saveCall(session: CallSession): void {
  if (typeof window === "undefined") return;
  try {
    const history = getCallHistory();
    history.push(session);
    localStorage.setItem(CALL_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Failed to save call to localStorage:", error);
  }
}

/**
 * Clears all call history from localStorage.
 */
export function clearHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CALL_HISTORY_KEY);
  } catch (error) {
    console.error("Failed to clear call history from localStorage:", error);
  }
}

/**
 * Returns a persistent browser ID for scoping custom scenarios.
 * Creates one in localStorage if it doesn't exist.
 */
export function getBrowserId(): string {
  if (typeof window === "undefined") return "";
  try {
    const BROWSER_ID_KEY = "cct-browser-id";
    let id = localStorage.getItem(BROWSER_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(BROWSER_ID_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}
