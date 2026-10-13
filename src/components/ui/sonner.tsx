import { Toaster as Sonner, type ToasterProps } from "sonner";

// Written by hand instead of `shadcn add sonner`, which depends on next-themes (not used here:
// the site is light-only). Toasts announce politely and never carry the only copy of an error.
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      position="bottom-center"
      closeButton
      toastOptions={{
        classNames: {
          toast: "rounded-lg border border-line bg-white text-ink-900 shadow-overlay font-sans",
          description: "text-ink-600",
          actionButton: "bg-primary text-primary-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
