import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { formatKES } from "@/domain/money";
import { AreaSelector, deliveryQueries, etaText } from "@/features/delivery";
import type { CartQuote, QuoteIssue } from "@/types/domain";

/**
 * Delivery fee estimate on the cart page (CART-05): choose a county and area to see the fee and
 * delivery days for that zone; until then the fee is "calculated at checkout".
 */
export function DeliveryEstimate({
  areaId,
  onAreaChange,
  quote,
}: {
  areaId: string | null;
  onAreaChange: (areaId: string | null) => void;
  quote: CartQuote | undefined;
}) {
  const areas = useQuery(deliveryQueries.areas());
  const selected = areas.data?.find((area) => area.id === areaId);
  const [county, setCounty] = useState<string | null>(null);
  const currentCounty = county ?? selected?.county ?? "";
  const minimum = quote?.issues.find(
    (issue): issue is Extract<QuoteIssue, { code: "BELOW_MINIMUM_ORDER" }> =>
      issue.code === "BELOW_MINIMUM_ORDER",
  );
  const notServed = quote?.issues.some((issue) => issue.code === "AREA_NOT_SERVED");

  return (
    <section aria-labelledby="estimate-heading" className="flex flex-col gap-3">
      <h2 id="estimate-heading" className="text-sm font-bold text-ink-900">
        Estimate delivery
      </h2>
      {areas.data ? (
        <AreaSelector
          areas={areas.data}
          county={currentCounty}
          areaId={areaId ?? ""}
          onCountyChange={setCounty}
          onAreaChange={(id) => onAreaChange(id || null)}
        />
      ) : areas.isError ? (
        <p className="text-sm text-ink-700">
          Delivery areas couldn't load. You can choose at checkout.
        </p>
      ) : (
        <Skeleton className="h-11 w-full" />
      )}
      {quote?.delivery ? (
        <p className="text-sm text-ink-700" aria-live="polite">
          {quote.delivery.zoneName}: {quote.delivery.schedule}, usually {etaText(quote.delivery)}.
        </p>
      ) : null}
      {minimum ? (
        <p className="text-sm text-warning-fg">
          Delivery to this area needs a minimum order of {formatKES(minimum.minimumMinor)}. Add
          more, or choose pick-up at checkout.
        </p>
      ) : null}
      {notServed ? (
        <p className="text-sm text-danger">
          We don't deliver to this area any more. Choose another area or pick-up.
        </p>
      ) : null}
    </section>
  );
}
