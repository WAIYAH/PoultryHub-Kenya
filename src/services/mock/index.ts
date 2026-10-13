import type { Services } from "../contracts";

import { createMockCatalogService } from "./catalog";

export function createMockServices(): Services {
  return { catalog: createMockCatalogService() };
}
