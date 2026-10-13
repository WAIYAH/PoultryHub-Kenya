import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Suspense, lazy } from "react";
import { Link } from "react-router";

import { WhatsAppIcon } from "@/components/shared/brand-icons";
import { Container } from "@/components/shared/container";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import type { NavLink } from "@/config/site";
import { formatKenyanMobile } from "@/domain/phone";
import type { BusinessHours, SocialLink } from "@/types/domain";

interface FooterColumn {
  title: string;
  links: NavLink[];
}

const SocialLinks = lazy(() => import("./social-links"));

export interface FooterContact {
  phone: string | null;
  email: string | null;
  location: string | null;
  whatsappHref: string | null;
}

/**
 * Site footer (SITE-07): navigation, categories, policies, contact details, hours, accepted payment
 * methods (as text) and real social links only. Each detail renders only once it is configured.
 */
export function SiteFooter({
  columns,
  contact,
  hours,
  socialLinks,
  paymentNote,
  businessName,
  description,
}: {
  columns: FooterColumn[];
  contact: FooterContact;
  hours: BusinessHours[];
  socialLinks: SocialLink[];
  paymentNote: string | null;
  businessName: string;
  description: string;
}) {
  const hasContact = Boolean(
    contact.phone ?? contact.whatsappHref ?? contact.email ?? contact.location,
  );

  return (
    <footer data-surface="dark" className="bg-forest-950 text-forest-200">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 sm:py-16 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
        <div className="flex flex-col gap-5 sm:col-span-2 lg:col-span-1">
          <p className="text-lg font-extrabold text-white">{businessName}</p>
          <p className="max-w-xs text-sm leading-relaxed">{description}</p>
          {hasContact ? (
            <ul className="flex flex-col gap-2 text-sm">
              {contact.phone ? (
                <li>
                  <a
                    href={`tel:${contact.phone}`}
                    className="inline-flex min-h-6 items-center gap-2 hover:text-white"
                  >
                    <Phone aria-hidden="true" className="size-4" />
                    {formatKenyanMobile(contact.phone)}
                  </a>
                </li>
              ) : null}
              {contact.whatsappHref ? (
                <li>
                  <WhatsAppLink
                    href={contact.whatsappHref}
                    className="inline-flex min-h-6 items-center gap-2 hover:text-white"
                  >
                    <WhatsAppIcon className="size-4" /> WhatsApp us
                  </WhatsAppLink>
                </li>
              ) : null}
              {contact.email ? (
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="inline-flex min-h-6 items-center gap-2 hover:text-white"
                  >
                    <Mail aria-hidden="true" className="size-4" /> {contact.email}
                  </a>
                </li>
              ) : null}
              {contact.location ? (
                <li className="inline-flex items-center gap-2">
                  <MapPin aria-hidden="true" className="size-4" /> {contact.location}
                </li>
              ) : null}
            </ul>
          ) : null}
          {hours.length > 0 ? (
            <div className="flex gap-2 text-sm">
              <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <dl className="flex flex-col gap-1.5">
                {hours.map((entry) => (
                  <div key={entry.days}>
                    <dt className="text-forest-200">{entry.days}</dt>
                    <dd className="font-semibold text-white">{entry.hours}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
          {socialLinks.length > 0 ? (
            <Suspense fallback={null}>
              <SocialLinks links={socialLinks} />
            </Suspense>
          ) : null}
        </div>

        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="mb-3 text-sm font-bold text-white">{column.title}</p>
            <ul className="flex flex-col gap-1 text-sm">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="inline-flex min-h-8 items-center hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {businessName}. All rights reserved.
          </p>
          <p>{paymentNote ? `${paymentNote} ` : ""}Prices in Kenya shillings (KSh).</p>
        </Container>
      </div>
    </footer>
  );
}
