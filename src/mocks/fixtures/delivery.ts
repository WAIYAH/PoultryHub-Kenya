// SAMPLE DATA: delivery zones, areas and pick-up points are illustrative until the business
// supplies its real delivery rules (REQUIREMENTS.md §10, item 5). Fees are whole shillings (BR-02).
import type { DeliveryArea, DeliveryZone, PickupLocation } from "@/types/domain";

export const deliveryZones: DeliveryZone[] = [
  {
    id: "zone-thika-road",
    name: "Thika Road corridor",
    feeMinor: 20_000,
    freeOverMinor: 300_000,
    minOrderMinor: null,
    etaMinDays: 1,
    etaMaxDays: 2,
    schedule: "Monday to Saturday",
  },
  {
    id: "zone-nairobi",
    name: "Nairobi",
    feeMinor: 35_000,
    freeOverMinor: 500_000,
    minOrderMinor: 100_000,
    etaMinDays: 1,
    etaMaxDays: 3,
    schedule: "Tuesdays, Thursdays and Saturdays",
  },
  {
    id: "zone-south-east",
    name: "Machakos and Kajiado",
    feeMinor: 50_000,
    freeOverMinor: null,
    minOrderMinor: 200_000,
    etaMinDays: 2,
    etaMaxDays: 4,
    schedule: "Saturdays",
  },
];

const area = (id: string, zoneId: string, county: string, name: string): DeliveryArea => ({
  id,
  zoneId,
  county,
  name,
});

export const deliveryAreas: DeliveryArea[] = [
  area("area-ruiru", "zone-thika-road", "Kiambu", "Ruiru"),
  area("area-juja", "zone-thika-road", "Kiambu", "Juja"),
  area("area-thika", "zone-thika-road", "Kiambu", "Thika town"),
  area("area-kiambu-town", "zone-thika-road", "Kiambu", "Kiambu town"),
  area("area-kasarani", "zone-thika-road", "Nairobi", "Kasarani"),
  area("area-roysambu", "zone-thika-road", "Nairobi", "Roysambu"),
  area("area-kahawa-west", "zone-thika-road", "Nairobi", "Kahawa West"),
  area("area-westlands", "zone-nairobi", "Nairobi", "Westlands"),
  area("area-kilimani", "zone-nairobi", "Nairobi", "Kilimani"),
  area("area-embakasi", "zone-nairobi", "Nairobi", "Embakasi"),
  area("area-karen", "zone-nairobi", "Nairobi", "Karen"),
  area("area-south-b", "zone-nairobi", "Nairobi", "South B"),
  area("area-eastleigh", "zone-nairobi", "Nairobi", "Eastleigh"),
  area("area-athi-river", "zone-south-east", "Machakos", "Athi River"),
  area("area-syokimau", "zone-south-east", "Machakos", "Syokimau"),
  area("area-kitengela", "zone-south-east", "Kajiado", "Kitengela"),
  area("area-rongai", "zone-south-east", "Kajiado", "Ongata Rongai"),
];

export const pickupLocations: PickupLocation[] = [
  {
    id: "pickup-farm",
    name: "Farm gate",
    county: "Kiambu",
    town: "Ruiru",
    addressLine: "Sample address: off the Ruiru–Kiambu road",
    directions: "Sample directions: turn at the signboard and follow the farm road for 1 km.",
    openingHours: [
      { days: "Monday to Saturday", hours: "8:00 am – 5:00 pm" },
      { days: "Sunday", hours: "Closed" },
    ],
    mapUrl: null,
  },
  {
    id: "pickup-thika",
    name: "Thika town collection point",
    county: "Kiambu",
    town: "Thika",
    addressLine: "Sample address: Thika town centre",
    directions: "Sample directions: next to the main matatu stage.",
    openingHours: [{ days: "Tuesday and Friday", hours: "10:00 am – 4:00 pm" }],
    mapUrl: null,
  },
];
