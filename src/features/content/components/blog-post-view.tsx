import { Share2 } from "lucide-react";
import { Link } from "react-router";

import { Container } from "@/components/shared/container";
import { Prose } from "@/components/shared/prose";
import { ResponsiveImage, imageProps } from "@/components/shared/responsive-image";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { formatDate } from "@/domain/dates";
import type { MdBlock } from "@/lib/markdown";
import { absoluteUrl } from "@/lib/seo";
import type { BlogPost, BlogPostSummary } from "@/types/domain";

import { BlogCard } from "./blog-card";

/**
 * A blog article (CNT-03): cover image, reading time, the text, its tags, a WhatsApp share link
 * and related articles.
 */
export function BlogPostView({
  post,
  blocks,
  related,
}: {
  post: Omit<BlogPost, "bodyMarkdown">;
  blocks: MdBlock[];
  related: BlogPostSummary[];
}) {
  // WhatsApp's own share link: the reader picks who to send it to.
  const shareHref = `https://wa.me/?text=${encodeURIComponent(
    `${post.title} ${absoluteUrl(`/blog/${post.slug}`)}`,
  )}`;

  return (
    <>
      <article>
        <Container className="flex max-w-3xl flex-col gap-6 pt-6 pb-10 sm:pb-14">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/blog">Blog</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1">{post.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <header className="flex flex-col gap-3">
            <h1 className="text-h1 text-ink-900">{post.title}</h1>
            <p className="text-sm text-ink-600">
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time> ·{" "}
              {post.readingMinutes} min read · {post.authorName}
            </p>
          </header>

          {post.coverImage ? (
            <ResponsiveImage
              {...imageProps(post.coverImage, "", { width: 1280, height: 720 })}
              alt={post.coverImage.alt}
              sizes="(min-width: 768px) 720px, 100vw"
              priority
              className="aspect-[16/9] rounded-xl shadow-card"
            />
          ) : null}

          <Prose blocks={blocks} className="max-w-none" />

          <footer className="flex flex-col gap-4 border-t border-line pt-6">
            {post.tags.length > 0 ? (
              <ul className="flex flex-wrap gap-2" aria-label="Topics">
                {post.tags.map((tag) => (
                  <li key={tag}>
                    <Link
                      to={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="inline-flex min-h-9 items-center rounded-full bg-forest-50 px-3 text-sm font-semibold text-forest-900 capitalize hover:bg-forest-100"
                    >
                      {tag}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
            <a
              href={shareHref}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline", size: "sm", className: "w-fit" })}
            >
              <Share2 aria-hidden="true" /> Share on WhatsApp
              <span className="sr-only"> (opens WhatsApp)</span>
            </a>
          </footer>
        </Container>
      </article>

      {related.length > 0 ? (
        <section aria-labelledby="related-articles" className="bg-forest-50 py-12 sm:py-16">
          <Container className="flex flex-col gap-8">
            <h2 id="related-articles" className="text-h2 text-ink-900">
              More articles
            </h2>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <BlogCard post={item} headingLevel={3} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}
    </>
  );
}
