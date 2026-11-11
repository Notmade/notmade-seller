// @vitest-environment jsdom
// Catalogue > Bulk upload against a fake backend that answers with the real response shapes (fixtures from the backend
// test harness). Category first, the commission from the backend, a preview with row errors, and submit only after the
// seller confirms when some rows are held back.
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fixtures from "./fixtures/bulk-templates.json";
import type { BulkTemplate, BulkValidation, Seller } from "@/app/lib/seller-api";
import { LiveContext, SellerContext } from "@/app/dashboard/seller-context";
import BulkUploadPage from "@/app/dashboard/products/bulk/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), prefetch: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/dashboard/products/bulk",
  useSearchParams: () => new URLSearchParams(),
}));

// jsdom's File has no text(); browsers do
if (!File.prototype.text) {
  File.prototype.text = function text(this: File) {
    return new Promise<string>((resolve) => { const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.readAsText(this); });
  };
}

const T = fixtures as unknown as Record<"in_tees" | "in_candles" | "ae_laptops" | "ae_tees", BulkTemplate>;
const IN_CATS = (fixtures as unknown as { in_categories: { categories: unknown[] } }).in_categories.categories;
const recent = new Date().toISOString();

const seller = (over: Partial<Seller> = {}): Seller => ({
  id: "s1", email: "seller@example.com", legal_name: null, business_name: null, brand_name: null, contact_name: null,
  phone: null, address_line: null, city: null, state: null, pincode: null, gst_registered: null, gstin: null,
  pan_number: null, aadhaar_last4: null, pricing_model: "seller_controlled", commission_rate: null, uae_commission_rate: null,
  onboarding_status: "approved", agreement_signed_at: recent, logo_url: null, created_at: recent, seller_country: "IN",
  agreement: { seller_country: "IN", required_version: "in-v2", required_open: true, signed_version: "in-v2", signed_at: recent, resign_required: false },
  ...over,
});

type Call = { method: string; path: string; body: unknown };
let calls: Call[];
let templates: Record<string, BulkTemplate>;
let validation: (rows: Record<string, unknown>[]) => BulkValidation;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

beforeEach(() => {
  calls = [];
  templates = { [T.in_tees.category.id]: T.in_tees, [T.in_candles.category.id]: T.in_candles };
  // Like the backend: a row of another category is refused, anything else here is fine
  validation = (rows) => {
    const results = rows.map((r) => {
      const wrong = r.category !== "Candles";
      return { line: Number(r.line), group: null, ok: !wrong, errors: wrong ? [{ field: "category", code: "CATEGORY_MISMATCH", message: `Category "${r.category}" is not Candles. This file is for Candles only` }] : [] };
    });
    return {
      category: T.in_candles.category, currency: "INR", rows: results,
      products: rows.map((r, i) => ({ key: null, lines: [Number(r.line)], name: String(r.name), variants: 0, image_files: String(r.image_files).split("|"), ok: results[i].ok })),
      summary: { rows: rows.length, valid_rows: results.filter((r) => r.ok).length, invalid_rows: results.filter((r) => !r.ok).length, products: rows.length, valid_products: results.filter((r) => r.ok).length },
    };
  };
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    const method = init?.method ?? "GET";
    const u = new URL(String(url), "http://x");
    const body = typeof init?.body === "string" ? JSON.parse(init.body) : init?.body;
    calls.push({ method, path: u.pathname, body });
    if (method === "GET" && u.pathname === "/seller/bulk/categories") return json({ categories: IN_CATS });
    if (method === "GET" && u.pathname === "/seller/bulk/template") return json(templates[u.searchParams.get("category_id") ?? ""]);
    if (method === "POST" && u.pathname === "/seller/bulk/validate") return json(validation((body as { rows: Record<string, unknown>[] }).rows));
    if (method === "POST" && u.pathname === "/seller/bulk/products") return json({ product: { id: "new" }, lines: [2], key: null }, 201);
    return new Response("<pre>Cannot</pre>", { status: 404, headers: { "Content-Type": "text/html" } });
  }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const renderPage = (who: Seller = seller()) => render(
  <SellerContext.Provider value={who}>
    <LiveContext.Provider value={{ data: null, error: "", refresh: async () => {} }}><BulkUploadPage /></LiveContext.Provider>
  </SellerContext.Provider>,
);

async function choose(name: string) {
  fireEvent.focus(await screen.findByRole("combobox"));
  fireEvent.mouseDown(await screen.findByRole("option", { name }));
}
const fileInput = () => document.querySelector('input[accept*="csv"]') as HTMLInputElement;
const photoInput = () => document.querySelector('input[accept*="image"]') as HTMLInputElement;
const upload = (input: HTMLInputElement, files: File[]) => fireEvent.change(input, { target: { files } });
const csv = (text: string) => new File([text], "p.csv", { type: "text/csv" });
const candleCsv = "category,name,description,stock,price (INR),mrp (INR),image_files\nCandles,Soy candle,Hand-poured soy candle here.,4,650,,a.png\nTees,Box tee,A heavy cotton box tee.,2,999,,b.png\n";

describe("bulk upload page", () => {
  it("category first: nothing else is enabled until a category is chosen", async () => {
    renderPage();
    await screen.findByRole("combobox");
    expect((screen.getByRole("button", { name: "Download Excel template" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "CSV version" }) as HTMLButtonElement).disabled).toBe(true);
    expect((fileInput() as HTMLButtonElement).disabled).toBe(true);
    expect((photoInput() as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText("Choose a category to continue.")).toBeTruthy();
    // The picker offers the seller's own categories, grouped
    fireEvent.focus(screen.getByRole("combobox"));
    expect(screen.getByRole("group", { name: "Fashion" })).toBeTruthy();

    await choose("Tees");
    await waitFor(() => expect((screen.getByRole("button", { name: "Download Excel template" }) as HTMLButtonElement).disabled).toBe(false));
    expect((fileInput() as HTMLButtonElement).disabled).toBe(false);
    expect(calls.some((c) => c.path === "/seller/bulk/template")).toBe(true);
    expect(screen.getByText(/One row per size and colour/)).toBeTruthy();
  });

  it("shows the commission for the chosen category as the backend sends it", async () => {
    templates[T.in_tees.category.id] = { ...T.in_tees, commission: { ...T.in_tees.commission, pct: 19 } };
    renderPage();
    await choose("Tees");
    const panel = await screen.findByRole("region", { name: "Commission on Tees" });
    expect(within(panel).getByText("19%")).toBeTruthy();
    expect(within(panel).getByText(/from your rate card IN-2026-11-v2/)).toBeTruthy();
    expect(within(panel).getByText("Settlement within 7 days.")).toBeTruthy();
  });

  it("phones and laptops: who ships and the NOTMADE shipping charge", async () => {
    templates[T.in_tees.category.id] = T.ae_laptops;
    renderPage(seller({ seller_country: "AE", uae: { seller_country: "AE", ready: true, required_agreement_version: "uae-local-v4", signed_agreement_version: "uae-local-v4", signed_at: recent, commission_pct: null } }));
    await choose("Tees");
    const panel = await screen.findByRole("region", { name: "Commission on LAPTOPS" });
    expect(within(panel).getByText("You ship: 12%")).toBeTruthy();
    expect(within(panel).getByText("NOTMADE ships: 13.5%")).toBeTruthy();
    expect(within(panel).getByText("12% commission + 1.5% NOTMADE shipping charge, flat, no VAT added")).toBeTruthy();
  });

  it("preview: per-row errors, missing photos, an error file, and submit only the ready rows after confirming", async () => {
    renderPage();
    await choose("Candles");
    await waitFor(() => expect((fileInput() as HTMLButtonElement).disabled).toBe(false));
    upload(fileInput(), [csv(candleCsv)]);
    await screen.findByText(/This file is for Candles only/);
    const sent = calls.find((c) => c.path === "/seller/bulk/validate")!.body as { category_id: string; rows: Record<string, unknown>[] };
    expect(sent.category_id).toBe(T.in_candles.category.id);
    expect(sent.rows.map((r) => r.category)).toEqual(["Candles", "Tees"]);
    expect(screen.getByText(/Photo not chosen: a.png/)).toBeTruthy();
    expect(screen.getByText(/0 products ready \(0 rows\), 2 rows to fix/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Download error file" })).toBeTruthy();

    upload(photoInput(), [new File(["x"], "a.png", { type: "image/png" })]);
    await screen.findByText(/1 product ready \(1 rows\), 1 row to fix/);
    fireEvent.click(screen.getByRole("button", { name: "Submit 1 product for review" }));
    // Rows to fix: the seller confirms first, and nothing is sent until then
    expect(await screen.findByText(/1 row has errors and will not be sent/)).toBeTruthy();
    expect(calls.filter((c) => c.path === "/seller/bulk/products")).toHaveLength(0);
    fireEvent.click(screen.getAllByRole("button", { name: "Submit 1 product for review" }).at(-1)!);
    await screen.findByText("Submitted · In review");
    const posts = calls.filter((c) => c.path === "/seller/bulk/products");
    expect(posts).toHaveLength(1);
    const fd = posts[0].body as FormData;
    expect(fd.get("category_id")).toBe(T.in_candles.category.id);
    expect(JSON.parse(String(fd.get("rows")))).toEqual([expect.objectContaining({ line: 2, category: "Candles", name: "Soy candle" })]);
    expect((fd.getAll("images") as File[]).map((f) => f.name)).toEqual(["a.png"]);
  });

  it("one click when every row is ready", async () => {
    renderPage();
    await choose("Candles");
    await waitFor(() => expect((fileInput() as HTMLButtonElement).disabled).toBe(false));
    upload(fileInput(), [csv(candleCsv.split("\n").slice(0, 2).join("\n") + "\n")]);
    upload(photoInput(), [new File(["x"], "a.png", { type: "image/png" })]);
    fireEvent.click(await screen.findByRole("button", { name: "Submit 1 product for review" }));
    await screen.findByText("Submitted · In review");
    expect(screen.queryByText(/will not be sent/)).toBeNull();
  });

  it("refuses a file priced in the other currency before anything is sent", async () => {
    renderPage();
    await choose("Candles");
    await waitFor(() => expect((fileInput() as HTMLButtonElement).disabled).toBe(false));
    upload(fileInput(), [csv(candleCsv.replace(/\(INR\)/g, "(AED)"))]);
    await screen.findByText(/This file has prices in AED. Your prices are in INR/);
    expect(calls.some((c) => c.path === "/seller/bulk/validate")).toBe(false);
  });

  it("agreement gating: a seller who must re-sign sees why and cannot upload", async () => {
    renderPage(seller({ agreement: { seller_country: "IN", required_version: "in-v3", required_open: true, signed_version: "in-v2", signed_at: recent, resign_required: true } }));
    await choose("Candles");
    await waitFor(() => expect((screen.getByRole("button", { name: "Download Excel template" }) as HTMLButtonElement).disabled).toBe(false));
    expect(screen.getByText(/Sign your seller agreement to add products/)).toBeTruthy();
    expect((fileInput() as HTMLButtonElement).disabled).toBe(true);
    expect((photoInput() as HTMLButtonElement).disabled).toBe(true);
  });

  it("agreement gating: the backend's can_submit locks uploads too, e.g. a UAE seller without the UAE agreement", async () => {
    templates[T.in_candles.category.id] = { ...T.in_candles, can_submit: false };
    renderPage();
    await choose("Candles");
    await waitFor(() => expect((screen.getByRole("button", { name: "Download Excel template" }) as HTMLButtonElement).disabled).toBe(false));
    expect((fileInput() as HTMLButtonElement).disabled).toBe(true);
  });
});
