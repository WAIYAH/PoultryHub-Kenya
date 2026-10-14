import { FileText } from "lucide-react";
import { Link, NavLink } from "react-router";

import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { Prose } from "@/components/shared/prose";
import { footerNav } from "@/config/site";
import { formatDate } from "@/domain/dates";
import type { MdBlock } from "@/lib/markdown";
import { cn } from "@/lib/utils";
import type { PolicyPage } from "@/types/domain";

/**
 * A policy page (SITE-09, BR-32): its review status, the text, and links to the other policies.
 * Templates show they are drafts for legal review until an advocate has reviewed them.
 */
export function PolicyView({
  policy,
  blocks,
}: {
  policy: Omit<PolicyPage, "bodyMarkdown">;
  blocks: MdBlock[];
}) {
  return (
    <>
      <PageHeader
        title={policy.title}
        description={policy.summary}
        crumbs={[{ label: "Home", href: "/" }, { label: policy.title }]}
      >
        <p className="flex items-center gap-2 text-sm text-ink-600" data-testid="policy-review">
          <FileText aria-hidden="true" className="size-4" />
          {policy.lastReviewedAt ? (
            <>
              Last reviewed{" "}
              <time dateTime={policy.lastReviewedAt}>{formatDate(policy.lastReviewedAt)}</time>
            </>
          ) : (
            "Template: not yet reviewed by an advocate"
          )}
        </p>
      </PageHeader>
      <Container className="grid grid-cols-1 gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <Prose blocks={blocks} />
        <nav aria-label="Other policies" className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 text-sm font-bold text-ink-900">Policies</p>
          <ul className="flex flex-col gap-1">
            {footerNav.policies.links.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex min-h-10 items-center rounded-md px-3 text-sm font-medium text-ink-700 hover:bg-forest-50",
                      isActive && "bg-forest-100 font-semibold text-forest-900",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-ink-700">
            Questions about these policies?{" "}
            <Link
              to="/contact"
              className="font-semibold text-forest-700 underline-offset-4 hover:underline"
            >
              Contact us
            </Link>
            .
          </p>
        </nav>
      </Container>
    </>
  );
}
