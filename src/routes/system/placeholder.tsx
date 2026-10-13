import { useMatches, type MetaFunction } from "react-router";

import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { PlaceholderNotice } from "@/components/shared/placeholder-notice";
import { getPageInfo, type PageInfo } from "@/config/pages";
import { site } from "@/config/site";
import { pageMeta } from "@/lib/seo";

// Shared by every scaffolded-but-unbuilt route (each registered with its own id in routes.ts).
// Each page gets its own module when it's built; its registry entry is then removed.

const UNKNOWN: PageInfo = { title: "Page", summary: "This page is planned.", phase: 2 };

export const meta: MetaFunction = ({ matches, location }) => {
  const info = getPageInfo(matches.at(-1)?.id) ?? UNKNOWN;
  return pageMeta({
    title: info.title,
    description: info.summary || site.description,
    path: location.pathname,
    noindex: true,
  });
};

export default function PlaceholderRoute() {
  const id = useMatches().at(-1)?.id ?? "";
  const info = getPageInfo(id) ?? UNKNOWN;

  if (id.startsWith("admin-") || id.startsWith("account")) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-h1 text-ink-900">{info.title}</h1>
          <p className="text-lead text-ink-600">{info.summary}</p>
        </div>
        <PlaceholderNotice phase={info.phase} summary={info.summary} />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={info.title}
        description={info.summary}
        crumbs={[{ label: "Home", href: "/" }, { label: info.title }]}
      />
      <Container className="py-12">
        <PlaceholderNotice phase={info.phase} summary={info.summary} />
      </Container>
    </>
  );
}
