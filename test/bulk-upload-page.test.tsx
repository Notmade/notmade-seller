// @vitest-environment jsdom
// Catalogue > Bulk upload against a fake backend that answers with the real response shapes (fixtures from the backend
// test harness). Category first, the commission from the backend, a preview with row errors, and submit only after the
// seller confirms when some rows are held back.
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fixtures from "./fixtures/bulk-templates.json";
import type { BulkPhoto, BulkTemplate, BulkValidation, Seller } from "@/app/lib/seller-api";
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

const T = fixtures as unknown as Record<"in_hoodies" | "in_home_decor" | "ae_laptops" | "ae_hoodies", BulkTemplate>;
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

// As the backend reads an image_files entry (lib/bulk-upload.js photoInfo)
const photoOf = (name: string): BulkPhoto => {
  const id = name.match(/drive\.google\.com\/file\/d\/([\w-]+)/)?.[1];
  return id ? { source: "drive", name: `drive-${id}`, drive_id: id, link: name } : { source: "file", name };
};
let drive: Record<string, Response | (() => Response)>;
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

beforeEach(() => {
  calls = [];
  drive = {};
  templates = { [T.in_hoodies.category.id]: T.in_hoodies, [T.in_home_decor.category.id]: T.in_home_decor };
  // Like the backend: a row of another category is refused, anything else here is fine
  validation = (rows) => {
    const results = rows.map((r) => {
      const wrong = r.category !== "HOME DECOR";
      return { line: Number(r.line), group: null, ok: !wrong, errors: wrong ? [{ field: "category", code: "CATEGORY_MISMATCH", message: `Category "${r.category}" is not HOME DECOR. This file is for HOME DECOR only` }] : [] };
    });
    return {
      category: T.in_home_decor.category, currency: "INR", rows: results,
      products: rows.map((r, i) => ({ key: null, lines: [Number(r.line)], name: String(r.name), variants: 0, image_files: String(r.image_files).split("|"), photos: String(r.image_files).split("|").map(photoOf), ok: results[i].ok })),
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
    if (method === "POST" && u.pathname === "/seller/products/import-image") {
      const r = drive[(body as { url: string }).url];
      return typeof r === "function" ? r() : r ?? json({ error: "We could not download this photo from Google Drive. Try again.", code: "FETCH_FAILED" }, 502);
    }
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
const decorCsv = "category,name,description,stock,price (INR),mrp (INR),image_files\nHOME DECOR,Brass vase,Hand-finished brass vase here.,4,1650,,a.png\nHOODIES,Heavy hoodie,A heavyweight fleece hoodie.,2,2499,,b.png\n";

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

    await choose("HOODIES");
    await waitFor(() => expect((screen.getByRole("button", { name: "Download Excel template" }) as HTMLButtonElement).disabled).toBe(false));
    expect((fileInput() as HTMLButtonElement).disabled).toBe(false);
    expect(calls.some((c) => c.path === "/seller/bulk/template")).toBe(true);
    expect(screen.getByText(/One row per size and colour/)).toBeTruthy();
  });

  it("shows the commission for the chosen category as the backend sends it", async () => {
    templates[T.in_hoodies.category.id] = { ...T.in_hoodies, commission: { ...T.in_hoodies.commission, pct: 19 } };
    renderPage();
    await choose("HOODIES");
    const panel = await screen.findByRole("region", { name: "Commission on HOODIES" });
    expect(within(panel).getByText("19%")).toBeTruthy();
    expect(within(panel).getByText(/from your rate card IN-2026-11-v2/)).toBeTruthy();
    expect(within(panel).getByText("Settlement within 7 days.")).toBeTruthy();
  });

  it("phones and laptops: who ships and the NOTMADE shipping charge", async () => {
    templates[T.ae_laptops.category.id] = T.ae_laptops;
    renderPage(seller({ seller_country: "AE", uae: { seller_country: "AE", ready: true, required_agreement_version: "uae-local-v4", signed_agreement_version: "uae-local-v4", signed_at: recent, commission_pct: null } }));
    await choose("LAPTOPS");
    const panel = await screen.findByRole("region", { name: "Commission on LAPTOPS" });
    expect(within(panel).getByText("You ship: 12%")).toBeTruthy();
    expect(within(panel).getByText("NOTMADE ships: 13.5%")).toBeTruthy();
    expect(within(panel).getByText("12% commission + 1.5% NOTMADE shipping charge, flat, no VAT added")).toBeTruthy();
  });

  it("preview: per-row errors, missing photos, an error file, and submit only the ready rows after confirming", async () => {
    renderPage();
    await choose("HOME DECOR");
    await waitFor(() => expect((fileInput() as HTMLButtonElement).disabled).toBe(false));
    upload(fileInput(), [csv(decorCsv)]);
    await screen.findByText(/This file is for HOME DECOR only/);
    const sent = calls.find((c) => c.path === "/seller/bulk/validate")!.body as { category_id: string; rows: Record<string, unknown>[] };
    expect(sent.category_id).toBe(T.in_home_decor.category.id);
    expect(sent.rows.map((r) => r.category)).toEqual(["HOME DECOR", "HOODIES"]);
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
    expect(fd.get("category_id")).toBe(T.in_home_decor.category.id);
    expect(JSON.parse(String(fd.get("rows")))).toEqual([expect.objectContaining({ line: 2, category: "HOME DECOR", name: "Brass vase" })]);
    expect((fd.getAll("images") as File[]).map((f) => f.name)).toEqual(["a.png"]);
  });

  it("Google Drive links: no photo to pick, each one downloaded through the backend, a private one held back with its reason", async () => {
    const pub = "https://drive.google.com/file/d/1PublicPhotoAbCdEf/view?usp=drive_link";
    const priv = "https://drive.google.com/file/d/1PrivatePhotoAbCdEf/view?usp=drive_link";
    const privMsg = 'This Google Drive photo is private. In Drive, set Share > General access to "Anyone with the link" and try again.';
    drive[pub] = () => new Response(PNG, { status: 200, headers: { "Content-Type": "image/png" } });
    drive[priv] = () => json({ error: privMsg, code: "PRIVATE" }, 422);
    renderPage();
    await choose("HOME DECOR");
    await waitFor(() => expect((fileInput() as HTMLButtonElement).disabled).toBe(false));
    upload(fileInput(), [csv(`category,name,description,stock,price (INR),mrp (INR),image_files\nHOME DECOR,Brass vase,Hand-finished brass vase here.,4,1650,,${pub}\nHOME DECOR,Clay vase,Hand-thrown clay vase here.,4,1650,,${priv}\n`)]);
    expect(await screen.findByText(/2 products ready \(2 rows\), 0 rows to fix/)).toBeTruthy();
    expect(screen.queryByText(/Photo not chosen/)).toBeNull();
    expect(screen.getByText(/2 Drive photos in this file/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Submit 2 products for review" }));
    await screen.findByText("Submitted · In review");
    expect(await screen.findByText(`Photo 1: ${privMsg}`)).toBeTruthy();
    expect(calls.filter((c) => c.path === "/seller/products/import-image").map((c) => (c.body as { url: string }).url)).toEqual([pub, priv]);
    const posts = calls.filter((c) => c.path === "/seller/bulk/products");
    expect(posts).toHaveLength(1);
    expect(((posts[0].body as FormData).getAll("images") as File[]).map((f) => [f.name, f.type])).toEqual([["drive-1PublicPhotoAbCdEf.png", "image/png"]]);
    expect(screen.getByText(/1 row to fix, 1 product submitted/)).toBeTruthy();
  });

  it("one click when every row is ready", async () => {
    renderPage();
    await choose("HOME DECOR");
    await waitFor(() => expect((fileInput() as HTMLButtonElement).disabled).toBe(false));
    upload(fileInput(), [csv(decorCsv.split("\n").slice(0, 2).join("\n") + "\n")]);
    upload(photoInput(), [new File(["x"], "a.png", { type: "image/png" })]);
    fireEvent.click(await screen.findByRole("button", { name: "Submit 1 product for review" }));
    await screen.findByText("Submitted · In review");
    expect(screen.queryByText(/will not be sent/)).toBeNull();
  });

  it("refuses a file priced in the other currency before anything is sent", async () => {
    renderPage();
    await choose("HOME DECOR");
    await waitFor(() => expect((fileInput() as HTMLButtonElement).disabled).toBe(false));
    upload(fileInput(), [csv(decorCsv.replace(/\(INR\)/g, "(AED)"))]);
    await screen.findByText(/This file has prices in AED. Your prices are in INR/);
    expect(calls.some((c) => c.path === "/seller/bulk/validate")).toBe(false);
  });

  it("old template: the whole upload fails with one clear message, no row errors, and nothing is sent", async () => {
    renderPage();
    await choose("HOODIES");
    await waitFor(() => expect((fileInput() as HTMLButtonElement).disabled).toBe(false));
    const old = "name,description,category,price,mrp,sizes,stock,image_files\nHeavy hoodie,Heavyweight fleece hoodie.,HOODIES,2499,,S|M,1|2,a.png\nBad,short,Nope,0,,,x,\n";
    upload(fileInput(), [csv(old)]);
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe("Yeh purana template hai. Category chunkar naya template download karein.");
    expect(screen.queryByRole("region", { name: "Rows in your file" })).toBeNull();
    expect(screen.queryByText(/to fix/)).toBeNull();
    expect(calls.some((c) => c.path === "/seller/bulk/validate")).toBe(false);
  });

  it("agreement gating: a seller who must re-sign sees why and cannot upload", async () => {
    renderPage(seller({ agreement: { seller_country: "IN", required_version: "in-v3", required_open: true, signed_version: "in-v2", signed_at: recent, resign_required: true } }));
    await choose("HOME DECOR");
    await waitFor(() => expect((screen.getByRole("button", { name: "Download Excel template" }) as HTMLButtonElement).disabled).toBe(false));
    expect(screen.getByText(/Sign your seller agreement to add products/)).toBeTruthy();
    expect((fileInput() as HTMLButtonElement).disabled).toBe(true);
    expect((photoInput() as HTMLButtonElement).disabled).toBe(true);
  });

  it("agreement gating: the backend's can_submit locks uploads too, e.g. a UAE seller without the UAE agreement", async () => {
    templates[T.in_home_decor.category.id] = { ...T.in_home_decor, can_submit: false };
    renderPage();
    await choose("HOME DECOR");
    await waitFor(() => expect((screen.getByRole("button", { name: "Download Excel template" }) as HTMLButtonElement).disabled).toBe(false));
    expect((fileInput() as HTMLButtonElement).disabled).toBe(true);
  });
});
