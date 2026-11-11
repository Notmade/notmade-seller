// Bulk product upload. One file is one category: the seller picks the category first, the backend sends that
// category's columns (GET /seller/bulk/template), and the file is read here into rows keyed by those columns. The
// backend checks every row (POST /seller/bulk/validate) and creates each ready product with POST /seller/bulk/products,
// which runs the same checks again. Photos are either files on the seller's device, checked here against the files
// picked, or public Google Drive links, downloaded one at a time through the backend when the product is sent.
import { ApiError, type BulkColumn, type BulkPhoto, type BulkProductResult, type BulkRowError, type BulkRowInput, type BulkTemplate } from "./seller-api";

export const MAX_ROWS = 200;

const cell = (v: string) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
export const toCsv = (rows: string[][]) => rows.map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";

/** RFC 4180: quotes, doubled quotes, commas and line breaks inside quotes, CRLF, and a leading BOM. */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [], field = "", quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c !== '"') field += c;
      else if (src[i + 1] === '"') { field += '"'; i++; }
      else quoted = false;
    } else if (c === '"' && field === "") quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

/** Worked examples for the template: two size and colour rows of one product, or one product without sizes. */
export function exampleRows(t: BulkTemplate): Record<string, string>[] {
  const base = { category: t.category.name, price: t.currency === "AED" ? "79" : "999", mrp: t.currency === "AED" ? "99" : "1299" };
  if (t.uses_sizes) {
    const sizes = t.size_set?.sizes ?? [];
    const [a, b] = [sizes[Math.min(2, sizes.length - 1)] ?? "", sizes[Math.min(3, sizes.length - 1)] ?? ""];
    const first = {
      ...base, variant_group: "EX-001", name: `Example ${t.category.name.toLowerCase()}`, description: "Soft cotton with a relaxed fit. Machine wash cold.",
      colour: "Black", size: a, fit: t.fit_values[0] ?? "", stock: "5", sku: `EX-001-BLK-${a}`.replace(/\s+/g, ""), image_files: "front.jpg|back.jpg",
    };
    return [first, { category: t.category.name, variant_group: "EX-001", colour: "Black", size: b, stock: "3", sku: `EX-001-BLK-${b}`.replace(/\s+/g, "") }];
  }
  return [{
    ...base, name: `Example ${t.category.name.toLowerCase()}`, description: "What it is, what it is made of, and what is in the box.", stock: "10",
    image_files: "front.jpg|side.jpg", ...(t.who_ships ? { who_ships: t.who_ships[0].value } : {}),
  }];
}

/** The CSV template: the header row, then the examples. The category is filled in on every example row. */
export function csvTemplate(t: BulkTemplate): string {
  return toCsv([t.columns.map((c) => c.header), ...exampleRows(t).map((r) => t.columns.map((c) => r[c.key] ?? ""))]);
}

/** "price (INR)" → { key: "price", unit: "INR" }; "Variant group" → { key: "variant_group" }. */
export function headerKey(h: string): { key: string; unit: string | null } {
  const m = h.trim().match(/^(.*?)\s*\(([^)]*)\)\s*$/);
  const name = (m ? m[1] : h).trim().toLowerCase().replace(/[\s-]+/g, "_");
  return { key: name === "color" ? "colour" : name, unit: m ? m[2].trim().toUpperCase() : null };
}

export interface SheetRow { line: number; cells: BulkRowInput; raw: string[] }

/** Shown for the template from before one file was one category. The whole file is refused, with no row errors. */
export const OLD_TEMPLATE_MESSAGE = "Yeh purana template hai. Category chunkar naya template download karein.";

/**
 * The old template: a `sizes` column (sizes and stock per size in one cell), or prices with no currency in the header.
 * Every new template names its currency, as in "price (INR)", and has no `sizes` column.
 */
export function isOldTemplate(headers: string[]): boolean {
  const head = headers.map(headerKey);
  if (head.some((h) => h.key === "sizes" || h.key === "stock_by_size")) return true;
  return head.some((h) => (h.key === "price" || h.key === "mrp") && !h.unit);
}

// Columns the backend refuses on a category without sizes. Sent on, so the reason comes back with the row
const PASS_THROUGH = ["size", "colour", "fit", "variant_group", "sku", "who_ships"];

/**
 * Reads a table of cells (first row = headers) against the chosen category's columns. A file-level problem comes back in
 * `fatal`: a missing column, prices in another currency, or more than 200 products. Rows with nothing in them (or only
 * the locked category) are skipped.
 */
export function readBulkTable(all: string[][], t: BulkTemplate): { rows: SheetRow[]; fatal: string | null } {
  if (!all.length) return { rows: [], fatal: "This file is empty." };
  if (isOldTemplate(all[0])) return { rows: [], fatal: OLD_TEMPLATE_MESSAGE };
  const head = all[0].map(headerKey);
  const index = new Map<string, number>();
  head.forEach((h, i) => { if (h.key && !index.has(h.key)) index.set(h.key, i); });

  const missing = t.columns.filter((c) => c.required && !index.has(c.key)).map((c) => c.header);
  if (missing.length) {
    return { rows: [], fatal: `Missing column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}. Download the ${t.category.name} template and keep its header row.` };
  }
  const priced = head.find((h) => (h.key === "price" || h.key === "mrp") && h.unit && h.unit !== t.currency);
  if (priced) return { rows: [], fatal: `This file has prices in ${priced.unit}. Your prices are in ${t.currency}: download the template again.` };

  const keys = Array.from(new Set([...t.columns.map((c) => c.key), ...PASS_THROUGH])).filter((k) => index.has(k));
  const rows: SheetRow[] = [];
  all.slice(1).forEach((raw, i) => {
    const cells: BulkRowInput = { line: i + 2 };
    for (const k of keys) cells[k] = (raw[index.get(k)!] ?? "").trim();
    const filled = keys.some((k) => k !== "category" && String(cells[k] ?? "") !== "");
    if (filled) rows.push({ line: i + 2, cells, raw });
  });
  if (!rows.length) return { rows: [], fatal: "This file has a header row but no products." };
  if (rows.length > MAX_ROWS) return { rows: [], fatal: `Up to ${MAX_ROWS} products per file. This file has ${rows.length} rows.` };
  return { rows, fatal: null };
}

export function readBulkCsv(text: string, t: BulkTemplate) {
  return readBulkTable(parseCsv(text), t);
}

export const photoNames = (v: string | number | undefined) => String(v ?? "").split(/[|,]/).map((s) => s.trim()).filter(Boolean);

/** A product's photos as the backend read them; an older backend sends only image_files, which are all files then. */
export const photosOf = (p: BulkProductResult): BulkPhoto[] => p.photos ?? p.image_files.map((name) => ({ source: "file" as const, name }));
export const drivePhotos = (p: BulkProductResult) => photosOf(p).filter((x) => x.source === "drive");

/** Photo files a product names that the seller has not picked. Matched by file name, ignoring case. Drive photos need no pick. */
export function missingPhotos(p: BulkProductResult, files: File[]): string[] {
  const have = new Set(files.map((f) => f.name.toLowerCase()));
  return photosOf(p).filter((x) => x.source === "file" && !have.has(x.name.toLowerCase())).map((x) => x.name);
}

/** The error a row shows, in the backend's own shape, for a check made here. */
export const rowError = (field: string, code: string, message: string): BulkRowError => ({ field, code, message });
export const photoNotChosen = (missing: string[]) =>
  rowError("image_files", "PHOTO_NOT_CHOSEN", `Photo not chosen: ${missing.join(", ")}. Pick ${missing.length === 1 ? "this file" : "these files"} in step 4, or use a public Google Drive link`);

/**
 * Every photo of one product in sheet order: picked files as they are, Drive photos downloaded one at a time and named
 * drive-<id>.<ext>, which is how the backend matches them. A Drive photo that fails stops here with its reason.
 * `cache` keeps photos already downloaded, so a retry does not download them again.
 */
export async function collectPhotos(
  p: BulkProductResult, files: File[], download: (link: string) => Promise<Blob>, cache: Map<string, File>,
  onPhoto?: (done: number, total: number) => void,
): Promise<{ files: File[] } | { error: BulkRowError }> {
  const photos = photosOf(p);
  const drive = photos.filter((x) => x.source === "drive");
  const out: File[] = [];
  let fetched = 0;
  for (let i = 0; i < photos.length; i++) {
    const x = photos[i];
    if (x.source === "file") {
      const f = files.find((ff) => ff.name.toLowerCase() === x.name.toLowerCase());
      if (!f) return { error: photoNotChosen([x.name]) };
      out.push(f);
      continue;
    }
    if (x.source !== "drive") return { error: rowError("image_files", x.code ?? "PHOTO_LINK", `Photo ${i + 1}: this link cannot be used`) };
    let f = cache.get(x.name);
    if (!f) {
      try {
        const blob = await download(x.link ?? x.name);
        const ext = DRIVE_EXT[blob.type] ?? "jpg";
        f = new File([blob], `${x.name}.${ext}`, { type: blob.type || "image/jpeg" });
        cache.set(x.name, f);
      } catch (err) {
        const code = err instanceof ApiError && typeof err.data.code === "string" ? err.data.code : "DRIVE_IMPORT_FAILED";
        const why = err instanceof Error ? err.message : "We could not download this photo from Google Drive. Try again.";
        return { error: rowError("image_files", code, `Photo ${i + 1}: ${why}`) };
      }
    }
    out.push(f);
    onPhoto?.(++fetched, drive.length);
  }
  return { files: out };
}
const DRIVE_EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/** The rows to fix, in the template's columns with the reason last, so the seller can correct and re-upload them. */
export function errorCsv(columns: BulkColumn[], rows: { row: SheetRow; errors: (string | BulkRowError)[] }[]): string {
  const header = (field: string) => columns.find((c) => c.key === field)?.header ?? field;
  const text = (e: string | BulkRowError) => (typeof e === "string" ? e : `${header(e.field)}: ${e.message}`);
  return toCsv([
    ["row", ...columns.map((c) => c.header), "error"],
    ...rows.map(({ row, errors }) => [String(row.line), ...columns.map((c) => String(row.cells[c.key] ?? "")), errors.map(text).join("; ")]),
  ]);
}

/** "Row 5 · image_files: Photo 1: This Google Drive photo is private. ..." — one line per error, for the screen and support. */
export const rowErrorLine = (line: number, e: BulkRowError) => `Row ${line} · ${e.field}: ${e.message}`;
