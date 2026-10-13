import { deliveryAreas, deliveryZones, pickupLocations } from "@/mocks/fixtures/delivery";

import type { DeliveryService } from "../contracts";

import { mockRequest } from "./latency";

export function createMockDeliveryService(): DeliveryService {
  return {
    async listZones() {
      await mockRequest();
      return structuredClone(deliveryZones);
    },
    async listAreas() {
      await mockRequest();
      return structuredClone(deliveryAreas);
    },
    async listPickupLocations() {
      await mockRequest();
      return structuredClone(pickupLocations);
    },
  };
}
