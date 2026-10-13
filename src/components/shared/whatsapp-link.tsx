import type { ComponentProps, ReactNode } from "react";

/**
 * Opens WhatsApp in a new tab. Renders nothing without a link, so nothing appears until the
 * business has configured a number (see `businessWhatsappUrl` in src/domain/whatsapp.ts).
 */
export function WhatsAppLink({
  href,
  children,
  ...props
}: Omit<ComponentProps<"a">, "href" | "target" | "rel"> & {
  href: string | null;
  children: ReactNode;
}) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
      <span className="sr-only"> (opens WhatsApp)</span>
    </a>
  );
}
