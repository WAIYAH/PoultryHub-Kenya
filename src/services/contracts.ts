// The seam between UI and data (ARCHITECTURE.md §7.1). Pages and features depend only on these
// interfaces; mock (Phase 2) and Supabase (Phase 3+) implementations are interchangeable.
// Order, payment, content, delivery, account, auth and contact contracts are added in Phase 2.
import type { Category, Page, ProductDetail, ProductQuery, ProductSummary } from "@/types/domain";

export interface CatalogService {
  listCategories(): Promise<Category[]>;
  listProducts(query?: ProductQuery): Promise<Page<ProductSummary>>;
  getProduct(slug: string): Promise<ProductDetail | null>;
  listRelated(productId: string, limit?: number): Promise<ProductSummary[]>;
}

export interface Services {
  catalog: CatalogService;
}
