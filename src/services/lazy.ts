// Loads a service implementation on its first call (NFR-PERF-3). Pages import a thin proxy, so
// fixtures, mock logic and (from Phase 3) supabase-js stay out of every page's initial JavaScript;
// pre-rendered pages hydrate from build-time data and only fetch when they revalidate.

type MethodNames<T> = { [K in keyof T]-?: true };

/**
 * Wraps a lazily imported service. `methods` must name every method of the contract, which the
 * mapped type enforces, so a new contract method can't be forgotten here.
 */
export function lazyService<T extends object>(load: () => Promise<T>, methods: MethodNames<T>): T {
  let loading: Promise<T> | undefined;
  const instance = () => (loading ??= load());
  const proxy: Record<string, unknown> = {};
  for (const name of Object.keys(methods)) {
    proxy[name] = async (...args: unknown[]) => {
      const service = await instance();
      const method = service[name as keyof T];
      if (typeof method !== "function") {
        throw new TypeError(`Service method "${name}" is not implemented by this data source.`);
      }
      return (method as (...a: unknown[]) => unknown).apply(service, args);
    };
  }
  return proxy as T;
}
