import { useSyncExternalStore } from "react";

import { getServices } from "@/services";
import type { Session } from "@/types/domain";

// The signed-in session for the UI (ARCHITECTURE.md §7.7): menus, greetings, prefill and redirects
// only. Access is enforced by the data source (RLS from Phase 3), never by this hook. It starts
// listening on first use, so pages that never ask for the session never load the auth service.

export type SessionState = { status: "loading" } | { status: "ready"; session: Session | null };

const LOADING: SessionState = { status: "loading" };
let state: SessionState = LOADING;
let started = false;
const listeners = new Set<() => void>();

function set(next: SessionState) {
  state = next;
  for (const listener of listeners) listener();
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  const auth = getServices().auth;
  auth.onSessionChange((session) => set({ status: "ready", session }));
  auth.getSession().then(
    (session) => set({ status: "ready", session }),
    () => set({ status: "ready", session: null }),
  );
}

function subscribe(listener: () => void) {
  start();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The current session: "loading" until the data source has answered. */
export function useSession(): SessionState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => LOADING,
  );
}
