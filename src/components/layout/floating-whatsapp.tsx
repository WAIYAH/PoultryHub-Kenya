import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";

/**
 * Floating WhatsApp button (SITE-04). Not rendered in the checkout or admin layouts. Sits above any
 * sticky bottom bar: such bars set `--sticky-bar-height` on <html> while they are shown.
 */
export function FloatingWhatsApp({ href }: { href: string | null }) {
  return (
    <WhatsAppLink
      href={href}
      aria-label="Chat with us on WhatsApp (opens in a new tab)"
      data-testid="floating-whatsapp"
      className="fixed right-4 bottom-[calc(1rem+var(--sticky-bar-height,0px)+env(safe-area-inset-bottom))] z-30 grid size-14 place-items-center rounded-full bg-forest-900 text-white shadow-raised transition-[transform,background-color,bottom] duration-200 hover:scale-105 hover:bg-forest-950 sm:right-6 sm:bottom-[calc(1.5rem+var(--sticky-bar-height,0px))]"
    >
      <WhatsAppIcon className="size-7" />
    </WhatsAppLink>
  );
}
