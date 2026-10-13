import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

import { Container } from "@/components/shared/container";
import { FaqList } from "@/components/shared/faq-list";
import { Section } from "@/components/shared/section";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import type { Faq } from "@/types/domain";

/** Home-flagged FAQs + a link to the full FAQ page (SITE-02, CNT-04). */
export function HomeFaqs({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) return null;
  return (
    <Section tone="mint">
      <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionHeading
          eyebrow="Questions"
          title="Good to know before you order"
          lead="Delivery, payments, minimum orders and more."
          action={
            <Button asChild variant="link" className="mt-2">
              <Link to="/faq">
                All FAQs <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          }
          className="md:flex-col md:items-start md:justify-start"
        />
        <FaqList faqs={faqs} />
      </Container>
    </Section>
  );
}
