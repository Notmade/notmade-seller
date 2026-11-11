// @vitest-environment jsdom
// Changes to approved products and "Add photos to existing products", against a fake backend in the shape of backend
// PR feat/product-change-approval. The live listing never goes offline for an edit; the seller sees the change status,
// can cancel it, photos are 8 at most and a reorder is a change.
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PendingChange, PhotoAddRowResult, Product, Seller } from "@/app/lib/seller-api";
import { LiveContext, SellerContext } from "@/app/dashboard/seller-context";
import ProductsPage from "@/app/dashboard/products/page";
import AddPhotosPage from "@/app/dashboard/products/photos/page";
import { formSource, movePhoto, photoPayload, photosChanged, type PhotoItem } from "@/app/lib/product-change";
import { COLUMNS, NOTE, collectRowPhotos, csvTemplate, errorCsv, readCsv, readPasted, readTable, xlsxTemplate } from "@/app/lib/photo-add";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), prefetch: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/dashboard/products",
  useSearchParams: () => new URLSearchParams(),
}));

const recent = new Date(Date.now() - 3_600_000).toISOString();
const seller = (over: Partial<Seller> = {}): Seller => ({
  id: "s1", email: "s@x.in", onboarding_status: "approved", created_at: recent, seller_country: "IN",
  agreement: { seller_country: "IN", required_version: "v1", required_open: false, signed_version: "v1", signed_at: recent, resign_required: false },
  commission: { pricing: "seller_controlled", india_pct: 17 }, ...over,
} as Seller);
const uaeSeller = (ready = true) => seller({ seller_country: "AE", uae: { seller_country: "AE", ready, required_agreement_version: "v2", signed_agreement_version: ready ? "v2" : null, signed_at: recent, commission_pct: 17 } });

const product = (over: Partial<Product> = {}): Product => ({
  id: "p1", name: "Heavy Tee", description: "Heavy cotton tee.", category: "Tees", category_id: "c1", sizes: [], stock: 4, price_inr: 1000,
  original_price_inr: null, price_aed: null, images: ["https://cdn/a.jpg", "https://cdn/b.jpg"], is_live: true, approval_status: "approved",
  rejection_reason: null, submitted_at: recent, reviewed_at: recent, created_at: recent, product_variants: [], variants: [], options: [], pending_change: null, ...over,
} as Product);
const pendingChange = (over: Partial<PendingChange> = {}): PendingChange => ({
  id: "r1", status: "pending", fields: ["price"], labels: ["Price and MRP"], submitted_at: recent, reviewed_at: null, rejection_reason: null, decisions: null, ...over,
});

interface Call { method: string; path: string; body?: BodyInit | null }
let calls: Call[];
let routes: Record<string, (init?: RequestInit) => Response>;
let products: Product[];
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

beforeEach(() => {
  calls = [];
  products = [product()];
  routes = {
    "GET /seller/products": () => json({ products }),
    "GET /seller/categories": () => json({ categories: [{ id: "c1", name: "Tees", slug: "tees" }] }),
  };
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    const method = init?.method ?? "GET";
    const path = String(url).replace(/^https?:\/\/[^/]+/, "").split("?")[0];
    calls.push({ method, path, body: init?.body });
    const h = routes[`${method} ${path}`];
    return h ? h(init) : new Response(`<pre>Cannot ${method} ${path}</pre>`, { status: 404, headers: { "Content-Type": "text/html" } });
  }));
  vi.stubGlobal("URL", Object.assign(URL, { createObjectURL: () => "blob:x", revokeObjectURL: () => {} }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const inPanel = (ui: ReactElement, who: Seller = seller()) => render(
  <SellerContext.Provider value={who}>
    <LiveContext.Provider value={{ data: null, error: "", refresh: async () => {} } as never}>{ui}</LiveContext.Provider>
  </SellerContext.Provider>,
);
/** jsdom's Blob has no text() / arrayBuffer() */
const readBlob = (b: Blob, as: "text" | "buffer") => new Promise<string | ArrayBuffer>((resolve) => {
  const r = new FileReader();
  r.onload = () => resolve(r.result as string | ArrayBuffer);
  if (as === "text") r.readAsText(b); else r.readAsArrayBuffer(b);
});
const sentForm = (method: string, path: string) => calls.find((c) => c.method === method && c.path === path)?.body as FormData;

// ─── Helpers ─────────────────────────────────────────────────────────────────

describe("photo order", () => {
  const file = new File(["x"], "new.png", { type: "image/png" });
  const items: PhotoItem[] = [{ kind: "file", file, preview: "blob:1" }, { kind: "url", url: "b" }, { kind: "url", url: "a" }];

  it("a new photo keeps its place: new:<i> in existing_images, files in upload order", () => {
    expect(photoPayload(items)).toEqual({ existing: ["new:0", "b", "a"], files: [file] });
  });
  it("a pure reorder counts as a change, the same order does not", () => {
    expect(photosChanged(["a", "b"], [{ kind: "url", url: "b" }, { kind: "url", url: "a" }])).toBe(true);
    expect(photosChanged(["a", "b"], [{ kind: "url", url: "a" }, { kind: "url", url: "b" }])).toBe(false);
    expect(photosChanged(["a", "b"], [{ kind: "url", url: "a" }])).toBe(true);
  });
  it("moves within bounds only", () => {
    expect(movePhoto(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"]);
    expect(movePhoto(["a"], 0, 3)).toEqual(["a"]);
  });
  it("the form starts from the waiting change's preview, keeping the live stock and status", () => {
    const p = product({ stock: 9, pending_change: pendingChange({ preview: product({ name: "Heavy Tee v2", stock: 1 }) }) });
    const src = formSource(p);
    expect([src.name, src.stock, src.is_live, src.pending_change?.id]).toEqual(["Heavy Tee v2", 9, true, "r1"]);
  });
});

// ─── Catalogue ───────────────────────────────────────────────────────────────

describe("Catalogue: change status and cancel", () => {
  it("shows the pending change on the product, filters by it, and Cancel withdraws it", async () => {
    products = [product({ pending_change: pendingChange() }), product({ id: "p2", name: "Plain Cap" })];
    routes["DELETE /seller/products/p1/pending-change"] = () => json({ product: product(), cancelled: true });
    inPanel(<ProductsPage />);
    expect(await screen.findByText("Change pending approval")).toBeTruthy();
    expect(screen.getByText(/customers see the live version until it is approved/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Changes pending" }));
    expect(screen.queryByText("Plain Cap")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel change" }));
    expect(await screen.findByText(/Change cancelled. Your live listing is unchanged/)).toBeTruthy();
    expect(calls.some((c) => c.method === "DELETE" && c.path === "/seller/products/p1/pending-change")).toBe(true);
    expect(screen.queryByText("Change pending approval")).toBeNull();
  });

  it("a rejected change shows the reason; the product stays Live", async () => {
    products = [product({ pending_change: pendingChange({ status: "rejected", rejection_reason: "Photos are blurry", reviewed_at: recent }) })];
    inPanel(<ProductsPage />);
    expect(await screen.findByText("Change not approved")).toBeTruthy();
    expect(screen.getByText(/Photos are blurry/)).toBeTruthy();
    // The product's own badge (not the filter pill) still says Live
    expect(screen.getAllByText("Live").some((e) => e.tagName === "SPAN")).toBe(true);
    expect(screen.getAllByText("In review").every((e) => e.tagName === "BUTTON")).toBe(true);
  });

  it("Add photos sits next to Bulk upload", async () => {
    inPanel(<ProductsPage />);
    expect((await screen.findByRole("link", { name: "Add photos" })).getAttribute("href")).toBe("/dashboard/products/photos");
  });
});

describe("Catalogue: editing a live product", () => {
  const open = async () => { inPanel(<ProductsPage />); fireEvent.click(await screen.findByRole("button", { name: /^Edit/ })); };
  beforeEach(() => {
    routes["PUT /seller/products/p1"] = () => json({ product: product({ pending_change: pendingChange({ fields: ["images"], labels: ["Photos"] }) }), pending_fields: ["images"] }, 202);
  });

  it("says the listing stays live, and never says it goes offline", async () => {
    await open();
    expect(screen.getByText(/stays live as it is while NOTMADE reviews your change/)).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/offline/);
    expect(screen.getByRole("button", { name: "Save & send for approval" })).toBeTruthy();
  });

  it("a pure reorder is sent: existing_images in the new order", async () => {
    await open();
    fireEvent.click(screen.getByRole("button", { name: "Move photo 2 left" }));
    fireEvent.click(screen.getByRole("button", { name: "Save & send for approval" }));
    expect(await screen.findByText(/sent for approval. Your product stays live/)).toBeTruthy();
    expect(JSON.parse(String(sentForm("PUT", "/seller/products/p1").get("existing_images")))).toEqual(["https://cdn/b.jpg", "https://cdn/a.jpg"]);
  });

  it("unchanged photos are not sent", async () => {
    await open();
    fireEvent.click(screen.getByRole("button", { name: "Save & send for approval" }));
    await waitFor(() => expect(calls.some((c) => c.method === "PUT")).toBe(true));
    expect(sentForm("PUT", "/seller/products/p1").has("existing_images")).toBe(false);
  });

  it("8 photos at most: with 8 there is no add button", async () => {
    products = [product({ images: Array.from({ length: 8 }, (_, i) => `https://cdn/${i}.jpg`) })];
    await open();
    expect(screen.getByText("Photos (8/8)")).toBeTruthy();
    expect(document.querySelector('input[type="file"][multiple]')).toBeNull();
  });

  it("editing with a change waiting starts from it and says saving replaces it", async () => {
    products = [product({ pending_change: pendingChange({ preview: product({ price_inr: 899 }) }) })];
    await open();
    expect(screen.getByText(/A change is waiting for approval \(Price and MRP\)/)).toBeTruthy();
    expect((screen.getByLabelText("Selling price") as HTMLInputElement).value).toBe("899");
  });

  it("per-SKU photo: each SKU of a colour product can carry one photo, sent as the variant's image_url", async () => {
    products = [product({
      sizes: ["M"],
      options: [{ name: "Size", values: [{ value: "M" }] }, { name: "Colour", values: [{ value: "Black", images: [] }] }],
      variants: [{ id: "v1", option_values: { Size: "M", Colour: "Black" }, stock: 3, is_active: true, image_url: "https://cdn/sku.jpg", sku: "T-BLK-M" }],
    })];
    await open();
    expect(screen.getByAltText("Photo for Black M")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Save & send for approval" }));
    await waitFor(() => expect(calls.some((c) => c.method === "PUT")).toBe(true));
    const variants = JSON.parse(String(sentForm("PUT", "/seller/products/p1").get("variants")));
    expect(variants).toEqual([{ id: "v1", sku: "T-BLK-M", option_values: { Colour: "Black", Size: "M" }, stock: 3, image_url: "https://cdn/sku.jpg" }]);
  });
});

// ─── Add photos: sheet ───────────────────────────────────────────────────────

describe("Add photos: sheet", () => {
  it("template: the five columns, the note, no sheet protection", async () => {
    const csv = csvTemplate();
    expect(csv.split("\r\n")[0]).toBe(COLUMNS.join(","));
    expect(csv).toContain(NOTE);
    expect(NOTE).toBe("up to 8 photo links, separated by | with no spaces; Google Drive links must be shared as Anyone with the link; file links only, not folders");
    const { Workbook } = await import("exceljs");
    const wb = new Workbook();
    await wb.xlsx.load(await readBlob(await xlsxTemplate(), "buffer") as ArrayBuffer);
    const ws = wb.getWorksheet("Photos")!;
    expect(COLUMNS.map((_, i) => ws.getCell(1, i + 1).text)).toEqual([...COLUMNS]);
    expect(String(ws.getCell(1, 4).note)).toContain(NOTE);
    expect((ws as unknown as { sheetProtection?: unknown }).sheetProtection ?? null).toBeNull();
  });

  it("reads CSV (skipping the note line), pasted tab rows without headers, and refuses a sheet without the columns", () => {
    const csv = readCsv(csvTemplate());
    expect(csv.fatal).toBeNull();
    expect(csv.rows.map((r) => r.cells.product_name)).toEqual(["Heavy Oversized Tee", "Heavy Oversized Tee"]);
    const pasted = readPasted("Heavy Tee\ta.jpg|b.jpg\nPlain Cap\thttps://drive.google.com/file/d/1AbC/view\tBlack");
    expect(pasted.rows.map((r) => [r.line, r.cells.product_name, r.cells.image_links, r.cells.variant_or_colour])).toEqual([
      [2, "Heavy Tee", "a.jpg|b.jpg", ""], [3, "Plain Cap", "https://drive.google.com/file/d/1AbC/view", "Black"],
    ]);
    expect(readTable([["name only"]]).fatal).toMatch(/product_name, image_links/);
  });

  it("error file: the row, every column and the reason", () => {
    const row = { line: 4, cells: { line: 4, product_name: "Twin Cap", image_links: "a.jpg" } };
    const text = errorCsv([{ row, errors: ["Row 4: 2 products ke naam same hain, product ID ya SKU bhi daalo"] }]);
    expect(text.split("\r\n")[0]).toBe(["row", ...COLUMNS, "error"].join(","));
    expect(text).toContain('4,Twin Cap,,,a.jpg,,"Row 4: 2 products ke naam same hain, product ID ya SKU bhi daalo"');
  });

  it("Drive photos are downloaded one at a time and named drive-<id>.<ext>; a private one stops the row with its reason", async () => {
    const r = { line: 2, ok: true, errors: [], product: { id: "p1", name: "Heavy Tee" }, target: { kind: "product", label: "Product photos" }, current_photos: 1,
      photos: [{ source: "drive", name: "drive-AAA", drive_id: "AAA", link: "https://drive.google.com/file/d/AAA/view" }, { source: "file", name: "back.jpg" }] } as PhotoAddRowResult;
    const order: string[] = [];
    const download = vi.fn(async (link: string) => { order.push(link); return new Blob(["x"], { type: "image/png" }); });
    const got = await collectRowPhotos(r, [new File(["y"], "BACK.jpg", { type: "image/jpeg" })], download, new Map());
    expect("files" in got && got.files.map((f) => f.name)).toEqual(["drive-AAA.png", "BACK.jpg"]);
    const priv = await collectRowPhotos(r, [], async () => { throw new Error('This Google Drive photo is private. In Drive, set Share > General access to "Anyone with the link" and try again.'); }, new Map());
    expect("error" in priv && priv.error).toMatch(/^Row 2: photo 1: This Google Drive photo is private/);
  });
});

// ─── Add photos: page ────────────────────────────────────────────────────────

describe("Add photos: page", () => {
  const results: PhotoAddRowResult[] = [
    { line: 2, ok: true, errors: [], product: { id: "p1", name: "Heavy Tee" }, target: { kind: "product", label: "Product photos" }, current_photos: 2,
      photos: [{ source: "drive", name: "drive-AAA", drive_id: "AAA", link: "https://drive.google.com/file/d/AAA/view" }] } as PhotoAddRowResult,
    { line: 3, ok: false, errors: [{ field: "product_name", code: "DUPLICATE_NAME", message: "Row 3: 2 products ke naam same hain, product ID ya SKU bhi daalo" }], product: null, target: null, current_photos: null, photos: [] },
    { line: 4, ok: false, errors: [{ field: "image_links", code: "MAX_PHOTOS", message: "Row 4: max 8 photos, abhi 7 hain" }], product: { id: "p4", name: "Full" }, target: { kind: "product", label: "Product photos" }, current_photos: 7, photos: [] },
  ];
  beforeEach(() => {
    routes["POST /seller/products/photos/validate"] = () => json({ rows: results, summary: { rows: 3, ok: 1, errors: 2 } });
    routes["POST /seller/products/import-image"] = () => new Response(new Blob(["png"], { type: "image/png" }), { status: 200, headers: { "content-type": "image/png" } });
    routes["POST /seller/products/photos"] = () => json({ product: product(), pending_fields: ["images"], line: 2, added: 1 }, 202);
  });

  const pasteRows = async () => {
    inPanel(<AddPhotosPage />);
    fireEvent.click(screen.getByRole("button", { name: "Paste or type" }));
    const first = screen.getByLabelText("Row 1 Product name");
    fireEvent.paste(first, { clipboardData: { getData: () => "Heavy Tee\t\t\thttps://drive.google.com/file/d/AAA/view\nTwin Cap\t\t\ta.jpg\nFull\t\t\tb.jpg" } });
    expect((screen.getByLabelText("Row 3 Product name") as HTMLInputElement).value).toBe("Full");
    expect((screen.getByLabelText("Row 1 Photo links or file names") as HTMLInputElement).value).toBe("https://drive.google.com/file/d/AAA/view");
    fireEvent.click(screen.getByRole("button", { name: "Check rows" }));
    await screen.findByText(/Preview: 1 ready, 2 with errors/);
  };

  it("paste table → preview row by row with the backend's errors; only valid rows are sent, Drive photo first imported", async () => {
    await pasteRows();
    const sent = JSON.parse(String(calls.find((c) => c.path === "/seller/products/photos/validate")!.body)).rows;
    expect(sent.map((r: { line: number; product_name: string }) => [r.line, r.product_name])).toEqual([[2, "Heavy Tee"], [3, "Twin Cap"], [4, "Full"]]);
    expect(screen.getByText(/2 products ke naam same hain/)).toBeTruthy();
    expect(screen.getByText("Row 4: max 8 photos, abhi 7 hain")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Send 1 ready row for approval" }));
    expect(await screen.findByText("Sent for approval")).toBeTruthy();
    const posts = calls.filter((c) => c.method === "POST").map((c) => c.path);
    expect(posts.indexOf("/seller/products/import-image")).toBeLessThan(posts.indexOf("/seller/products/photos"));
    expect(posts.filter((p) => p === "/seller/products/photos")).toHaveLength(1);
    const fd = sentForm("POST", "/seller/products/photos");
    expect(JSON.parse(String(fd.get("row"))).line).toBe(2);
    expect((fd.getAll("images") as File[]).map((f) => f.name)).toEqual(["drive-AAA.png"]);
    expect(screen.getByText(/stay live as they are until NOTMADE approves/)).toBeTruthy();
  });

  it("error file is offered for the rows with errors", async () => {
    const created: Blob[] = [];
    vi.stubGlobal("URL", Object.assign(URL, { createObjectURL: (b: Blob) => { created.push(b); return "blob:e"; }, revokeObjectURL: () => {} }));
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    await pasteRows();
    fireEvent.click(screen.getByRole("button", { name: "Download error file" }));
    const text = await readBlob(created.at(-1)!, "text") as string;
    expect(text).toContain("Row 3: 2 products ke naam same hain");
    expect(text).toContain("Row 4: max 8 photos, abhi 7 hain");
    expect(text).not.toContain("Heavy Tee");
    click.mockRestore();
  });

  it("a private Drive link fails that row only, with the share instructions", async () => {
    routes["POST /seller/products/import-image"] = () => json({ error: 'This Google Drive photo is private. In Drive, set Share > General access to "Anyone with the link" and try again.', code: "PRIVATE" }, 422);
    await pasteRows();
    fireEvent.click(screen.getByRole("button", { name: "Send 1 ready row for approval" }));
    expect(await screen.findByText(/Row 2: photo 1: This Google Drive photo is private/)).toBeTruthy();
    expect(calls.some((c) => c.path === "/seller/products/photos")).toBe(false);
  });

  it("agreement gating: a UAE seller without the signed agreement cannot check or send", () => {
    inPanel(<AddPhotosPage />, uaeSeller(false));
    expect(screen.getByText(/Sign your agreement to add photos/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Paste or type" }));
    expect((screen.getByRole("button", { name: "Check rows" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("works for a UAE seller on their own store: same flow", async () => {
    inPanel(<AddPhotosPage />, uaeSeller(true));
    expect(screen.queryByText(/Sign your agreement/)).toBeNull();
    const table = within(document.body);
    expect(table.getByRole("button", { name: "Download Excel template" })).toBeTruthy();
  });
});
