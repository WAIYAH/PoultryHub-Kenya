import { normalizeKenyanMobile } from "@/domain/phone";
import type { FixtureUser } from "@/mocks/fixtures/accounts";
import { AppError } from "@/lib/errors";
import { randomId } from "@/lib/ids";
import type { Session } from "@/types/domain";

import type { AuthService } from "../contracts";

import { mockRequest } from "./latency";
import { mutateState, readState, type DemoState } from "./state";

// Mock authentication with the same shape as Supabase Auth (Phase 3): sign-up sends a confirmation
// link, password reset sends a recovery link, and both links finish at /auth/callback?code=…
// No email is sent in the demo: the link is returned as `demoLink` so the UI can offer it.

const CODE_TTL_MS = 60 * 60_000;
const MIN_PASSWORD_LENGTH = 8; // NFR-SEC-4

type Listener = (session: Session | null) => void;
const listeners = new Set<Listener>();

function toSession(user: FixtureUser): Session {
  return { user: { id: user.id, email: user.email, fullName: user.fullName } };
}

export function sessionFrom(state: DemoState): Session | null {
  const user = state.users.find((u) => u.id === state.sessionUserId);
  return user ? toSession(user) : null;
}

function notify(session: Session | null): void {
  for (const listener of listeners) listener(session);
}

function issueCode(state: DemoState, userId: string): string {
  const code = randomId();
  state.authCodes = state.authCodes.filter((c) => Date.parse(c.expiresAt) > Date.now());
  state.authCodes.push({
    code,
    userId,
    expiresAt: new Date(Date.now() + CODE_TTL_MS).toISOString(),
  });
  return code;
}

function sameEmail(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function createMockAuthService(): AuthService {
  return {
    getSession() {
      return Promise.resolve(sessionFrom(readState()));
    },

    onSessionChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    async signIn({ email, password }) {
      await mockRequest();
      const session = mutateState((state) => {
        const user = state.users.find((u) => sameEmail(u.email, email));
        if (user?.password !== password) throw new AppError("INVALID_CREDENTIALS");
        if (!user.confirmed) throw new AppError("EMAIL_NOT_CONFIRMED");
        state.sessionUserId = user.id;
        return toSession(user);
      });
      notify(session);
      return session;
    },

    async signUp(input) {
      await mockRequest();
      const fields: Record<string, string> = {};
      if (input.fullName.trim().length < 2) fields.fullName = "Enter your name.";
      const phone = normalizeKenyanMobile(input.phone);
      if (!phone) fields.phone = "Enter a Kenyan mobile number, e.g. 0712 345 678.";
      if (input.password.length < MIN_PASSWORD_LENGTH) {
        fields.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
      }
      if (Object.keys(fields).length > 0) {
        throw new AppError("VALIDATION_FAILED", undefined, { fields });
      }

      return mutateState((state) => {
        if (state.users.some((u) => sameEmail(u.email, input.email))) {
          throw new AppError("EMAIL_IN_USE");
        }
        const user: FixtureUser = {
          id: `usr_${randomId()}`,
          email: input.email.trim().toLowerCase(),
          password: input.password,
          fullName: input.fullName.trim(),
          phone,
          marketingOptIn: input.marketingOptIn,
          confirmed: false,
          addresses: [],
        };
        state.users.push(user);
        const code = issueCode(state, user.id);
        return { email: user.email, demoLink: `/auth/callback?code=${code}&next=/account` };
      });
    },

    async exchangeCode(code) {
      await mockRequest();
      const session = mutateState((state) => {
        const entry = state.authCodes.find((c) => c.code === code);
        const user = entry && state.users.find((u) => u.id === entry.userId);
        if (!entry || !user || Date.parse(entry.expiresAt) < Date.now()) {
          throw new AppError(
            "NOT_FOUND",
            "This link has expired or was already used. Request a new one.",
          );
        }
        state.authCodes = state.authCodes.filter((c) => c.code !== code); // single use
        user.confirmed = true; // following an emailed link proves the address
        state.sessionUserId = user.id;
        return toSession(user);
      });
      notify(session);
      return session;
    },

    async signOut() {
      await mockRequest();
      // One device in the demo, so "this device" and "all devices" (ACC-02) behave the same.
      mutateState((state) => {
        state.sessionUserId = null;
      });
      notify(null);
    },

    async requestPasswordReset(email) {
      await mockRequest();
      return mutateState((state) => {
        const user = state.users.find((u) => sameEmail(u.email, email));
        if (!user) return { email: email.trim() };
        const code = issueCode(state, user.id);
        return {
          email: user.email,
          demoLink: `/auth/callback?code=${code}&next=/auth/reset-password`,
        };
      });
    },

    async updatePassword(password) {
      await mockRequest();
      if (password.length < MIN_PASSWORD_LENGTH) {
        throw new AppError("VALIDATION_FAILED", `Use at least ${MIN_PASSWORD_LENGTH} characters.`, {
          fields: { password: `Use at least ${MIN_PASSWORD_LENGTH} characters.` },
        });
      }
      mutateState((state) => {
        const user = state.users.find((u) => u.id === state.sessionUserId);
        if (!user) throw new AppError("UNAUTHENTICATED");
        user.password = password;
      });
    },
  };
}
