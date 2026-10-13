import {
  CalendarClock,
  CircleCheck,
  CircleSlash,
  MessageCircleQuestion,
  TriangleAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatShortDate } from "@/domain/dates";
import type { Availability } from "@/types/domain";

/** Availability badge (CAT-11). Always text + icon, never colour alone. */
export function StockBadge({
  availability,
  availableFrom,
  lowStockCount,
}: {
  availability: Availability;
  /** ISO date for pre-orders, shown as "Ready from Tue, 24 Oct". */
  availableFrom?: string | null;
  /** Exact count shown only when the business allows it (site_settings.show_low_stock_counts). */
  lowStockCount?: number | null;
}) {
  switch (availability) {
    case "in_stock":
      return (
        <Badge variant="success">
          <CircleCheck aria-hidden="true" /> In stock
        </Badge>
      );
    case "low_stock":
      return (
        <Badge variant="warning">
          <TriangleAlert aria-hidden="true" />{" "}
          {lowStockCount ? `Only ${lowStockCount} left` : "Low stock"}
        </Badge>
      );
    case "out_of_stock":
      return (
        <Badge variant="neutral">
          <CircleSlash aria-hidden="true" /> Out of stock
        </Badge>
      );
    case "pre_order":
      return (
        <Badge variant="info">
          <CalendarClock aria-hidden="true" />{" "}
          {availableFrom
            ? `Ready from ${formatShortDate(`${availableFrom}T09:00:00+03:00`)}`
            : "Pre-order"}
        </Badge>
      );
    case "enquiry":
      return (
        <Badge variant="outline">
          <MessageCircleQuestion aria-hidden="true" /> Enquire
        </Badge>
      );
  }
}
