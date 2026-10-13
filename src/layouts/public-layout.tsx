import { Outlet } from "react-router";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipLink } from "@/components/layout/skip-link";
import { WhatsAppIcon } from "@/components/shared/brand-icons";
import { DemoModeBanner } from "@/components/shared/demo-mode-banner";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import { buttonVariants } from "@/components/ui/button";
import { businessContact, footerNav, mainNav, quoteLink, site } from "@/config/site";
import { whatsappMessages } from "@/domain/whatsapp";
import { CartLink } from "@/features/cart";

const isDemo = import.meta.env.VITE_DATA_SOURCE !== "supabase";

export default function PublicLayout() {
  return (
    <>
      <SkipLink />
      {isDemo ? <DemoModeBanner /> : null}
      <SiteHeader
        nav={mainNav}
        quote={quoteLink}
        actions={<CartLink />}
        mobileExtras={
          <WhatsAppLink
            phone={businessContact.whatsapp}
            message={whatsappMessages.general(site.name)}
            className={buttonVariants({ variant: "outline" })}
          >
            <WhatsAppIcon className="size-5" /> Chat on WhatsApp
          </WhatsAppLink>
        }
      />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <SiteFooter
        columns={Object.values(footerNav)}
        contact={businessContact}
        businessName={site.name}
        description={site.description}
      />
    </>
  );
}
