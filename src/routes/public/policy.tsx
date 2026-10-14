import { data } from "react-router";

import { PolicyView } from "@/features/content/components/policy-view";
import { markdownToBlocks } from "@/lib/markdown";
import { pageMeta } from "@/lib/seo";
import { getServices } from "@/services";
import type { PolicySlug } from "@/types/domain";

import type { Route } from "./+types/policy";

// Policy pages (SITE-09): one module for all four, each pre-rendered. The loader runs only at
// build time, so the Markdown is converted there and the parser never reaches the browser; client
// navigation reads the pre-rendered data file.

const SLUGS: readonly PolicySlug[] = ["privacy", "terms", "delivery-and-returns", "payments"];

export async function loader({ request }: Route.LoaderArgs) {
  // Pre-rendering asks for both /policies/privacy and its data file, /policies/privacy.data.
  const slug = new URL(request.url).pathname
    .replace(/\.data$/, "")
    .split("/")
    .filter(Boolean)
    .at(-1);
  const policy = SLUGS.includes(slug as PolicySlug)
    ? await getServices().content.getPolicy(slug as PolicySlug)
    : null;
  if (!policy) throw data(null, { status: 404, statusText: "Policy not found" });
  const { bodyMarkdown, ...rest } = policy;
  return { policy: rest, blocks: markdownToBlocks(bodyMarkdown) };
}

export const meta: Route.MetaFunction = ({ loaderData, location }) =>
  pageMeta({
    title: loaderData?.policy.title ?? "Policy",
    description: loaderData?.policy.summary ?? "PoultryHub Kenya policies.",
    path: location.pathname,
  });

export default function PolicyRoute({ loaderData }: Route.ComponentProps) {
  return <PolicyView policy={loaderData.policy} blocks={loaderData.blocks} />;
}
