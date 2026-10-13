import { useMutation } from "@tanstack/react-query";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/errors";
import { notifySuccess } from "@/lib/notify";
import { getServices } from "@/services";
import type { OrderRef } from "@/types/domain";

/** Cancel a pending order (ORD-02, BR-25), after a confirmation that names it. */
export function CancelOrderButton({
  orderRef,
  onCancelled,
}: {
  orderRef: OrderRef;
  onCancelled: () => void;
}) {
  const cancel = useMutation({
    mutationFn: () => getServices().orders.cancelPendingOrder(orderRef),
    onSuccess: () => {
      notifySuccess(`Order ${orderRef.orderNumber} cancelled`);
      onCancelled();
    },
    onError: () => onCancelled(), // the order may have moved on; show its current state
  });

  return (
    <div className="flex flex-col gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="w-fit">
            Cancel order
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel order {orderRef.orderNumber}?</AlertDialogTitle>
            <AlertDialogDescription>
              Your items go back on sale. If you've already paid, don't cancel: chat with us
              instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep my order</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => cancel.mutate()}>
              Cancel order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {cancel.isError ? (
        <p className="text-sm text-danger" role="alert">
          {errorMessage(cancel.error)}
        </p>
      ) : null}
    </div>
  );
}
