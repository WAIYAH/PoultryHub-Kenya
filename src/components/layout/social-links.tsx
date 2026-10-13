import type { ComponentType } from "react";

import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  XIcon,
  YouTubeIcon,
} from "@/components/shared/brand-icons";
import type { SocialLink, SocialPlatform } from "@/types/domain";

const SOCIAL: Record<
  SocialPlatform,
  { label: string; Icon: ComponentType<{ className?: string }> }
> = {
  facebook: { label: "Facebook", Icon: FacebookIcon },
  instagram: { label: "Instagram", Icon: InstagramIcon },
  tiktok: { label: "TikTok", Icon: TikTokIcon },
  youtube: { label: "YouTube", Icon: YouTubeIcon },
  x: { label: "X", Icon: XIcon },
};

/**
 * The business's real social profiles (SITE-07). Loaded only when at least one is configured, so
 * the brand icons stay out of every page's initial JavaScript until then.
 */
export default function SocialLinks({ links }: { links: SocialLink[] }) {
  return (
    <ul className="flex gap-1" aria-label="Social media">
      {links.map(({ platform, url }) => {
        const { label, Icon } = SOCIAL[platform];
        return (
          <li key={platform}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${label} (opens in a new tab)`}
              className="grid size-11 place-items-center rounded-full hover:bg-white/10 hover:text-white"
            >
              <Icon className="size-5" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
