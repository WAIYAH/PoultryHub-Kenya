import { describe, expect, it } from "vitest";

import { whatsappMessages, whatsappUrl } from "./whatsapp";

describe("whatsappUrl", () => {
  it("strips the plus sign from the number", () => {
    expect(whatsappUrl("+254712345678")).toBe("https://wa.me/254712345678");
  });

  it("URL-encodes the message", () => {
    expect(whatsappUrl("+254712345678", "Order PH001234 & eggs?")).toBe(
      "https://wa.me/254712345678?text=Order%20PH001234%20%26%20eggs%3F",
    );
  });
});

describe("whatsappMessages", () => {
  it("builds a product enquiry with the variant and link", () => {
    expect(
      whatsappMessages.productEnquiry({
        businessName: "PoultryHub Kenya",
        productName: "Kienyeji eggs",
        variantName: "Tray of 30",
        url: "https://example.com/products/kienyeji-eggs",
      }),
    ).toBe(
      "Hello PoultryHub Kenya, I'm interested in Kienyeji eggs (Tray of 30). https://example.com/products/kienyeji-eggs",
    );
  });

  it("references the order number for order help", () => {
    expect(whatsappMessages.orderHelp("PH001234")).toContain("PH001234");
  });
});
