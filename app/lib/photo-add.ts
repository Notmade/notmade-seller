// "Add photos to existing products": a sheet of product_name + image_links (optional product_id, sku, variant_or_colour)
// adds photos to the seller's own approved products. Not the one-category bulk upload: this only touches products that
// already exist. The backend matches and checks every row (POST /seller/products/photos/validate), and each valid row is
// sent on its own (POST /seller/products/photos) as a change that waits for NOTMADE's approval; the listing stays live.
import { ApiError, type BulkRowError, type PhotoAddRowInput, type PhotoAddRowResult } from "./seller-api";
import { parseCsv, toCsv } from "./bulk-csv";

export const COLUMNS = ["product_name", "product_id", "sku", "image_links", "variant_or_colour"] as const;
export type PhotoColumn = (typeof COLUMNS)[number];
export const REQUIRED: PhotoColumn[] = ["product_name", "image_links"];
export const MAX_ROWS = 200;
export const MAX_PHOTOS = 8;
export const NOTE = "up to 8 photo links, separated by | with no spaces; Google Drive links must be shared as Anyone with the link; file links only, not folders";

const HEADER_NOTES: Record<PhotoColumn, string> = {
  product_name: "Required. The product's name exactly as in your catalogue (capital letters and extra spaces do not matter).",
  product_id: "Optional. Needed only when two of your products have the same name. Copy it from the product in Catalogue.",
  sku: "Optional. A SKU of the product: picks the product when two names are the same, and puts the photos on that SKU's colour.",
  image_links: `Required. ${NOTE}. You can also write photo file names (front.jpg|back.jpg) and pick the files on the screen.`,
  variant_or_colour: "Optional. A colour (for example Black) or SKU of the product: the photos go on that colour or SKU. Blank = the product's own photos.",
};
const WIDTH: Record<PhotoColumn, number> = { product_name: 34, product_id: 38, sku: 18, image_links: 70, variant_or_colour: 20 };
const EXAMPLE: Record<PhotoColumn, string>[] = [
  { product_name: "Heavy Oversized Tee", product_id: "", sku: "", image_links: "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz012345/view?usp=sharing|back.jpg", variant_or_colour: "" },
  { product_name: "Heavy Oversized Tee", product_id: "", sku: "", image_links: "black-front.jpg|black-back.jpg", variant_or_colour: "Black" },
];

export const instructionLines = () => [
  "Add photos to products you already have",
  "",
  "1. One row per product (or per colour of a product). Write the product_name exactly as it is in your Catalogue.",
  `2. image_links: ${NOTE}.`,
  "3. Google Drive: open each photo in Drive, Share > General access > \"Anyone with the link\", then Copy link. Use the link of one photo file, not a folder.",
  "4. Or write the photo file names (front.jpg|back.jpg) and pick those files on the screen. jpg, png or webp, up to 8MB each.",
  "5. Photos are added after the photos the product already has. Nothing is removed. A product can have up to 8 photos in all.",
  "6. Two products with the same name: fill product_id or sku too.",
  "7. variant_or_colour (optional): a colour or SKU of the product puts the photos on that colour or SKU.",
  "8. NOTMADE approves the new photos before customers see them. Your product stays live as it is until then.",
  `9. Up to ${MAX_ROWS} rows per file. Do not rename the columns.`,
];

/** CSV template: the header, the note on a "#" line (skipped when the file is read), and the example rows. */
export function csvTemplate(): string {
  return toCsv([[...COLUMNS], [`# Note: ${NOTE}. Delete the example rows below.`], ...EXAMPLE.map((r) => COLUMNS.map((c) => r[c]))]);
}

/** Excel template: Photos (empty, header notes), Example, Instructions. No sheet protection. */
export async function xlsxTemplate(): Promise<Blob> {
  const { Workbook } = await import("exceljs");
  const wb = new Workbook();
  const ws = wb.addWorksheet("Photos", { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = COLUMNS.map((c) => ({ header: c, key: c, width: WIDTH[c] }));
  ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF111111" } };
  COLUMNS.forEach((c, i) => {
    ws.getCell(1, i + 1).note = HEADER_NOTES[c];
    ws.getColumn(i + 1).numFmt = "@"; // product ids and SKUs stay as typed
  });
  const ex = wb.addWorksheet("Example");
  ex.columns = COLUMNS.map((c) => ({ header: c, key: c, width: WIDTH[c] }));
  ex.getRow(1).font = { bold: true };
  EXAMPLE.forEach((r) => ex.addRow(r));
  const how = wb.addWorksheet("Instructions");
  how.getColumn(1).width = 110;
  instructionLines().forEach((line, i) => {
    const cell = how.getCell(i + 1, 1);
    cell.value = line;
    cell.alignment = { wrapText: true, vertical: "top" };
  });
  how.getCell(1, 1).font = { bold: true, size: 14 };
  const buf = await wb.xlsx.writeBuffer();
  return new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

const headerKey = (h: string) => h.trim().toLowerCase().replace(/[\s/-]+/g, "_").replace(/[^a-z_]/g, "");
const ALIASES: Record<string, PhotoColumn> = { product: "product_name", name: "product_name", product_id_sku: "product_id", id: "product_id", photos: "image_links", image_files: "image_links", links: "image_links", colour: "variant_or_colour", color: "variant_or_colour", variant: "variant_or_colour", variant_or_color: "variant_or_colour" };

export interface PhotoSheetRow { line: number; cells: PhotoAddRowInput }

/** A table (first row = headers) → rows keyed by column, with the sheet's own line numbers. */
export function readTable(all: string[][]): { rows: PhotoSheetRow[]; fatal: string | null } {
  const [head, ...body] = all;
  if (!head) return { rows: [], fatal: "This sheet is empty." };
  const keys = head.map((h) => { const k = headerKey(h); return (COLUMNS as readonly string[]).includes(k) ? (k as PhotoColumn) : ALIASES[k] ?? null; });
  const missing = REQUIRED.filter((c) => !keys.includes(c));
  if (missing.length) return { rows: [], fatal: `This sheet needs the column${missing.length > 1 ? "s" : ""} ${missing.join(", ")}. Download the template to see the columns.` };
  const rows: PhotoSheetRow[] = [];
  body.forEach((r, i) => {
    if (!r.some((v) => String(v ?? "").trim()) || String(r[0] ?? "").trim().startsWith("#")) return;
    const cells: PhotoAddRowInput = { line: i + 2 };
    keys.forEach((k, j) => { if (k) cells[k] = String(r[j] ?? "").trim(); });
    rows.push({ line: i + 2, cells });
  });
  if (!rows.length) return { rows, fatal: "This sheet has no rows." };
  if (rows.length > MAX_ROWS) return { rows: [], fatal: `Up to ${MAX_ROWS} rows per sheet. This sheet has ${rows.length}.` };
  return { rows, fatal: null };
}

export const readCsv = (text: string) => readTable(parseCsv(text));

/** Text pasted from Excel or Google Sheets (tab-separated), or CSV. A first line without the headers gets the default columns. */
export function readPasted(text: string): { rows: PhotoSheetRow[]; fatal: string | null } {
  const lines = text.replace(/\r\n?/g, "\n").split("\n").filter((l) => l.trim());
  if (!lines.length) return { rows: [], fatal: "Paste at least one row." };
  const table = lines.some((l) => l.includes("\t")) ? lines.map((l) => l.split("\t")) : parseCsv(lines.join("\n"));
  const hasHeader = table[0].some((h) => headerKey(h) === "product_name" || headerKey(h) === "image_links");
  return readTable(hasHeader ? table : [["product_name", "image_links", "variant_or_colour"], ...table]);
}

/** The Photos sheet of an .xlsx (or the first visible sheet). Cell text is used as shown. */
export async function readXlsx(data: ArrayBuffer): Promise<{ rows: PhotoSheetRow[]; fatal: string | null }> {
  const { Workbook } = await import("exceljs");
  const wb = new Workbook();
  try { await wb.xlsx.load(data); } catch { return { rows: [], fatal: "This file could not be read. Save it as an Excel (.xlsx) file and try again." }; }
  const ws = wb.getWorksheet("Photos") ?? wb.worksheets.find((w) => w.state === "visible") ?? wb.worksheets[0];
  if (!ws) return { rows: [], fatal: "This file has no sheets." };
  const table: string[][] = [];
  ws.eachRow({ includeEmpty: false }, (row, n) => {
    const cells: string[] = [];
    for (let c = 1; c <= Math.max(COLUMNS.length + 2, row.cellCount); c++) {
      const cell = row.getCell(c);
      const v = cell.value as { hyperlink?: string; text?: string } | null;
      cells.push(String((v && typeof v === "object" && "hyperlink" in v ? v.text ?? v.hyperlink : cell.text) ?? "").trim());
    }
    while (table.length < n - 1) table.push([""]);
    table.push(cells);
  });
  return readTable(table);
}

/** The rows to fix, in the template's columns with the reason last, so the seller can correct and upload them again. */
export function errorCsv(rows: { row: PhotoSheetRow; errors: (string | BulkRowError)[] }[]): string {
  const text = (e: string | BulkRowError) => (typeof e === "string" ? e : e.message);
  return toCsv([
    ["row", ...COLUMNS, "error"],
    ...rows.map(({ row, errors }) => [String(row.line), ...COLUMNS.map((c) => String(row.cells[c] ?? "")), errors.map(text).join("; ")]),
  ]);
}

/** File names a row names that the seller has not picked (Drive links need no pick). */
export function missingFiles(r: PhotoAddRowResult, files: File[]): string[] {
  const have = new Set(files.map((f) => f.name.toLowerCase()));
  return r.photos.filter((p) => p.source === "file" && !have.has(p.name.toLowerCase())).map((p) => p.name);
}

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/**
 * One row's photos in the row's order: picked files as they are, Google Drive photos downloaded one at a time through
 * the backend (Google hosts only, 8MB, checked bytes) and named drive-<id>.<ext>, which is how the backend matches them.
 */
export async function collectRowPhotos(
  r: PhotoAddRowResult, files: File[], download: (link: string) => Promise<Blob>, cache: Map<string, File>,
): Promise<{ files: File[] } | { error: string }> {
  const out: File[] = [];
  for (let i = 0; i < r.photos.length; i++) {
    const p = r.photos[i];
    if (p.source === "file") {
      const f = files.find((x) => x.name.toLowerCase() === p.name.toLowerCase());
      if (!f) return { error: `Row ${r.line}: photo ${i + 1} (${p.name}) choose nahi ki. Upar files chunein.` };
      out.push(f);
      continue;
    }
    if (p.source !== "drive") return { error: `Row ${r.line}: photo ${i + 1}: ye link use nahi ho sakta` };
    let f = cache.get(p.name);
    if (!f) {
      try {
        const blob = await download(p.link ?? p.name);
        f = new File([blob], `${p.name}.${EXT[blob.type] ?? "jpg"}`, { type: blob.type || "image/jpeg" });
        cache.set(p.name, f);
      } catch (err) {
        const why = err instanceof ApiError || err instanceof Error ? err.message : "We could not download this photo from Google Drive. Try again.";
        return { error: `Row ${r.line}: photo ${i + 1}: ${why}` };
      }
    }
    out.push(f);
  }
  return { files: out };
}

export function download(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
