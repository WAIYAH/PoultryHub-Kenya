// WhatsApp deep links (API_AND_INTEGRATIONS.md §11). No WhatsApp API is used, only wa.me links.

/** +254712345678 + message → https://wa.me/254712345678?text=… */
export function whatsappUrl(e164: string, message?: string): string {
  const number = e164.replace(/^\+/, "");
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * The link for a configured business number. Until the business supplies one, demo builds fall
 * back to WhatsApp's share link (the visitor picks a chat), so the buttons can be reviewed without
 * ever messaging a made-up number; real builds hide WhatsApp entirely (BR-31).
 */
export function businessWhatsappUrl(
  e164: string | null,
  message: string,
  allowShareFallback: boolean,
): string | null {
  if (e164) return whatsappUrl(e164, message);
  return allowShareFallback ? `https://wa.me/?text=${encodeURIComponent(message)}` : null;
}

export const whatsappMessages = {
  general: (businessName: string) => `Hello ${businessName}, I have a question.`,
  productEnquiry: (input: {
    businessName: string;
    productName: string;
    variantName?: string;
    url: string;
  }) =>
    `Hello ${input.businessName}, I'm interested in ${input.productName}${
      input.variantName ? ` (${input.variantName})` : ""
    }. ${input.url}`,
  orderHelp: (orderNumber: string) => `Hello, I need help with order ${orderNumber}.`,
  wholesale: (businessName: string) =>
    `Hello ${businessName}, I'd like a quote for a bulk or regular supply order.`,
  areaNotListed: (businessName: string, area: string) =>
    `Hello ${businessName}, do you deliver to ${area}?`,
};
