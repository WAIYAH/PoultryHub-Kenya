import { isCountyName } from "@/domain/counties";
import { normalizeKenyanMobile } from "@/domain/phone";
import type { FixtureUser } from "@/mocks/fixtures/accounts";
import { AppError } from "@/lib/errors";
import { randomId } from "@/lib/ids";
import { blankToNull } from "@/lib/text";
import type { Profile } from "@/types/domain";

import type { AccountService } from "../contracts";

import { mockRequest } from "./latency";
import { mutateState, type DemoState } from "./state";

const MAX_ADDRESSES = 10; // ACC-05

function signedInUser(state: DemoState): FixtureUser {
  const user = state.users.find((u) => u.id === state.sessionUserId);
  if (!user) throw new AppError("UNAUTHENTICATED");
  return user;
}

function toProfile(user: FixtureUser): Profile {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    marketingOptIn: user.marketingOptIn,
  };
}

export function createMockAccountService(): AccountService {
  return {
    async getProfile() {
      await mockRequest();
      return mutateState((state) => toProfile(signedInUser(state)));
    },

    async updateProfile(input) {
      await mockRequest();
      const phone = input.phone?.trim() ? normalizeKenyanMobile(input.phone) : null;
      if (input.fullName.trim().length < 2 || (input.phone?.trim() && !phone)) {
        throw new AppError("VALIDATION_FAILED", undefined, {
          fields: {
            ...(input.fullName.trim().length < 2 ? { fullName: "Enter your name." } : {}),
            ...(input.phone?.trim() && !phone ? { phone: "Enter a Kenyan mobile number." } : {}),
          },
        });
      }
      return mutateState((state) => {
        const user = signedInUser(state);
        user.fullName = input.fullName.trim();
        user.phone = phone;
        user.marketingOptIn = input.marketingOptIn;
        return toProfile(user);
      });
    },

    async listAddresses() {
      const scenarios = await mockRequest();
      return mutateState((state) => {
        const user = signedInUser(state);
        return scenarios.has("empty") ? [] : structuredClone(user.addresses);
      });
    },

    async saveAddress({ id, isDefault, ...input }) {
      await mockRequest();
      const phone = normalizeKenyanMobile(input.phone);
      const fields: Record<string, string> = {};
      if (input.label.trim().length < 1) fields.label = "Give the address a name, e.g. Home.";
      if (input.recipientName.trim().length < 2)
        fields.recipientName = "Enter the recipient's name.";
      if (!phone) fields.phone = "Enter a Kenyan mobile number.";
      if (!isCountyName(input.county)) fields.county = "Choose a county.";
      if (input.addressLine.trim().length < 5)
        fields.addressLine = "Enter the estate, street or building.";
      if (!phone || Object.keys(fields).length > 0) {
        throw new AppError("VALIDATION_FAILED", undefined, { fields });
      }

      return mutateState((state) => {
        const user = signedInUser(state);
        const existing = id ? user.addresses.find((a) => a.id === id) : undefined;
        if (id && !existing) throw new AppError("NOT_FOUND");
        if (!existing && user.addresses.length >= MAX_ADDRESSES) {
          throw new AppError("VALIDATION_FAILED", `You can save up to ${MAX_ADDRESSES} addresses.`);
        }
        const makeDefault = isDefault === true || user.addresses.length === 0;
        if (makeDefault) for (const address of user.addresses) address.isDefault = false;
        const saved = {
          ...input,
          phone,
          directions: blankToNull(input.directions),
          id: existing?.id ?? `adr_${randomId()}`,
          isDefault: makeDefault || (existing?.isDefault ?? false),
        };
        user.addresses = existing
          ? user.addresses.map((a) => (a.id === saved.id ? saved : a))
          : [...user.addresses, saved];
        return structuredClone(saved);
      });
    },

    async deleteAddress(id) {
      await mockRequest();
      mutateState((state) => {
        const user = signedInUser(state);
        const removed = user.addresses.find((a) => a.id === id);
        if (!removed) throw new AppError("NOT_FOUND");
        user.addresses = user.addresses.filter((a) => a.id !== id);
        const first = user.addresses[0];
        if (removed.isDefault && first) first.isDefault = true; // always keep one default
      });
    },
  };
}
