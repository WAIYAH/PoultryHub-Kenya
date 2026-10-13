import { normalizeKenyanMobile } from "@/domain/phone";
import { AppError } from "@/lib/errors";
import { randomId } from "@/lib/ids";
import { blankToNull } from "@/lib/text";

import type { ContactService } from "../contracts";

import { mockRequest } from "./latency";
import { mutateState } from "./state";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mirrors the `storefront/contact` checks (CNT-01; DATABASE.md §4.8 contact_messages). */
export function createMockContactService(): ContactService {
  return {
    async submit(input) {
      await mockRequest();
      const fields: Record<string, string> = {};
      if (input.name.trim().length < 2) fields.name = "Enter your name.";
      const phone = input.phone?.trim() ? normalizeKenyanMobile(input.phone) : null;
      const email = blankToNull(input.email);
      if (input.phone?.trim() && !phone) fields.phone = "Enter a Kenyan mobile number.";
      if (email && !EMAIL.test(email)) fields.email = "Enter a valid email address.";
      if (!phone && !email) fields.phone = "Give a phone number or an email so we can reply.";
      const length = input.message.trim().length;
      if (length < 10 || length > 2_000) fields.message = "Write between 10 and 2,000 characters.";
      if (Object.keys(fields).length > 0) {
        throw new AppError("VALIDATION_FAILED", undefined, { fields });
      }

      mutateState((state) => {
        state.contactMessages.push({
          ...input,
          phone,
          email,
          id: randomId(),
          createdAt: new Date().toISOString(),
        });
      });
    },
  };
}
