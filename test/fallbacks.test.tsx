// @vitest-environment jsdom
// Renders the real dashboard pages against a fake backend that serves only what backend `main`
// serves. Anything else answers like Express does in production: a 404 with an HTML body.
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DashboardData, Order, Product, Seller } from "@/app/lib/seller-api";
import { api, ApiError, isNotLive } from "@/app/lib/seller-api";
import { featureOn } from "@/app/lib/features";
import { LiveContext, SellerContext } from "@/app/dashboard/seller-context";
import OverviewPage from "@/app/dashboard/page";
import OrdersPage from "@/app/dashboard/orders/page";
import InventoryPage from "@/app/dashboard/inventory/page";
import AnalyticsPage from "@/app/dashboard/analytics/page";
import NotificationsPage from "@/app/dashboard/notifications/page";
import ProductsPage from "@/app/dashboard/products/page";
import DeliveryPage from "@/app/dashboard/delivery/page";
import PayoutsPage from "@/app/dashboard/payouts/page";
import DashboardLayout from "@/app/dashboard/layout";
import LoginPage from "@/app/login/page";

const nav = vi.hoisted(() => ({ replace: vi.fn(), push: vi.fn(), pathname: "/dashboard" }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: nav.replace, push: nav.push, prefetch: vi.fn(), refresh: vi.fn() }),
  usePathname: () => nav.pathname,
  useSearchParams: () => new URLSearchParams(),
}));

// ─── Fixtures: the response shapes of backend main ───────────────────────────

const recent = new Date(Date.now() - 3_600_000).toISOString();

const seller = (over: Partial<Seller> = {}): Seller => ({
  id: "s1", email: "seller@example.com", legal_name: null, business_name: null, brand_name: null, contact_name: null,
  phone: null, address_line: null, city: null, state: null, pincode: null, gst_registered: null, gstin: null,
  pan_number: null, aadhaar_last4: null, pricing_model: "seller_controlled", commission_rate: null, uae_commission_rate: null,
  onboarding_status: "approved", agreement_signed_at: null, logo_url: null, created_at: recent,
  agreement: { seller_country: "IN", required_version: "v1", required_open: false, signed_version: "v1", signed_at: recent, resign_required: false },
  commission: { pricing: "seller_controlled", india_pct: 17 },
  ...over,
});
const uaeSeller = () => seller({ seller_country: "AE", uae: { seller_country: "AE", ready: true, required_agreement_version: "v2", signed_agreement_version: "v2", signed_at: recent, commission_pct: 17 } });

const order = (over: Partial<Order> & { currency?: "INR" | "AED" } = {}): Order => {
  const { currency = "INR", ...rest } = over;
  return {
    ref_no: "NM-1", status: "confirmed", payment_method: "cod", created_at: recent, customer_name: "A", city: "Delhi", pincode: "110001",
    bucket: "new", seller_status: "awaiting", stage: "placed", region: currency === "AED" ? "ae" : "in", multi_seller: false, waybill: null,
    sla_due_at: new Date(Date.now() + 86_400_000).toISOString(), timeline: [],
    items: [{ product_id: "p1", product_name: "Tee", quantity: 2, unit_price: 500, line_total: 1000, market_unit_price: 500 }],
    commission: { type: "pct", label: "Commission", pct: 17, currency, gross: 1000, commission: 170, payout: 830, snapshot: false },
    ...rest,
  } as unknown as Order;
};

const product = (over: Partial<Product> = {}): Product => ({
  id: "p1", name: "Tee", approval_status: "approved", is_live: true, price_inr: 500, images: [], stock: 2, variants: [], product_variants: [], options: [],
  ...over,
} as unknown as Product);

const dashboard = (): DashboardData => ({
  today: { orders: 1, payout: { INR: 830 } },
  pending_accept: { count: 1, overdue: 0, next_due_at: null },
  ready_for_pickup: { count: 0, awaiting_awb: 0, awb_generated: 0 },
  counts: { new: 1, accepted: 0, ready: 0, shipped: 0, delivered: 0, cancelled: 0, returns: 0 },
  earnings: { today: {}, month: {}, delivered_lifetime: {} }, next_settlement: null, settlement_days: 7,
  low_stock: { count: 1, items: [], threshold: 3 }, returns: { open: 0 },
  products: { total: 1, live: 1, pending: 0, rejected: 0 }, sla_hours: 24, recent_orders: [],
} as unknown as DashboardData);

interface Backend {
  orders: Order[];
  products: Product[];
  payouts: { payouts: unknown[]; upcoming: unknown[]; totals: { paid: object; scheduled: object; upcoming: object }; settlement_days: number };
  notifications: unknown[];
  me: Seller;
  /** Extra routes, e.g. to switch one on. */
  extra: Record<string, (init?: RequestInit) => Response>;
  calls: { method: string; path: string; body?: BodyInit | null }[];
}

let be: Backend;
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function respond(method: string, path: string, init?: RequestInit): Response {
  const key = `${method} ${path}`;
  if (be.extra[key]) return be.extra[key](init);
  if (method === "GET") {
    if (path === "/seller/me") {
      const { uae, agreement, commission, ...rest } = be.me;
      return json({ seller: rest, uae, agreement, commission });
    }
    if (path === "/seller/orders") return json({ orders: be.orders, counts: {}, sla_hours: 24 });
    if (path === "/seller/products") return json({ products: be.products });
    if (path === "/seller/categories") return json({ categories: [{ id: "c1", name: "Tees", slug: "tees" }] });
    if (path === "/seller/returns") return json({ returns: [] });
    if (path === "/seller/notifications") return json({ notifications: be.notifications });
    if (path === "/seller/dashboard") return json(dashboard());
    if (path === "/seller/payouts") return json(be.payouts);
    if (path.startsWith("/seller/delivery-timeline")) {
      return json({
        rules: { sla_hours: { accept: 24, ready: 24, pickup: 24 }, ncr_express: { enabled: false }, pan_india: { min_days: 3, max_days: 7 }, uae: { min_days: 2, max_days: 4 } },
        summary: { open: be.orders.length, delayed: 0, due_today: 0 },
        orders: be.orders.map((o) => ({ ...o, delivery: { lane: o.region === "ae" ? "uae" : "pan_india", delayed: false, stages: [], delay: null } })),
      });
    }
  }
  if (method === "POST" && /^\/seller\/orders\/[^/]+\/accept$/.test(path)) return json({ order: { ...be.orders[0], bucket: "accepted", seller_status: "accepted" } });
  if (method === "POST" && path === "/seller/products") return json({ product: be.products[0] }, 201);
  if (method === "POST" && path === "/seller-auth/send-otp") return json({ success: true, message: "sent", expires_in_seconds: 600 });
  return new Response(`<pre>Cannot ${method} ${path}</pre>`, { status: 404, headers: { "Content-Type": "text/html" } });
}

beforeEach(() => {
  be = {
    orders: [order()], products: [product()], notifications: [], me: seller(), extra: {}, calls: [],
    payouts: { payouts: [], upcoming: [], totals: { paid: {}, scheduled: {}, upcoming: {} }, settlement_days: 7 },
  };
  localStorage.clear();
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    const method = init?.method ?? "GET";
    const path = String(url).split("?")[0];
    be.calls.push({ method, path, body: init?.body });
    return respond(method, path, init);
  }));
});
afterEach(() => { cleanup(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); nav.replace.mockClear(); nav.pathname = "/dashboard"; });

const inPanel = (ui: ReactElement, who: Seller = be.me) => render(
  <SellerContext.Provider value={who}>
    <LiveContext.Provider value={{ data: dashboard(), error: "", refresh: async () => {} }}>{ui}</LiveContext.Provider>
  </SellerContext.Provider>,
);

/** Every call to a route backend main does not have. Must stay empty while the features are off. */
const missingRoutes = () => be.calls.filter(({ method, path }) =>
  /\/stock$|\/tracking$|\/drafts$|^\/seller\/settings$|^\/seller\/analytics$/.test(path) && ["GET", "POST"].includes(method));

const expectNoRawError = () => {
  const text = document.body.textContent ?? "";
  for (const bad of [/Request failed/i, /Cannot (GET|POST)/, /\bundefined\b/, /\bNaN\b/, /\[object Object\]/]) expect(text).not.toMatch(bad);
};

// ─── Every page, both countries ──────────────────────────────────────────────

const PAGES: [string, () => ReactElement, RegExp][] = [
  ["Overview", () => <OverviewPage />, /Recent orders/],
  ["Orders", () => <OrdersPage />, /NM-1/],
  ["Inventory", () => <InventoryPage />, /Tee/],
  ["Analytics", () => <AnalyticsPage />, /Top products/],
  ["Notifications", () => <NotificationsPage />, /all caught up/],
  ["Catalogue", () => <ProductsPage />, /Tee/],
  ["Delivery", () => <DeliveryPage />, /NM-1/],
  ["Payouts", () => <PayoutsPage />, /Settlement history/],
];

describe.each([["India", seller], ["UAE", uaeSeller]] as const)("%s seller on today's backend", (_, who) => {
  it.each(PAGES)("%s loads with no raw error and no call to a missing route", async (_name, page, content) => {
    be.orders = [order({ currency: who === seller ? "INR" : "AED" })];
    be.products = [product(who === seller ? {} : { price_inr: null, price_aed: 55 } as Partial<Product>)];
    inPanel(page(), who());
    await screen.findAllByText(content);
    expectNoRawError();
    expect(missingRoutes()).toEqual([]);
  });
});

describe("existing sellers: no data of any kind", () => {
  it.each(PAGES)("%s shows an empty state, not a blank screen", async (_name, page) => {
    be.orders = []; be.products = [];
    const { container } = inPanel(page());
    await waitFor(() => expect(container.querySelector('[role="status"][aria-label="Loading"]')).toBeNull());
    await waitFor(() => expect((container.textContent ?? "").trim().length).toBeGreaterThan(10));
    expectNoRawError();
  });
});

describe("panel shell", () => {
  it("loads on the larger /seller/me and /seller/dashboard responses of backend PR #33", async () => {
    localStorage.setItem("nm_seller_token", "t");
    be.extra["GET /seller/me"] = () => json({
      seller: { ...seller(), country: "IN", currency: "INR", seller_country: "IN", is_test: false, commission_terms_version: null },
      rate_card: { country: "IN", terms: { status: "legacy" }, groups: [] }, agreement: seller().agreement, commission: seller().commission,
    });
    be.extra["GET /seller/dashboard"] = () => json({ ...dashboard(), country: "IN", currency: "INR", today: { orders: 1, payout: {}, revenue: { INR: 1000 } } });
    render(<DashboardLayout><p>page body</p></DashboardLayout>);
    expect(await screen.findByText("page body")).toBeTruthy();
    expectNoRawError();
  });

  it("loads for an India seller with every optional column missing, as before migrations 045 and 048", async () => {
    localStorage.setItem("nm_seller_token", "t");
    be.me = seller({ agreement: undefined, uae: undefined });
    render(<DashboardLayout><p>page body</p></DashboardLayout>);
    expect(await screen.findByText("page body")).toBeTruthy();
    expectNoRawError();
  });

  it("does not send approved sellers back to onboarding", async () => {
    localStorage.setItem("nm_seller_token", "t");
    render(<DashboardLayout><p>page body</p></DashboardLayout>);
    await screen.findByText("page body");
    expect(nav.replace).not.toHaveBeenCalled();
  });
});

// ─── Inventory ───────────────────────────────────────────────────────────────

describe("Inventory fallback", () => {
  it("shows stock read-only and points to Catalogue, the path that works today", async () => {
    inPanel(<InventoryPage />);
    expect(await screen.findByText(/Quick stock editing is coming soon/)).toBeTruthy();
    expect(screen.queryByRole("textbox", { name: /Stock for/ })).toBeNull();
    expect(screen.getAllByText("2").length).toBeGreaterThan(0);
  });

  it("keeps the alert level in this browser without calling the backend", async () => {
    inPanel(<InventoryPage />);
    fireEvent.change(await screen.findByLabelText("Low-stock alert at"), { target: { value: "7" } });
    expect(localStorage.getItem("nm_low_stock:s1")).toBe("7");
    expect(missingRoutes()).toEqual([]);
  });

  it("if switched on too early, a 404 changes nothing and never takes the product offline", async () => {
    vi.stubEnv("NEXT_PUBLIC_SELLER_FEATURES", "quick_stock");
    inPanel(<InventoryPage />);
    const input = await screen.findByRole("textbox", { name: /Stock for/ });
    fireEvent.change(input, { target: { value: "9" } });
    fireEvent.blur(input);
    expect(await screen.findByText(/not switched on yet, so nothing was changed/)).toBeTruthy();
    expect(be.calls.some((c) => c.method === "PUT")).toBe(false);
    expect((screen.getByRole("textbox", { name: /Stock for/ }) as HTMLInputElement).value).toBe("2");
  });
});

// ─── Orders ──────────────────────────────────────────────────────────────────

describe("Orders fallback", () => {
  it("offers tracking only on seller-ships orders; the accept and pack steps stay", async () => {
    be.orders = [order({ bucket: "accepted", seller_status: "accepted" } as Partial<Order>)];
    window.history.replaceState({}, "", "/dashboard/orders?tab=accepted");
    inPanel(<OrdersPage />);
    expect(await screen.findByRole("button", { name: "Mark as ready" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /tracking/i })).toBeNull();
    window.history.replaceState({}, "", "/");
  });
});

describe("orders an India seller already has in AED", () => {
  beforeEach(() => { be.orders = [order({ ref_no: "NM-IN" }), order({ ref_no: "NM-AE", currency: "AED" })]; });

  it("stay visible in Orders, in their own currency, and can still be accepted", async () => {
    inPanel(<OrdersPage />);
    await screen.findByText("NM-AE");
    expect(screen.getByText("NM-IN")).toBeTruthy();
    expect(document.body.textContent).toContain("AED 1,000.00");
    expect(document.body.textContent).toContain("₹1,000");
    fireEvent.click(screen.getAllByRole("button", { name: "Accept order" })[1]);
    await waitFor(() => expect(be.calls.some((c) => c.path.endsWith("/accept"))).toBe(true));
  });

  it("stay on the delivery timeline", async () => {
    inPanel(<DeliveryPage />);
    expect(await screen.findByText("NM-AE")).toBeTruthy();
  });

  it("show on Overview, but only the seller's currency counts as revenue", async () => {
    inPanel(<OverviewPage />);
    expect(await screen.findByText(/NM-AE/)).toBeTruthy();
    expect(screen.getByText("Revenue, 7 days").parentElement?.textContent).toContain("₹1,000");
    expect(screen.getByText("Revenue, 7 days").parentElement?.textContent).toContain("1 orders");
  });

  it("keep their payouts visible in their own section", async () => {
    be.payouts = {
      payouts: [{ id: "x", amount: 830, commission: 170, currency: "AED", status: "paid", due_date: recent, paid_at: recent, reference: "UTR1", invoice_url: null, created_at: recent }],
      upcoming: [], totals: { paid: { AED: 830 }, scheduled: {}, upcoming: {} }, settlement_days: 7,
    };
    inPanel(<PayoutsPage />);
    expect(await screen.findByText("Payouts in AED")).toBeTruthy();
    expect(document.body.textContent).toContain("UTR1");
    expect(document.body.textContent).toContain("AED 830.00");
  });

  it("add no extra payout section for sellers who have none", async () => {
    inPanel(<PayoutsPage />);
    await screen.findByText("Settlement history");
    expect(screen.queryByText(/Payouts in/)).toBeNull();
  });
});

// ─── Analytics ───────────────────────────────────────────────────────────────

describe("Analytics fallback", () => {
  it("works from orders and marks store conversion Coming soon", async () => {
    inPanel(<AnalyticsPage />);
    await screen.findByText("Top products");
    expect(screen.getByText("Store conversion").parentElement?.textContent).toContain("Coming soon");
  });

  it("if switched on too early, a 404 leaves the page working", async () => {
    vi.stubEnv("NEXT_PUBLIC_SELLER_FEATURES", "store_analytics");
    inPanel(<AnalyticsPage />);
    await screen.findByText("Top products");
    await waitFor(() => expect(be.calls.some((c) => c.path === "/seller/analytics")).toBe(true));
    expectNoRawError();
  });

  it("does not break on the response shape in backend PR #33", async () => {
    vi.stubEnv("NEXT_PUBLIC_SELLER_FEATURES", "store_analytics");
    be.extra["GET /seller/analytics"] = () => json({ country: "IN", currency: "INR", days: 30, totals: { orders: 1 }, series: [], top_products: [] });
    inPanel(<AnalyticsPage />);
    await screen.findByText("Top products");
    await waitFor(() => expect(be.calls.some((c) => c.path === "/seller/analytics")).toBe(true));
    expect(screen.getByText("Store conversion").parentElement?.textContent).toContain("Coming soon");
    expectNoRawError();
  });
});

// ─── Notifications ───────────────────────────────────────────────────────────

describe("Notifications fallback", () => {
  it("a 404 shows the friendly empty state", async () => {
    be.extra["GET /seller/notifications"] = () => new Response("<pre>Cannot GET</pre>", { status: 404 });
    inPanel(<NotificationsPage />);
    expect(await screen.findByText("You're all caught up")).toBeTruthy();
    expectNoRawError();
  });
});

// ─── Catalogue ───────────────────────────────────────────────────────────────

describe("Catalogue fallback", () => {
  it("adds products through the wizard, and the edit form has no server draft button or SKU field", async () => {
    be.products = [product()];
    inPanel(<ProductsPage />);
    expect((await screen.findByRole("link", { name: "+ Add product" })).getAttribute("href")).toBe("/dashboard/products/new");
    fireEvent.click(await screen.findByRole("button", { name: /^Edit/ }));
    expect(screen.queryByRole("button", { name: "Save as draft" })).toBeNull();
    expect(screen.queryByLabelText(/SKU/)).toBeNull();
  });

  it("offers the empty catalogue a next step", async () => {
    be.products = [];
    inPanel(<ProductsPage />);
    expect((await screen.findByRole("link", { name: "+ Add your first product" })).getAttribute("href")).toBe("/dashboard/products/new");
  });

  const editable = () => product({ name: "Tee", description: "A heavy cotton tee.", images: ["https://x/1.jpg"], category_id: "c1", status: "draft" } as Partial<Product>);

  it("if switched on too early, a draft 404 is explained and nothing is submitted for review", async () => {
    vi.stubEnv("NEXT_PUBLIC_SELLER_FEATURES", "drafts");
    be.products = [editable()];
    inPanel(<ProductsPage />);
    fireEvent.click(await screen.findByRole("button", { name: /^Edit/ }));
    fireEvent.click(await screen.findByRole("button", { name: "Save as draft" }));
    expect(await screen.findByText(/Drafts are not switched on yet/)).toBeTruthy();
    expect(be.calls.some((c) => c.method === "PUT" || (c.method === "POST" && c.path === "/seller/products"))).toBe(false);
  });

  it("editing keeps the existing route and sends no SKU or UAE listing fields for an India seller", async () => {
    be.products = [{ ...editable(), status: undefined, sell_in_uae: true, price_aed: 55 } as unknown as Product];
    be.extra["PUT /seller/products/p1"] = () => json({ product: be.products[0] });
    inPanel(<ProductsPage />);
    fireEvent.click(await screen.findByRole("button", { name: /^Edit/ }));
    fireEvent.click(await screen.findByRole("button", { name: /Save changes|Save|Submit/ }));
    await waitFor(() => expect(be.calls.some((c) => c.method === "PUT")).toBe(true));
    const sent = be.calls.find((c) => c.method === "PUT")!.body as FormData;
    expect(sent.get("price_inr")).toBe("500");
    for (const field of ["sku", "sell_in_uae", "price_aed", "mrp_aed"]) expect(sent.has(field)).toBe(false);
  });
});

// ─── Client and login ────────────────────────────────────────────────────────

describe("api client", () => {
  it("never surfaces a raw status for a non-JSON error", async () => {
    await expect(api.saveSettings({ low_stock_threshold: 1 })).rejects.toMatchObject({ status: 404, message: expect.not.stringMatching(/\b404\b|Request failed/) });
  });

  it("features are off unless named", () => {
    expect(featureOn("quick_stock")).toBe(false);
    vi.stubEnv("NEXT_PUBLIC_SELLER_FEATURES", " drafts , quick_stock");
    expect(featureOn("quick_stock")).toBe(true);
    expect(featureOn("sku")).toBe(false);
  });
});

describe("login", () => {
  it("still sends the same email OTP request", async () => {
    render(<LoginPage />);
    fireEvent.change(await screen.findByLabelText(/email/i), { target: { value: "seller@example.com" } });
    fireEvent.submit(screen.getByLabelText(/email/i).closest("form")!);
    await waitFor(() => expect(be.calls.some((c) => c.path === "/seller-auth/send-otp")).toBe(true));
    expect(JSON.parse(String(be.calls.find((c) => c.path === "/seller-auth/send-otp")!.body))).toEqual({ email: "seller@example.com", purpose: "login" });
  });
});
