import { Fragment, type ReactNode } from "react";
import { Link } from "react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

import { Container } from "./container";

export interface Crumb {
  label: string;
  href?: string;
}

/** Page title block with breadcrumbs. One per page; renders the page's only h1. */
export function PageHeader({
  title,
  description,
  crumbs = [],
  children,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  crumbs?: Crumb[];
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-b border-line bg-forest-50 py-10 sm:py-14", className)}>
      <Container className="flex flex-col gap-4">
        {crumbs.length > 0 ? (
          <Breadcrumb>
            <BreadcrumbList>
              {crumbs.map((crumb, index) => (
                <Fragment key={`${crumb.label}-${index}`}>
                  {index > 0 ? <BreadcrumbSeparator /> : null}
                  <BreadcrumbItem>
                    {crumb.href ? (
                      <BreadcrumbLink asChild>
                        <Link to={crumb.href}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        ) : null}
        <h1 className="text-h1 text-ink-900">{title}</h1>
        {description ? <p className="max-w-2xl text-lead text-ink-600">{description}</p> : null}
        {children}
      </Container>
    </div>
  );
}
