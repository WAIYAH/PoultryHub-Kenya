import {
  CalendarDays,
  Clock,
  Egg,
  Handshake,
  Heart,
  Leaf,
  MessageCircle,
  Package,
  Scale,
  ShieldCheck,
  Smartphone,
  Sprout,
  Sun,
  Tag,
  Truck,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { ContentIcon as ContentIconKey } from "@/types/domain";

// Editable content refers to icons by key (types/domain.ts ContentIcon), never by component.
const ICONS: Record<ContentIconKey, LucideIcon> = {
  smartphone: Smartphone,
  truck: Truck,
  message: MessageCircle,
  tag: Tag,
  egg: Egg,
  leaf: Leaf,
  shield: ShieldCheck,
  clock: Clock,
  sun: Sun,
  scale: Scale,
  sprout: Sprout,
  handshake: Handshake,
  calendar: CalendarDays,
  package: Package,
  heart: Heart,
};

export function ContentIcon({ name, className }: { name: ContentIconKey; className?: string }) {
  const Icon = ICONS[name];
  return <Icon aria-hidden="true" className={className} strokeWidth={1.75} />;
}

/** Icon in a tinted circle (DESIGN_SYSTEM.md §7): 40/48 px, forest on light, white/10 on dark. */
export function IconCircle({
  name,
  size = "md",
  tone = "light",
}: {
  name: ContentIconKey;
  size?: "sm" | "md";
  tone?: "light" | "dark";
}) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full",
        size === "sm" ? "size-10" : "size-12",
        tone === "dark" ? "bg-white/10 text-forest-300" : "bg-forest-100 text-forest-800",
      )}
    >
      <ContentIcon name={name} className={size === "sm" ? "size-5" : "size-6"} />
    </span>
  );
}
