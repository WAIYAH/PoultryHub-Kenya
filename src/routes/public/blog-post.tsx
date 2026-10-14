import { Link, data, isRouteErrorResponse } from "react-router";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { BlogPostView } from "@/features/content/components/blog-post-view";
import { site } from "@/config/site";
import { markdownToBlocks, type MdBlock } from "@/lib/markdown";
import { absoluteUrl, breadcrumbJsonLd, pageMeta } from "@/lib/seo";
import { getServices } from "@/services";

import type { Route } from "./+types/blog-post";

// Blog article (CNT-03): pre-rendered for every published post, with the Markdown converted at
// build time. Posts published after the build load through the SPA fallback; only then does the
// browser load the Markdown parser, on demand (NFR-PERF-3).

async function loadPost(slug: string, toBlocks: (markdown: string) => MdBlock[]) {
  const { content } = getServices();
  const post = await content.getPost(slug);
  if (!post) throw data(null, { status: 404, statusText: "Article not found" });
  const related = await content.listRelatedPosts(slug, 3);
  const { bodyMarkdown, ...rest } = post;
  return { post: rest, blocks: toBlocks(bodyMarkdown), related };
}

export async function loader({ params }: Route.LoaderArgs) {
  return loadPost(params.postSlug, markdownToBlocks);
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const markdown = await import("@/lib/markdown");
  return loadPost(params.postSlug, markdown.markdownToBlocks);
}

export const meta: Route.MetaFunction = ({ loaderData, location }) => {
  if (!loaderData) {
    return pageMeta({
      title: "Article not found",
      description: "This article is not available.",
      path: location.pathname,
      noindex: true,
    });
  }
  const { post } = loaderData;
  const path = `/blog/${post.slug}`;
  // Link previews need a JPEG (WhatsApp handles WebP poorly); otherwise the site image is used.
  const image = post.coverImage?.jpegSrc
    ? { url: post.coverImage.jpegSrc, alt: post.coverImage.alt }
    : undefined;
  return pageMeta({
    title: post.title,
    description: post.excerpt,
    path,
    type: "article",
    image,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt,
        datePublished: post.publishedAt,
        author: { "@type": "Organization", name: post.authorName },
        publisher: { "@type": "Organization", name: site.name },
        mainEntityOfPage: absoluteUrl(path),
        ...(image ? { image: absoluteUrl(image.url) } : {}),
      },
      breadcrumbJsonLd(
        [{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: post.title }],
        path,
      ),
    ],
  });
};

export default function BlogPostRoute({ loaderData }: Route.ComponentProps) {
  return <BlogPostView {...loaderData} />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <Container className="flex flex-col items-center gap-5 py-20 text-center">
      <h1 className="text-h1 text-ink-900">
        {notFound ? "Article not found" : "We couldn't load this article"}
      </h1>
      <p className="max-w-lg text-lead text-ink-600">
        {notFound
          ? "It may have been moved or taken down. Browse the blog for more guides."
          : "Please check your connection and try again."}
      </p>
      <Button asChild>
        <Link to="/blog">Browse the blog</Link>
      </Button>
    </Container>
  );
}
