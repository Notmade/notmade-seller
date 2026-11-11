// A fake backend for the browser tests. It answers only the routes in docs/seller-api.md, in their
// documented shapes; anything else is a 404, as it would be in production.
import type { Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Real GET /seller/bulk/template responses from the backend test harness, renamed onto this backend's categories
const BULK = JSON.parse(readFileSync(join(__dirname, "..", "test", "fixtures", "bulk-templates.json"), "utf8"));
type BulkCat = { id: string; name: string; slug: string; uses_sizes?: boolean };
function bulkTemplate(country: Country, cat: BulkCat) {
  const kind = cat.uses_sizes ? (country === "AE" ? "ae_hoodies" : "in_hoodies") : cat.slug === "laptops" && country === "AE" ? "ae_laptops" : "in_home_decor";
  const base = BULK[kind];
  const t = JSON.parse(JSON.stringify(base).split(base.category.name).join(cat.name).split(base.category.id).join(cat.id));
  if (country === "AE" && kind === "in_home_decor") Object.assign(t, { country: "AE", currency: "AED", columns: JSON.parse(JSON.stringify(t.columns).split("INR").join("AED")) });
  return { ...t, category: { id: cat.id, name: cat.name, slug: cat.slug } };
}
/** A small stand-in for POST /seller/bulk/validate: the category lock, sizes, price and photos. */
export function bulkValidate(country: Country, cat: BulkCat, rows: Record<string, string | number>[]) {
  const t = bulkTemplate(country, cat);
  const results = rows.map((r) => {
    const errors: { field: string; code: string; message: string }[] = [];
    const add = (field: string, code: string, message: string) => errors.push({ field, code, message });
    if (String(r.category) !== cat.name) add("category", "CATEGORY_MISMATCH", `Category "${r.category}" is not ${cat.name}. This file is for ${cat.name} only`);
    if (t.uses_sizes && !r.size) add("size", "SIZE_REQUIRED", `Size is required for ${cat.name}`);
    if (!t.uses_sizes && r.size) add("size", "SIZE_NOT_ALLOWED", `${cat.name} has no sizes. Remove the size`);
    if (r.price !== "" && r.price !== undefined && !(Number(r.price) > 0)) add("price", "PRICE_RANGE", `Price must be above 0 and up to 1,000,000 ${t.currency}`);
    if (r.price !== "" && r.price !== undefined && !String(r.image_files ?? "")) add("image_files", "PHOTO_REQUIRED", "Name at least one photo file");
    return { line: Number(r.line), group: t.uses_sizes ? String(r.variant_group || "") || null : null, ok: !errors.length, errors };
  });
  const groups = new Map<string, number[]>();
  rows.forEach((r, i) => { const k = t.uses_sizes ? String(r.variant_group) : String(i); groups.set(k, [...(groups.get(k) ?? []), i]); });
  const products = Array.from(groups, ([key, idx]) => {
    const ok = idx.every((i) => results[i].ok);
    if (!ok) idx.forEach((i) => { if (results[i].ok) Object.assign(results[i], { ok: false, errors: [{ field: "variant_group", code: "GROUP_INVALID", message: `Another row of ${key} has an error` }] }); });
    const first = rows[idx[0]];
    return { key: t.uses_sizes ? key : null, lines: idx.map((i) => Number(rows[i].line)), name: String(first.name || "") || null, variants: t.uses_sizes ? idx.length : 0, image_files: String(first.image_files || "").split("|").filter(Boolean), ok };
  });
  const valid = results.filter((r) => r.ok).length;
  return { category: t.category, currency: t.currency, rows: results, products, summary: { rows: rows.length, valid_rows: valid, invalid_rows: rows.length - valid, products: products.length, valid_products: products.filter((p) => p.ok).length } };
}

export type Country = "IN" | "AE";
const iso = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();

export function seller(country: Country) {
  const ae = country === "AE";
  return {
    id: `seller-${country}`, email: "test@brand.example", legal_name: "Test Brand", business_name: "Test Brand", brand_name: "Test Brand", contact_name: "Test Person",
    phone: ae ? "501234567" : "9876543210", address_line: "1 Test Street", city: ae ? "Ajman" : "Noida", state: null, pincode: ae ? null : "201301", gst_registered: !ae, gstin: ae ? null : "09AAAAA0000A1Z5",
    pan_number: null, aadhaar_last4: null, pricing_model: "seller_controlled", commission_rate: 17, uae_commission_rate: null, onboarding_status: "approved", agreement_signed_at: iso(-30), logo_url: null,
    created_at: iso(-30), seller_country: country, country, currency: ae ? "AED" : "INR", iban: ae ? "AE070331234567890123456" : undefined,
  };
}

const item = (over = {}) => ({
  product_id: "p1", product_name: "A very long handmade block printed cotton kurta with mirror work", product_image: null, image: null, size: "M", label: "M", quantity: 2, unit_price: 999, line_total: 1998,
  variant_id: null, option_values: {}, market_unit_price: 99, market_currency: "AED", fulfilment_mode: null as string | null, ...over,
});

export function order(country: Country, ref: string, bucket: string, over = {}) {
  const currency = country === "AE" ? "AED" : "INR";
  return {
    ref_no: ref, status: bucket === "new" ? "confirmed" : bucket, payment_method: "cod", created_at: iso(-1), customer_name: "Test Shopper", city: "Noida", pincode: "201301", region: country === "AE" ? "ae" : "in",
    items: [item()], seller_subtotal: 1998, order_total: 1998, multi_seller: false, seller_status: bucket === "new" ? "awaiting" : "accepted", seller_accepted_at: null, seller_rejected_at: null, seller_reject_reason: null, cancel_reason: null,
    bucket, stage: bucket === "new" ? "placed" : "accepted",
    timeline: ["placed", "accepted", "ready", "awb", "picked_up", "in_transit", "delivered"].map((key, i) => ({ key, label: key, done: i < 2, current: i === 1, at: i < 2 ? iso(-1) : null })),
    sla_due_at: iso(1), ready_at: null as string | null, package_weight_kg: null, waybill: null as string | null, courier: null as string | null, courier_status: null, pickup_status: null, awb_generated_at: null, label_available: false,
    commission: { type: "flat", label: "Commission", pct: 17, currency, gross: 1998, commission: 339.66, payout: 1658.34, snapshot: true }, settlement_days: 7, settlement_date: null, has_unboxing_video: false, unboxing_video_status: null,
    ...over,
  };
}

const product = (id: string, over = {}) => ({
  id, name: "Hand-loomed cotton scarf with a rather long title for small screens", description: "Soft and warm.", category: "Scarves", category_id: "c1", sizes: [], stock: 4, price_inr: 1299, original_price_inr: 1599, price_aed: 99, original_price_aed: null,
  images: [], is_live: false, approval_status: "approved", rejection_reason: null, submitted_at: iso(-3), reviewed_at: iso(-2), created_at: iso(-4), product_variants: [], ...over,
});

export function backend(country: Country) {
  const currency = country === "AE" ? "AED" : "INR";
  const orders = [
    order(country, "NM-1001", "new"), order(country, "NM-1002", "accepted"),
    order(country, "NM-1003", "accepted", { items: [item({ fulfilment_mode: "seller_ships" })] }),
    order(country, "NM-1004", "ready", { ready_at: iso(0) }), order(country, "NM-1005", "shipped", { waybill: "AWB12345678", courier: "Delhivery" }),
    order(country, "NM-1006", "delivered"), order(country, "NM-1007", "cancelled", { cancel_reason: "Out of stock" }),
  ];
  const money = (n: number) => ({ [currency]: n });
  return {
    orders,
    created: [] as string[],
    products: [product("p1", { is_live: true }), product("p2", { approval_status: "pending" }), product("p3", { approval_status: "rejected", rejection_reason: "Photo is too small" })],
    categories: [
      { id: "11111111-1111-4111-8111-111111111111", name: "Kurtas", slug: "kurtas" }, { id: "22222222-2222-4222-8222-222222222222", name: "Mobile phones", slug: "mobiles", fulfilment_mode_applies: country === "AE" },
      { id: "33333333-3333-4333-8333-333333333333", name: "Handmade", slug: "handmade" },
    ],
    // Live production categories: HOODIES takes sizes (migration 078), HOME DECOR and LAPTOPS do not
    bulkCategories: [
      { id: "44444444-4444-4444-8444-444444444441", name: "HOODIES", slug: "hoodies", group: "Fashion", uses_sizes: true, size_set: "apparel" },
      { id: "44444444-4444-4444-8444-444444444442", name: "HOME DECOR", slug: "home-decor", group: null, uses_sizes: false, size_set: null },
      { id: "44444444-4444-4444-8444-444444444443", name: "LAPTOPS", slug: "laptops", group: null, uses_sizes: false, size_set: null },
    ],
    bulkCreated: [] as string[],
    dashboard: {
      country, currency, today: { orders: 1, payout: money(1658), revenue: money(1998) }, pending_accept: { count: 1, overdue: 0, next_due_at: iso(1) }, ready_for_pickup: { count: 1, awaiting_awb: 1, awb_generated: 0 },
      counts: { new: 1, accepted: 2, ready: 1, shipped: 1, delivered: 1, cancelled: 1, returns: 0 }, low_stock: { count: 1, threshold: 3, items: [{ product_id: "p1", name: "Scarf", variant: null, stock: 1, image: null }] },
      earnings: { today: money(1658), month: money(12000), delivered_lifetime: money(52000) }, next_settlement: { date: iso(3), amount: money(1658), source: "estimate" }, settlement_days: 7, returns: { open: 0 },
      products: { total: 3, live: 1, pending: 1, rejected: 1 }, sla_hours: 24, recent_orders: orders.slice(0, 3),
    },
    payouts: {
      payouts: [
        { id: "po1", amount: 12000, commission: 2460, currency, status: "paid", due_date: iso(-5), paid_at: iso(-5), reference: "UTR-LONG-REFERENCE-998877", invoice_url: null, created_at: iso(-7) },
        { id: "po2", amount: 8000, commission: 1640, currency, status: "pending", due_date: iso(4), paid_at: null, reference: null, invoice_url: null, created_at: iso(-1) },
      ],
      upcoming: [{ ref_no: "NM-1006", settlement_date: iso(2), currency, gross: 1998, commission: 339.66, commission_pct: 17, payout: 1658.34 }],
      totals: { paid: money(12000), scheduled: money(8000), upcoming: money(1658) }, settlement_days: 7, bank_details_complete: true, payout_blocked: false,
    },
  };
}

export type Backend = ReturnType<typeof backend>;

/** Signs the browser in and serves the fake backend. */
export async function signIn(page: Page, country: Country, be: Backend = backend(country), sellerOver = {}) {
  await page.context().addCookies([{ name: "nm_seller", value: "1", url: "http://localhost:3100" }]);
  await page.addInitScript(() => localStorage.setItem("nm_seller_token", "test-token"));
  const me = { ...seller(country), ...sellerOver };
  const currency = country === "AE" ? "AED" : "INR";
  await page.route(/railway\.app\/(seller|seller-auth)\//, async (route) => {
    const req = route.request();
    const path = new URL(req.url()).pathname;
    const json = (body: unknown, status = 200) => route.fulfill({ status, contentType: "application/json", headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" }, body: JSON.stringify(body) });
    if (req.method() === "OPTIONS") return json({});
    const ref = path.match(/^\/seller\/orders\/([^/]+)/)?.[1];
    if (req.method() === "GET") {
      if (path === "/seller/me") return json({ seller: me, rate_card: {}, uae: { seller_country: country, ready: true, required_agreement_version: "v2", signed_agreement_version: "v2", signed_at: iso(-30), commission_pct: null }, agreement: { seller_country: country, required_version: "v2", required_open: true, signed_version: "v2", signed_at: iso(-30), resign_required: false }, commission: { pricing: "seller_controlled", india_pct: country === "IN" ? 17 : null } });
      if (path === "/seller/dashboard") return json(be.dashboard);
      if (path === "/seller/orders") return json({ orders: be.orders, counts: be.dashboard.counts, sla_hours: 24 });
      if (ref && path.endsWith(ref)) return json({ order: be.orders.find((o) => o.ref_no === ref) });
      if (path === "/seller/returns") return json({ returns: [] });
      if (path === "/seller/products") return json({ products: be.products });
      if (path === "/seller/categories") return json({ categories: be.categories });
      if (path === "/seller/bulk/categories") return json({ categories: be.bulkCategories });
      if (path === "/seller/bulk/template") {
        const cat = be.bulkCategories.find((c) => c.id === new URL(req.url()).searchParams.get("category_id"));
        return cat ? json(bulkTemplate(country, cat)) : json({ error: "This category is not one you can list in", code: "CATEGORY_NOT_ALLOWED" }, 400);
      }
      if (path === "/seller/payouts") return json(be.payouts);
      if (path === "/seller/notifications") return json({ notifications: [{ id: "n1", type: "new_order", urgent: false, title: "New order NM-1001", body: "Accept it soon", href: "/dashboard/orders?tab=new&ref=NM-1001", at: iso(0), read: false }], unread_count: 1 });
      if (path === "/seller/inventory") return json({ country, currency, low_stock_threshold: 3, summary: { skus: 1, low_stock: 1, out_of_stock: 0 }, items: [{ product_id: "p1", variant_id: null, name: "Scarf", variant: null, image: null, category: "Scarves", is_live: true, approval_status: "approved", stock: 1, low_stock: true, out_of_stock: false }] });
      if (path === "/seller/analytics") return json({ country, currency, days: 30, totals: { orders: 1, units: 2, revenue: 1000, cancelled: 0, average_order_value: 1000 }, series: [], top_products: [] });
      if (path === "/seller/delivery-timeline") return json({ rules: { ncr_express: { enabled: false, hours: 3, window_start: "9", window_end: "18" }, pan_india: { min_days: 3, max_days: 5 }, uae: { min_days: 3, max_days: 5 }, sla_hours: { accept: 24, ready: 24, pickup: 24 } }, summary: { open: 0, delayed: 0, due_today: 0 }, orders: [] });
      if (path === "/seller/agreement") return json({ version: "v2", title: "Agreement", text: "x", html: "<p>Agreement text</p>", plain_text: "x", agreement_hash: "h", pricing_model: "seller_controlled", commission_rate: 17, includes_uae_clause: false, signed: true });
      if (path === "/seller/agreements/signed") return json({ agreements: [] });
      if (path === "/seller/documents") return json({ documents: [] });
      if (path === "/seller/bank-details") return json({ country, complete: true, bank: country === "AE" ? { account_holder_name: "Test Brand", bank_name: null, iban: "AE07 •••• •••• 3456" } : { account_holder_name: "Test Brand", bank_name: "HDFC", account_number: "•••• 9012", ifsc: "HDFC0001234" } });
    }
    if (req.method() === "POST") {
      if (path === "/seller/products") { be.created.push(req.postData() ?? ""); return json({ product: product(`new-${be.created.length}`, { approval_status: "pending" }) }, 201); }
      if (path === "/seller/notifications/read") return json({ seen_at: iso(0) });
      if (path === "/seller/bulk/validate") {
        const body = JSON.parse(req.postData() ?? "{}");
        const cat = be.bulkCategories.find((c) => c.id === body.category_id)!;
        return json(bulkValidate(country, cat, body.rows));
      }
      if (path === "/seller/bulk/products") { be.bulkCreated.push(req.postData() ?? ""); return json({ product: product(`bulk-${be.bulkCreated.length}`, { approval_status: "pending" }), lines: [], key: null }, 201); }
      const o = be.orders.find((x) => x.ref_no === ref);
      if (o && path.endsWith("/accept")) { Object.assign(o, { bucket: "accepted", seller_status: "accepted" }); return json({ order: o }); }
      if (o && path.endsWith("/ready")) { Object.assign(o, { bucket: "ready", ready_at: iso(0) }); return json({ order: o }); }
      if (o && path.endsWith("/ship")) {
        if (!o.items.every((i) => i.fulfilment_mode === "seller_ships")) return json({ code: "NOTMADE_SHIPS", error: "NOTMADE ships this order." }, 409);
        Object.assign(o, { bucket: "shipped", courier: "Aramex" }); return json({ order: o });
      }
    }
    return route.fulfill({ status: 404, contentType: "text/html", body: `<pre>Cannot ${req.method()} ${path}</pre>` });
  });
}
