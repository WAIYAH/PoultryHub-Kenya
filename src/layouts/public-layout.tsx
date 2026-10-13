import { Phone } from "lucide-react";
import { Outlet } from "react-router";

import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { FloatingWhatsApp } from "@/components/layout/floating-whatsapp";
import { OfflineBanner } from "@/components/layout/offline-banner";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipLink } from "@/components/layout/skip-link";
import { WhatsAppIcon } from "@/components/shared/brand-icons";
import { DemoModeBanner } from "@/components/shared/demo-mode-banner";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import { buttonVariants } from "@/components/ui/button";
import { IS_DEMO } from "@/config/demo";
import { footerNav, mainNav, quoteLink, site } from "@/config/site";
import { acceptedPaymentsSentence } from "@/domain/payment-methods";
import { formatKenyanMobile } from "@/domain/phone";
import { CartDrawerHost, CartLink } from "@/features/cart";
import { useSiteSettings, useWhatsappHref } from "@/features/content";

export default function PublicLayout() {
  const settings = useSiteSettings();
  const whatsappHref = useWhatsappHref();

  return (
    <>
      <SkipLink />
      <OfflineBanner />
      {IS_DEMO ? <DemoModeBanner /> : null}
      {settings.announcement ? (
        <AnnouncementBar id={settings.announcement.id} message={settings.announcement.message} />
      ) : null}
      <SiteHeader
        nav={mainNav}
        quote={quoteLink}
        actions={<CartLink />}
        mobileExtras={
          <>
            <WhatsAppLink href={whatsappHref} className={buttonVariants({ variant: "outline" })}>
              <WhatsAppIcon className="size-5" /> Chat on WhatsApp
            </WhatsAppLink>
            {settings.phone ? (
              <a href={`tel:${settings.phone}`} className={buttonVariants({ variant: "ghost" })}>
                <Phone aria-hidden="true" /> Call {formatKenyanMobile(settings.phone)}
              </a>
            ) : null}
          </>
        }
      />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <SiteFooter
        columns={Object.values(footerNav)}
        contact={{
          phone: settings.phone,
          email: settings.email,
          location: settings.location,
          whatsappHref,
        }}
        hours={settings.businessHours}
        socialLinks={settings.socialLinks}
        paymentNote={acceptedPaymentsSentence(settings.payments)}
        businessName={settings.businessName}
        description={site.description}
      />
      <FloatingWhatsApp href={whatsappHref} />
      <CartDrawerHost />
    </>
  );
}
