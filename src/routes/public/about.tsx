import { AboutView } from "@/features/content/components/about-view";
import { pageMeta } from "@/lib/seo";
import { getServices } from "@/services";

import type { Route } from "./+types/about";

// About (SITE-05): pre-rendered; client navigation reads the pre-rendered data file.

export async function loader() {
  return { about: await getServices().content.getAbout() };
}

export const meta: Route.MetaFunction = ({ loaderData }) =>
  pageMeta({
    title: "About us",
    description: loaderData?.about.intro.lead ?? "Our story, how we farm and what we stand for.",
    path: "/about",
    image: loaderData?.about.intro.image
      ? {
          url: loaderData.about.intro.image.jpegSrc ?? loaderData.about.intro.image.src,
          alt: loaderData.about.intro.image.alt,
        }
      : undefined,
  });

export default function AboutRoute({ loaderData }: Route.ComponentProps) {
  return <AboutView about={loaderData.about} />;
}
