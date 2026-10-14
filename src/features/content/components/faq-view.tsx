import { Link } from "react-router";

import { Container } from "@/components/shared/container";
import { FaqList } from "@/components/shared/faq-list";
import { PageHeader } from "@/components/shared/page-header";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import { buttonVariants } from "@/components/ui/button";
import type { Faq, FaqTopic } from "@/types/domain";

import { useWhatsappHref } from "../hooks";

export const FAQ_TOPICS: { topic: FaqTopic; title: string }[] = [
  { topic: "ordering", title: "Ordering" },
  { topic: "delivery", title: "Delivery and pick-up" },
  { topic: "payments", title: "Payments" },
  { topic: "products", title: "Products" },
  { topic: "wholesale", title: "Bulk and wholesale" },
  { topic: "farm", title: "Our farm" },
];

/** FAQ page (CNT-04): questions grouped by topic, with jump links to each group. */
export function FaqView({ faqs }: { faqs: Faq[] }) {
  const whatsappHref = useWhatsappHref();
  const groups = FAQ_TOPICS.map((group) => ({
    ...group,
    faqs: faqs.filter((faq) => faq.topic === group.topic),
  })).filter((group) => group.faqs.length > 0);

  return (
    <>
      <PageHeader
        title="Frequently asked questions"
        description="Answers about ordering, delivery, payments and our products."
        crumbs={[{ label: "Home", href: "/" }, { label: "FAQs" }]}
      >
        {groups.length > 1 ? (
          <nav aria-label="FAQ topics">
            <ul className="flex flex-wrap gap-2">
              {groups.map((group) => (
                <li key={group.topic}>
                  <a
                    href={`#faq-${group.topic}`}
                    className="inline-flex min-h-10 items-center rounded-full border border-forest-200 bg-white px-4 text-sm font-semibold text-forest-900 hover:bg-forest-100"
                  >
                    {group.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </PageHeader>
      <Container className="flex max-w-3xl flex-col gap-12 py-10 sm:py-14">
        {groups.length === 0 ? (
          <p className="text-ink-700">No questions have been published yet.</p>
        ) : (
          groups.map((group) => (
            <section
              key={group.topic}
              id={`faq-${group.topic}`}
              aria-labelledby={`faq-${group.topic}-heading`}
              className="flex scroll-mt-24 flex-col gap-4"
            >
              <h2 id={`faq-${group.topic}-heading`} className="text-h2 text-ink-900">
                {group.title}
              </h2>
              <FaqList faqs={group.faqs} />
            </section>
          ))
        )}
        <section
          aria-labelledby="faq-more"
          className="flex flex-col gap-3 rounded-lg bg-forest-50 p-6"
        >
          <h2 id="faq-more" className="text-h3 text-ink-900">
            Didn't find your answer?
          </h2>
          <p className="text-ink-700">Ask us directly. We usually reply within working hours.</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/contact" className={buttonVariants()}>
              Contact us
            </Link>
            <WhatsAppLink href={whatsappHref} className={buttonVariants({ variant: "outline" })}>
              <WhatsAppIcon className="size-5" /> Chat on WhatsApp
            </WhatsAppLink>
          </div>
        </section>
      </Container>
    </>
  );
}
