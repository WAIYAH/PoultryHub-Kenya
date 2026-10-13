import { deriveAvailability } from "@/domain/availability";
import { absoluteUrl } from "@/lib/seo";
import type { Availability, ProductDetail } from "@/types/domain";

// Product structured data (ARCHITECTURE.md §11): Product + one Offer per variant with real
// prices and availability. No ratings or reviews (NFR-SEO-1). Enquiry-only items carry no offer,
// because their price is only indicative.

const SCHEMA_AVAILABILITY: Record<Availability, string> = {
  in_stock: "https://schema.org/InStock",
  low_stock: "https://schema.org/LimitedAvailability",
  out_of_stock: "https://schema.org/OutOfStock",
  pre_order: "https://schema.org/PreOrder",
  enquiry: "https://schema.org/InStock",
};

export function productJsonLd(product: ProductDetail): Record<string, unknown> {
  const url = absoluteUrl(`/products/${product.slug}`);
  const image = product.image ? (product.image.jpegSrc ?? product.image.src) : null;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    category: product.category.name,
    url,
    ...(image ? { image: [absoluteUrl(image)] } : {}),
    ...(product.purchaseMode === "cart"
      ? {
          offers: product.variants.map((variant) => ({
            "@type": "Offer",
            name: variant.name,
            sku: variant.sku,
            price: (variant.priceMinor / 100).toFixed(2),
            priceCurrency: "KES",
            availability:
              SCHEMA_AVAILABILITY[
                deriveAvailability({ purchaseMode: "cart", variants: [variant] })
              ],
            url,
          })),
        }
      : {}),
  };
}
