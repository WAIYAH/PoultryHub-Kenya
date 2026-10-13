import {
  ArrowRight,
  Bird,
  Egg,
  Feather,
  MessageCircle,
  Smartphone,
  Tag,
  Truck,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router";

import { Container } from "@/components/shared/container";
import { PlaceholderNotice } from "@/components/shared/placeholder-notice";
import { Reveal } from "@/components/shared/reveal";
import { Section } from "@/components/shared/section";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { pageMeta } from "@/lib/seo";

import type { Route } from "./+types/home";

// Phase 1 home: the hero and category entry points on real design tokens. The full page
// (DESIGN_SYSTEM.md §10.1), driven by admin-editable content, is built in Phase 2.

export const meta: Route.MetaFunction = () =>
  pageMeta({ title: site.name, description: site.description, path: "/" });

interface Tile {
  title: string;
  text: string;
  icon: LucideIcon;
}

// How the service works (planned features, PLAN.md D5), not claims about the farm (BR-31).
const serviceFacts: Tile[] = [
  { title: "Pay with M-Pesa", text: "Or pay on delivery or at pick-up.", icon: Smartphone },
  { title: "Delivery or pick-up", text: "To served areas, or collect at the farm.", icon: Truck },
  { title: "Help on WhatsApp", text: "Ask about products and orders.", icon: MessageCircle },
  { title: "Clear prices", text: "In KSh, per tray, chick or bag.", icon: Tag },
];

const categories: (Tile & { href: string; cta: string })[] = [
  {
    title: "Eggs",
    text: "Fresh table eggs, sold by the tray.",
    icon: Egg,
    href: "/shop/eggs",
    cta: "Shop eggs",
  },
  {
    title: "Day-old chicks",
    text: "From scheduled batches, with minimum orders.",
    icon: Bird,
    href: "/shop/day-old-chicks",
    cta: "Shop chicks",
  },
  {
    title: "Live birds",
    text: "Broilers and kienyeji birds, priced per bird.",
    icon: Feather,
    href: "/shop/live-birds",
    cta: "Shop birds",
  },
  {
    title: "Feeds & supplies",
    text: "Feeds, feeders and drinkers.",
    icon: Wheat,
    href: "/shop/feeds-and-supplies",
    cta: "Shop supplies",
  },
];

function HeroArt() {
  return (
    <svg
      viewBox="0 0 400 360"
      aria-hidden="true"
      focusable="false"
      className="h-auto w-full max-w-md"
    >
      <circle cx="285" cy="95" r="72" fill="#facc15" opacity="0.16" />
      <ellipse cx="205" cy="300" rx="160" ry="24" fill="#022c22" opacity="0.5" />
      <path
        d="M138 158c-29 0-47 46-47 81 0 32 21 53 47 53s47-21 47-53c0-35-18-81-47-81Z"
        fill="#f3e6d8"
      />
      <path
        d="M236 116c-37 0-60 56-60 97 0 40 27 67 60 67s60-27 60-67c0-41-23-97-60-97Z"
        fill="#faf8f1"
      />
      <path
        d="M305 186c-25 0-39 33-39 60 0 25 17 42 39 42s39-17 39-42c0-27-14-60-39-60Z"
        fill="#e2c49c"
      />
      <path d="M236 226c0-17 9.5-29 23.5-32.5 0 15.6-9.4 28.3-23.5 32.5Z" fill="#facc15" />
      <path d="M236 226c-12-3-20.5-13.3-20.5-26.4 12 2.3 20.5 12 20.5 26.4Z" fill="#047857" />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <section className="px-4 pt-4 sm:px-6 lg:px-8">
        <div
          data-surface="dark"
          className="relative mx-auto max-w-[1200px] overflow-hidden rounded-xl bg-forest-900 bg-[radial-gradient(circle_at_85%_15%,rgb(250_204_21/0.12),transparent_45%),radial-gradient(circle_at_10%_90%,rgb(4_120_87/0.45),transparent_50%)] text-white"
        >
          <div className="grid items-center gap-10 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:px-14 lg:py-20">
            <div className="flex flex-col gap-6">
              <ul
                className="flex animate-rise-in flex-wrap gap-2 text-eyebrow"
                aria-label="What we sell"
              >
                {["Fresh eggs", "Healthy birds", "Farm supplies"].map((chip) => (
                  <li
                    key={chip}
                    className="rounded-full border border-white/25 px-3 py-1 text-forest-200"
                  >
                    {chip}
                  </li>
                ))}
              </ul>
              <h1 className="animate-rise-in text-display [animation-delay:80ms]">
                Quality poultry, <span className="text-gold-400">straight from the farm</span>
              </h1>
              <p className="max-w-xl animate-rise-in text-lead text-forest-200 [animation-delay:160ms]">
                Order eggs, day-old chicks, live birds and farm supplies online. Pay with M-Pesa or
                on delivery, or pick up at the farm.
              </p>
              <div className="flex animate-rise-in flex-wrap gap-3 [animation-delay:240ms]">
                <Button asChild variant="accent" size="lg">
                  <Link to="/shop">
                    Shop now <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline-inverse" size="lg">
                  <Link to="/contact">Contact us</Link>
                </Button>
              </div>
            </div>
            <div className="hidden justify-center lg:flex">
              <HeroArt />
            </div>
          </div>
        </div>
      </section>

      <Container className="py-8 sm:py-10">
        <ul className="grid grid-cols-1 gap-4 rounded-lg bg-white p-5 shadow-card sm:grid-cols-2 lg:grid-cols-4 lg:p-6">
          {serviceFacts.map(({ title, text, icon: Icon }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-forest-100 text-forest-800">
                <Icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
              </span>
              <span className="flex flex-col">
                <span className="font-semibold text-ink-900">{title}</span>
                <span className="text-sm text-ink-600">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </Container>

      <Section tone="mint">
        <Container className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="Shop by category"
            title="Everything for your table and your farm"
            lead="From fresh eggs to day-old chicks and feeds, each with clear prices and minimum orders."
            action={
              <Button asChild variant="link">
                <Link to="/shop">
                  View all products <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            }
          />
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map(({ title, text, icon: Icon, href, cta }, index) => (
              <li key={href}>
                <Reveal delay={index * 60} className="h-full">
                  <Link
                    to={href}
                    className="group flex h-full flex-col gap-4 rounded-lg bg-white p-6 shadow-card transition-shadow hover:shadow-raised"
                  >
                    <span className="grid size-12 place-items-center rounded-full bg-forest-100 text-forest-800">
                      <Icon aria-hidden="true" className="size-6" strokeWidth={1.75} />
                    </span>
                    <span className="text-h3 text-ink-900">{title}</span>
                    <span className="flex-1 text-ink-600">{text}</span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700">
                      {cta}
                      <ArrowRight
                        aria-hidden="true"
                        className="size-4 transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section>
        <Container>
          <PlaceholderNotice
            phase={2}
            summary="The full home page is built in Phase 2: featured products, about the farm, fresh eggs, how we farm, how ordering works, FAQs and the bulk-order banner, all editable by the business."
          />
        </Container>
      </Section>
    </>
  );
}
