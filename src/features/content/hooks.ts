import { useRouteLoaderData } from "react-router";

import { IS_DEMO } from "@/config/demo";
import { businessWhatsappUrl, whatsappMessages } from "@/domain/whatsapp";
import type { SiteSettings } from "@/types/domain";

import type { loader as rootLoader } from "../../root";

/** Site settings loaded once by the root route (contact details, hours, payment options). */
export function useSiteSettings(): SiteSettings {
  const data = useRouteLoaderData<typeof rootLoader>("root");
  if (!data) throw new Error("Site settings are only available inside the root route.");
  return data.settings;
}

/** A WhatsApp link to the business with a prefilled message, or null when none is configured. */
export function useWhatsappHref(message?: string): string | null {
  const settings = useSiteSettings();
  return businessWhatsappUrl(
    settings.whatsappPhone,
    message ?? whatsappMessages.general(settings.businessName),
    IS_DEMO,
  );
}
