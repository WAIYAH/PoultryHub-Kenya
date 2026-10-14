import { BLOG_PAGE_SIZE } from "@/features/content/queries";
import { BlogIndexView } from "@/features/content/components/blog-index-view";
import { revalidateOnPathChange } from "@/lib/revalidate";
import { pageMeta } from "@/lib/seo";
import { getServices } from "@/services";

import type { Route } from "./+types/blog";

// Blog index (CNT-03): the first unfiltered page is pre-rendered; tag and page filters live in
// the URL and load in the browser, so they don't re-run this loader.

export async function loader() {
  const { content } = getServices();
  const [initialPage, all] = await Promise.all([
    content.listPosts({ page: 1, pageSize: BLOG_PAGE_SIZE }),
    content.listPosts({ page: 1, pageSize: 100 }),
  ]);
  const tags = [...new Set(all.items.flatMap((post) => post.tags))].sort((a, b) =>
    a.localeCompare(b, "en-KE"),
  );
  return { initialPage, tags, loadedAt: Date.now() };
}

export const shouldRevalidate = revalidateOnPathChange;

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Blog",
    description:
      "Practical poultry guides: brooding day-old chicks, feeding layers, storing eggs and more.",
    path: "/blog",
  });

export default function BlogRoute({ loaderData }: Route.ComponentProps) {
  return <BlogIndexView {...loaderData} />;
}
