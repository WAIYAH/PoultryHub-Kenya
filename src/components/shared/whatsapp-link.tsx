import type { ComponentProps, ReactNode } from "react";

import { whatsappUrl } from "@/domain/whatsapp";

/** wa.me link that renders nothing until the business has configured a WhatsApp number. */
export function WhatsAppLink({
  phone,
  message,
  children,
  ...props
}: Omit<ComponentProps<"a">, "href" | "target" | "rel"> & {
  phone: string | null;
  message?: string;
  children: ReactNode;
}) {
  if (!phone) return null;
  return (
    <a href={whatsappUrl(phone, message)} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
      <span className="sr-only"> (opens WhatsApp)</span>
    </a>
  );
}
