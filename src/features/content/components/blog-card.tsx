import { Link } from "react-router";

import { ResponsiveImage, imageProps } from "@/components/shared/responsive-image";
import { formatDate } from "@/domain/dates";
import type { BlogPostSummary } from "@/types/domain";

export const BLOG_CARD_SIZES = "(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw";

/** An article in a list (DESIGN_SYSTEM.md §9.2 BlogCard). The whole card opens the article. */
export function BlogCard({
  post,
  headingLevel = 2,
  priority = false,
}: {
  post: BlogPostSummary;
  headingLevel?: 2 | 3;
  priority?: boolean;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article
      data-testid="blog-card"
      className="group relative flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-card transition-shadow duration-200 hover:shadow-raised has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring has-[a:focus-visible]:ring-offset-2"
    >
      <ResponsiveImage
        {...imageProps(post.coverImage, post.title, { width: 1280, height: 720 })}
        alt=""
        sizes={BLOG_CARD_SIZES}
        priority={priority}
        className="aspect-[16/9] transition-transform duration-500 ease-out-soft group-hover:scale-[1.02]"
      />
      <div className="flex flex-1 flex-col gap-2 p-5">
        {post.tags.length > 0 ? (
          <p className="text-eyebrow text-forest-800">{post.tags.join(" · ")}</p>
        ) : null}
        <Heading className="text-lg leading-snug font-bold text-ink-900">
          <Link
            to={`/blog/${post.slug}`}
            prefetch="intent"
            className="outline-none after:absolute after:inset-0 after:content-['']"
          >
            {post.title}
          </Link>
        </Heading>
        <p className="line-clamp-3 text-sm text-ink-700">{post.excerpt}</p>
        <p className="mt-auto pt-2 text-sm text-ink-600">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time> ·{" "}
          {post.readingMinutes} min read
        </p>
      </div>
    </article>
  );
}
