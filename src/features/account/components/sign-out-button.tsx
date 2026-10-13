import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/errors";
import { notifySuccess } from "@/lib/notify";
import { getServices } from "@/services";

/**
 * Sign out (ACC-02) of this device, or of every device. The customer's data is dropped from the
 * cache straight away, so the next person on a shared phone sees none of it.
 */
export function SignOutButton({
  scope = "local",
  variant = "outline",
}: {
  scope?: "local" | "global";
  variant?: "outline" | "ghost";
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const signOut = useMutation({
    mutationFn: () => getServices().auth.signOut({ scope }),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: ["account"] });
      queryClient.removeQueries({ queryKey: ["orders"] });
      notifySuccess(scope === "global" ? "Signed out on all devices" : "Signed out");
      await navigate("/", { replace: true });
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant={variant}
        size="sm"
        className="w-fit"
        loading={signOut.isPending}
        onClick={() => signOut.mutate()}
      >
        <LogOut aria-hidden="true" />
        {scope === "global" ? "Sign out of all devices" : "Sign out"}
      </Button>
      {signOut.isError ? (
        <p className="text-sm text-danger" role="alert">
          {errorMessage(signOut.error)}
        </p>
      ) : null}
    </div>
  );
}
