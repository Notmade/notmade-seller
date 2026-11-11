// Bulk product upload. One file is one category: the seller picks the category first, the backend sends that
// category's columns (GET /seller/bulk/template), and the file is read here into rows keyed by those columns. The
// backend checks every row (POST /seller/bulk/validate) and creates each ready product with POST /seller/bulk/products,
// which runs the same checks again. Photos stay on the seller's device until then, so the one check made only here is
// that every photo a row names has been picked.
import type { BulkColumn, BulkRowInput, BulkTemplate } from "./seller-api";

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

/** Photos a product names that the seller has not picked. Matched by file name, ignoring case. */
export function missingPhotos(names: string[], files: File[]): string[] {
  const have = new Set(files.map((f) => f.name.toLowerCase()));
  return names.filter((n) => !have.has(n.toLowerCase()));
}

export function photosFor(names: string[], files: File[]): File[] {
  return names.flatMap((n) => files.find((f) => f.name.toLowerCase() === n.toLowerCase()) ?? []);
}

/** The rows to fix, in the template's columns with the reason last, so the seller can correct and re-upload them. */
export function errorCsv(columns: BulkColumn[], rows: { row: SheetRow; errors: string[] }[]): string {
  return toCsv([
    ["row", ...columns.map((c) => c.header), "error"],
    ...rows.map(({ row, errors }) => [String(row.line), ...columns.map((c) => String(row.cells[c.key] ?? "")), errors.join("; ")]),
  ]);
}
