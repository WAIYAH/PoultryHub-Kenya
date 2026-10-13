// The mock data source's "database": everything the demo writes (orders, payments, accounts,
// sessions, messages). Kept in localStorage so a placed order survives a reload, as it would on the
// real backend; in memory where there is no browser (pre-rendering, Node scripts).
import {
  exampleOrders,
  users,
  type FixtureOrder,
  type FixtureUser,
} from "@/mocks/fixtures/accounts";
import type { ContactInput } from "@/types/domain";

export interface DemoOrder extends FixtureOrder {
  /** True for orders placed in the demo: their quantities are held from stock (BR-08). */
  reservesStock: boolean;
}

export interface DemoState {
  version: 1;
  nextOrderSeq: number;
  users: FixtureUser[];
  sessionUserId: string | null;
  authCodes: { code: string; userId: string; expiresAt: string }[];
  orders: DemoOrder[];
  contactMessages: (ContactInput & { id: string; createdAt: string })[];
}

export const DEMO_STATE_STORAGE_KEY = "phk-demo-state";

let memory: DemoState | null = null;

function seed(): DemoState {
  return {
    version: 1,
    nextOrderSeq: 1101,
    users: structuredClone(users),
    sessionUserId: null,
    authCodes: [],
    orders: exampleOrders().map((order) => ({ ...order, reservesStock: false })),
    contactMessages: [],
  };
}

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readState(): DemoState {
  const store = storage();
  if (!store) return (memory ??= seed());
  const raw = store.getItem(DEMO_STATE_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as DemoState;
      if (parsed.version === 1) return parsed;
    } catch {
      // Corrupt or foreign data: start again from the sample data.
    }
  }
  const fresh = seed();
  writeState(fresh);
  return fresh;
}

function writeState(state: DemoState): void {
  const store = storage();
  if (!store) {
    memory = state;
    return;
  }
  try {
    store.setItem(DEMO_STATE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    memory = state; // quota exceeded: keep working for this page view
  }
}

/** Reads, changes and saves the demo state in one step. */
export function mutateState<T>(change: (state: DemoState) => T): T {
  const state = readState();
  const result = change(state);
  writeState(state);
  return result;
}

/** Back to the sample data (tests, and the "reset demo data" control). */
export function resetDemoState(): void {
  memory = null;
  storage()?.removeItem(DEMO_STATE_STORAGE_KEY);
}
