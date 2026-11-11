// Bulk product upload. There is no bulk route on the backend, so the file is read and checked here and
// each good row goes through POST /seller/products, one at a time, like a product added by hand. That
// route needs at least one image file, so rows name their photos and the seller picks those files.
import type { Category } from "./seller-api";
import { EMPTY_LISTING, MAX_PHOTOS, type Listing } from "./product-listing";

export const CSV_HEADERS = ["name", "description", "category", "price", "mrp", "sizes", "stock", "image_files"] as const;
export const MAX_ROWS = 200;

const cell = (v: string) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
export const toCsv = (rows: string[][]) => rows.map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";

/** The template, with one worked example. `|` (or a comma) separates sizes, stock per size, and photo files. */
export function csvTemplate(categories: Category[]): string {
  return toCsv([
    [...CSV_HEADERS],
    ["Example cotton tee", "Soft cotton tee with a relaxed fit. Machine wash cold.", categories[0]?.name ?? "Category name", "999", "1299", "S|M|L", "5|8|3", "tee-front.jpg|tee-back.jpg"],
  ]);
}

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

export interface BulkRow { line: number; raw: string[]; listing: Listing | null; imageFiles: string[]; errors: string[] }

const split = (v: string) => v.split(/[|,]/).map((s) => s.trim()).filter(Boolean);
const whole = (v: string) => /^\d+$/.test(v) && Number(v) <= 100_000;

/** Reads CSV text into rows, each with its own errors. A file-level problem comes back in `fatal`. */
export function readBulkCsv(text: string, categories: Category[]): { rows: BulkRow[]; fatal: string | null } {
  return readBulkTable(parseCsv(text), categories);
}

/** The same checks for any table of cells, first row being the headers (used for CSV and Excel). */
export function readBulkTable(all: string[][], categories: Category[]): { rows: BulkRow[]; fatal: string | null } {
  if (!all.length) return { rows: [], fatal: "This file is empty." };
  const head = all[0].map((h) => h.trim().toLowerCase());
  const missing = CSV_HEADERS.filter((h) => !head.includes(h));
  if (missing.length) return { rows: [], fatal: `Missing column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}. Download the template and keep its header row.` };
  if (all.length === 1) return { rows: [], fatal: "This file has a header row but no products." };
  if (all.length - 1 > MAX_ROWS) return { rows: [], fatal: `Up to ${MAX_ROWS} products per file. This file has ${all.length - 1}.` };

  const byName = new Map(categories.map((c) => [c.name.trim().toLowerCase(), c]));
  const rows = all.slice(1).map((raw, i): BulkRow => {
    const get = (h: (typeof CSV_HEADERS)[number]) => (raw[head.indexOf(h)] ?? "").trim();
    const errors: string[] = [];
    const name = get("name"), description = get("description"), price = get("price"), mrp = get("mrp");
    if (name.length < 2 || name.length > 200) errors.push("Name must be 2 to 200 characters");
    if (description.length < 10 || description.length > 5000) errors.push("Description must be 10 to 5000 characters");
    const category = byName.get(get("category").toLowerCase());
    if (!category) errors.push(`Category "${get("category")}" not found`);
    const p = Number(price);
    if (!(p > 0) || p > 1_000_000) errors.push("Price must be above 0");
    if (mrp && !(Number(mrp) >= p)) errors.push("MRP cannot be lower than price");

    const sizes = split(get("sizes")), stock = split(get("stock"));
    if (new Set(sizes).size !== sizes.length) errors.push("Sizes repeat");
    if (sizes.length > 20) errors.push("Up to 20 sizes");
    if (sizes.some((s) => s.length > 20)) errors.push("Sizes must be under 20 characters");
    if (sizes.length ? stock.length !== sizes.length : stock.length !== 1) errors.push(sizes.length ? "Give one stock number per size" : "Give one stock number");
    if (!stock.every(whole)) errors.push("Stock must be whole numbers");

    const imageFiles = split(get("image_files"));
    if (!imageFiles.length) errors.push("Name at least one photo file");
    if (imageFiles.length > MAX_PHOTOS) errors.push(`Up to ${MAX_PHOTOS} photos`);

    const listing: Listing | null = errors.length ? null : {
      ...EMPTY_LISTING, categoryId: category!.id, name, description, price, mrp,
      hasSizes: sizes.length > 0, sizes: sizes.map((size, j) => ({ size, stock: stock[j] })), stock: sizes.length ? "" : stock[0],
    };
    return { line: i + 2, raw, listing, imageFiles, errors };
  });
  return { rows, fatal: null };
}

/** Photos a row names that the seller has not picked. Matched by file name, ignoring case. */
export function missingPhotos(row: BulkRow, files: File[]): string[] {
  const have = new Set(files.map((f) => f.name.toLowerCase()));
  return row.imageFiles.filter((n) => !have.has(n.toLowerCase()));
}

export function photosFor(row: BulkRow, files: File[]): File[] {
  return row.imageFiles.flatMap((n) => files.find((f) => f.name.toLowerCase() === n.toLowerCase()) ?? []);
}

/** The rows to fix, with the reason in a last column, so the seller can correct and re-upload them. */
export function errorCsv(rows: { row: BulkRow; errors: string[] }[]): string {
  return toCsv([[...CSV_HEADERS, "error"], ...rows.map(({ row, errors }) => [...CSV_HEADERS.map((_, i) => row.raw[i] ?? ""), errors.join("; ")])]);
}
