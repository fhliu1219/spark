import type { UserState } from "@/types";

const STORAGE_KEY = "spark_user_state";

export function loadState(): UserState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as UserState;
  } catch {
    return null;
  }
}

export function saveState(state: UserState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
