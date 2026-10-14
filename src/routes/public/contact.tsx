import { ContactView } from "@/features/content/components/contact-view";
import { pageMeta } from "@/lib/seo";

import type { Route } from "./+types/contact";

// Contact (CNT-01, CNT-02): pre-rendered; contact details come from the root loader's settings.

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Contact us",
    description:
      "Call, WhatsApp or send us a message about orders, bulk quotes, farm visits or anything else.",
    path: "/contact",
  });

export default function ContactRoute() {
  return <ContactView />;
}
