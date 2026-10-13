// Toast notifications, loaded on demand so the toast library never sits in a page's initial
// bundle (NFR-PERF-3). The <Toaster /> itself mounts after hydration in root.tsx. Toasts are
// polite announcements only; critical errors must also appear inline (DESIGN_SYSTEM.md §9.1).

export function notifySuccess(message: string): void {
  void import("sonner").then(({ toast }) => toast.success(message));
}

export function notifyError(message: string): void {
  void import("sonner").then(({ toast }) => toast.error(message));
}
