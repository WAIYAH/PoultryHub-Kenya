import type { SVGProps } from "react";

// Brand glyphs from Simple Icons v16.35.0 (CC0-1.0). Lucide has no brand icons. Use each mark
// within its owner's brand guidelines (DESIGN_SYSTEM.md §7).

type BrandIconProps = SVGProps<SVGSVGElement> & { title?: string };

export function createBrandIcon(path: string, displayName: string) {
  function BrandIcon({ title, ...props }: BrandIconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        role={title ? "img" : undefined}
        aria-hidden={title ? undefined : true}
        focusable="false"
        {...props}
      >
        {title ? <title>{title}</title> : null}
        <path d={path} />
      </svg>
    );
  }
  BrandIcon.displayName = displayName;
  return BrandIcon;
}
