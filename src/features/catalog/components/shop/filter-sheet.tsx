import type { RefObject } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { FilterPanel } from "./filter-panel";

/** Mobile filter sheet (DESIGN_SYSTEM.md §10.2). Loaded the first time it is opened. */
export default function FilterSheet({
  open,
  onOpenChange,
  resultCount,
  returnFocusRef,
  ...panel
}: Parameters<typeof FilterPanel>[0] & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resultCount: number | null;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}) {
  const close = () => onOpenChange(false);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="flex w-[min(22rem,100vw)] flex-col gap-0 bg-white p-0"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef.current?.focus();
        }}
      >
        <SheetHeader className="border-b border-line px-5 py-4">
          <SheetTitle className="text-h3">Filters</SheetTitle>
          <SheetDescription className="sr-only">
            Narrow the products by category, availability and price.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <FilterPanel {...panel} onNavigate={close} />
        </div>
        <SheetFooter className="border-t border-line px-5 py-4">
          <Button onClick={close} className="w-full">
            {resultCount === null
              ? "Show products"
              : `Show ${resultCount} ${resultCount === 1 ? "product" : "products"}`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
