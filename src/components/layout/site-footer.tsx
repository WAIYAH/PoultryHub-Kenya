import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router";

import { Container } from "@/components/shared/container";
import { WhatsAppIcon } from "@/components/shared/brand-icons";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import type { BusinessContact, NavLink } from "@/config/site";
import { formatKenyanMobile } from "@/domain/phone";

interface FooterColumn {
  title: string;
  links: NavLink[];
}

/** Site footer (SITE-07). Contact details render only once the business has supplied them. */
export function SiteFooter({
  columns,
  contact,
  businessName,
  description,
}: {
  columns: FooterColumn[];
  contact: BusinessContact;
  businessName: string;
  description: string;
}) {
  const hasContact = Boolean(
    contact.phone ?? contact.whatsapp ?? contact.email ?? contact.location,
  );

  return (
    <footer data-surface="dark" className="bg-forest-950 text-forest-200">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 sm:py-16 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
          <p className="text-lg font-extrabold text-white">{businessName}</p>
          <p className="max-w-xs text-sm leading-relaxed">{description}</p>
          {hasContact ? (
            <ul className="flex flex-col gap-2 text-sm">
              {contact.phone ? (
                <li>
                  <a
                    href={`tel:${contact.phone}`}
                    className="inline-flex items-center gap-2 hover:text-white"
                  >
                    <Phone aria-hidden="true" className="size-4" />{" "}
                    {formatKenyanMobile(contact.phone)}
                  </a>
                </li>
              ) : null}
              {contact.whatsapp ? (
                <li>
                  <WhatsAppLink
                    phone={contact.whatsapp}
                    className="inline-flex items-center gap-2 hover:text-white"
                  >
                    <WhatsAppIcon className="size-4" /> WhatsApp us
                  </WhatsAppLink>
                </li>
              ) : null}
              {contact.email ? (
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="inline-flex items-center gap-2 hover:text-white"
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
          ) : (
            <Link
              to="/contact"
              className="text-sm font-semibold text-gold-400 underline-offset-4 hover:underline"
            >
              Contact us
            </Link>
          )}
        </div>

        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="mb-3 text-sm font-bold text-white">{column.title}</p>
            <ul className="flex flex-col gap-2 text-sm">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="hover:text-white">
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
          <p>Prices in Kenya shillings (KSh).</p>
        </Container>
      </div>
    </footer>
  );
}
