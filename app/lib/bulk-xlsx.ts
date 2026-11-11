// Excel (.xlsx) side of the bulk upload. The file is read in the browser and goes through the same row
// checks as a CSV (readBulkTable), then each good row is posted like a product added by hand.
import type { Category } from "./seller-api";
import { CSV_HEADERS, MAX_ROWS, readBulkTable } from "./bulk-csv";

const HEAD_NOTES: Record<(typeof CSV_HEADERS)[number], string> = {
  name: "Product name (2–200 characters)",
  description: "At least 10 characters",
  category: "Pick from the dropdown",
  price: "Selling price in your currency",
  mrp: "Optional. Must not be lower than price",
  sizes: "Optional. Separate with | e.g. S|M|L",
  stock: "One number, or one per size e.g. 5|8|3",
  image_files: "Photo file names, separated by |. You pick the files on the next screen",
};
const WIDTHS = [32, 50, 22, 12, 12, 14, 14, 36];

/** The template: Products sheet with a category dropdown, a worked example, and a How to fill it sheet. */
export async function xlsxTemplate(categories: Category[]): Promise<Blob> {
  const { Workbook } = await import("exceljs");
  const wb = new Workbook();
  const ws = wb.addWorksheet("Products", { views: [{ state: "frozen", ySplit: 1 }] });
  const lists = wb.addWorksheet("Lists", { state: "hidden" });
  categories.forEach((c, i) => { lists.getCell(i + 1, 1).value = c.name; });

  ws.columns = CSV_HEADERS.map((h, i) => ({ header: h, key: h, width: WIDTHS[i] }));
  ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF111111" } };
  CSV_HEADERS.forEach((h, i) => { ws.getCell(1, i + 1).note = HEAD_NOTES[h]; });
  ws.addRow({
    name: "Example cotton tee", description: "Soft cotton tee with a relaxed fit. Machine wash cold.",
    category: categories[0]?.name ?? "", price: 999, mrp: 1299, sizes: "S|M|L", stock: "5|8|3", image_files: "tee-front.jpg|tee-back.jpg",
  });
  ws.getRow(2).font = { italic: true, color: { argb: "FF888888" } };

  // Text format keeps "5|8|3" and size names like "10" as typed
  for (const col of [6, 7, 8]) ws.getColumn(col).numFmt = "@";
  if (categories.length) {
    for (let r = 2; r <= MAX_ROWS + 1; r++) {
      ws.getCell(r, 3).dataValidation = {
        type: "list", allowBlank: true, showErrorMessage: true, errorTitle: "Category", error: "Pick a category from the list",
        formulae: [`Lists!$A$1:$A$${categories.length}`],
      };
    }
  }

  const how = wb.addWorksheet("How to fill it");
  how.getColumn(1).width = 110;
  [
    "How to fill this template",
    "",
    "1. One row per product. Delete the grey example row (row 2) before you upload.",
    "2. Category: choose from the dropdown. It must match your category list exactly.",
    "3. Price and MRP are in your own currency. MRP is optional but cannot be lower than price.",
    "4. Sizes and stock: separate with | (S|M|L and 5|8|3). Products without sizes need a single stock number.",
    "5. Photos: write the file names here (tee-front.jpg|tee-back.jpg). On the upload screen you pick the same files from your phone or computer. Each product needs 1 to 8 photos (jpg, png or webp, up to 8MB each).",
    `6. Up to ${MAX_ROWS} products per file. Do not rename or reorder the columns.`,
    "7. Upload the file in Catalogue > Bulk upload. Every product is checked, then you submit them all with one click. NOTMADE reviews each product before it goes live.",
  ].forEach((t, i) => { how.getCell(i + 1, 1).value = t; how.getCell(i + 1, 1).alignment = { wrapText: true, vertical: "top" }; });
  how.getCell(1, 1).font = { bold: true, size: 14 };

  const buf = await wb.xlsx.writeBuffer();
  return new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

/** Reads the first sheet (or one called Products). Cell text is used as shown, so numbers and dates stay as typed. */
export async function readBulkXlsx(data: ArrayBuffer, categories: Category[]) {
  const { Workbook } = await import("exceljs");
  const wb = new Workbook();
  try { await wb.xlsx.load(data); } catch { return { rows: [], fatal: "This file could not be read. Save it as an Excel (.xlsx) file and try again." }; }
  const ws = wb.getWorksheet("Products") ?? wb.worksheets.find((w) => w.state === "visible") ?? wb.worksheets[0];
  if (!ws) return { rows: [], fatal: "This file has no sheets." };
  const width = CSV_HEADERS.length + 2;
  const table: string[][] = [];
  ws.eachRow({ includeEmpty: false }, (row) => {
    const cells: string[] = [];
    for (let c = 1; c <= Math.max(width, row.cellCount); c++) cells.push((row.getCell(c).text ?? "").trim());
    if (cells.some((v) => v !== "")) table.push(cells);
  });
  return readBulkTable(table, categories);
}
