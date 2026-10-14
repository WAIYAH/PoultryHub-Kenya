import { FaqView } from "@/features/content/components/faq-view";
import { pageMeta } from "@/lib/seo";
import { getServices } from "@/services";

import type { Route } from "./+types/faq";

// FAQ (CNT-04): pre-rendered; answers stay readable without JavaScript (native <details>).

export async function loader() {
  return { faqs: await getServices().content.listFaqs() };
}

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "FAQs",
    description: "Answers about ordering, delivery, payments, products and bulk supply.",
    path: "/faq",
  });

export default function FaqRoute({ loaderData }: Route.ComponentProps) {
  return <FaqView faqs={loaderData.faqs} />;
}
