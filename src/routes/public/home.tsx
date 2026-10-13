import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Suspense, lazy } from "react";
import { Link } from "react-router";

import { Container } from "@/components/shared/container";
import { Section } from "@/components/shared/section";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { FEATURED_QUERY, ProductGrid, catalogQueries } from "@/features/catalog";
import { HomeSections, useWhatsappHref } from "@/features/content";
import { getQueryClient } from "@/lib/query-client";
import { organizationJsonLd, pageMeta } from "@/lib/seo";
import { getServices } from "@/services";

import type { Route } from "./+types/home";

// Testimonials appear only once consented ones are published (BR-31), so their carousel loads on
// demand rather than sitting in the home page's initial JavaScript.
const TestimonialCarousel = lazy(() =>
  import("@/components/shared/testimonial-carousel").then((m) => ({
    default: m.TestimonialCarousel,
  })),
);

// Home (SITE-02, DESIGN_SYSTEM.md §10.1). Content comes from the build-time loader; prices and
// stock (categories' "From" prices, featured products) are revalidated in the browser.

async function loadHome() {
  const { content, delivery } = getServices();
  const queryClient = getQueryClient();
  const [home, categories, featured, faqs, testimonials, zones] = await Promise.all([
    content.getHome(),
    queryClient.ensureQueryData(catalogQueries.categories()),
    queryClient.ensureQueryData(catalogQueries.products(FEATURED_QUERY)),
    content.listFaqs({ homeOnly: true }),
    content.listTestimonials(),
    delivery.listZones(),
  ]);
  return { home, categories, featured, faqs, testimonials, zones, loadedAt: Date.now() };
}

export const loader = loadHome;
export const clientLoader = loadHome;

export const meta: Route.MetaFunction = ({ matches }) => {
  const settings = matches[0].loaderData?.settings;
  return pageMeta({
    title: site.name,
    description: site.description,
    path: "/",
    jsonLd: settings ? organizationJsonLd(settings) : undefined,
  });
};

export default function Home({ loaderData }: Route.ComponentProps) {
  const { home, faqs, testimonials, zones, loadedAt } = loaderData;
  const whatsappHref = useWhatsappHref();
  // Pre-rendered prices are a starting point only: refetch them once the page is live (§4).
  const { data: categories } = useQuery({
    ...catalogQueries.categories(),
    initialData: loaderData.categories,
    initialDataUpdatedAt: loadedAt,
  });
  const { data: featured } = useQuery({
    ...catalogQueries.products(FEATURED_QUERY),
    initialData: loaderData.featured,
    initialDataUpdatedAt: loadedAt,
  });

  return (
    <HomeSections
      home={home}
      categories={categories}
      faqs={faqs}
      zones={zones}
      whatsappHref={whatsappHref}
      featuredSlot={
        featured.items.length > 0 ? (
          <Section>
            <Container className="flex flex-col gap-10">
              <SectionHeading
                eyebrow="Featured"
                title="Popular this week"
                lead="Prices are per unit shown. Minimum orders apply to chicks and pullets."
                action={
                  <Button asChild variant="link">
                    <Link to="/shop">
                      View all products <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                }
              />
              <ProductGrid products={featured.items} showFeaturedBadge={false} />
            </Container>
          </Section>
        ) : null
      }
      testimonialsSlot={
        testimonials.length > 0 ? (
          <Section tone="mint">
            <Container className="flex flex-col gap-10">
              <SectionHeading eyebrow="Customers" title="What customers say" />
              <Suspense fallback={null}>
                <TestimonialCarousel testimonials={testimonials} />
              </Suspense>
            </Container>
          </Section>
        ) : null
      }
    />
  );
}
