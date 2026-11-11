// Panel features that need backend routes or columns that are not live yet. Each stays off, so
// sellers never fill in a form that cannot save, until NEXT_PUBLIC_SELLER_FEATURES (comma-separated,
// read at build time) names it. Turn one on only after its backend route is deployed: see "Backend
// gaps" in the README, because some routes planned on the backend differ from the ones called here.

export type BackendFeature =
  | "store_analytics"   // GET /seller/analytics returning { product_views, orders }
  | "sku";              // `sku` stored on products and variants

export function featureOn(feature: BackendFeature): boolean {
  // Written out in full here so Next can inline the value into the browser bundle
  const raw = process.env.NEXT_PUBLIC_SELLER_FEATURES ?? "";
  return raw.split(",").map((f) => f.trim()).includes(feature);
}
