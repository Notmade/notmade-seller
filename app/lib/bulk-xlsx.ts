// Excel (.xlsx) side of the bulk upload. The template is built for one category from the backend's column list: the
// category is filled in, sizes, fit and who ships are dropdowns, and the examples sit on their own sheet so the Products
// sheet starts empty. No sheet is protected: a protected sheet blocked sellers typing more photo links, adding rows past
// the template's last row and inserting rows. The category is held by the backend instead, which refuses any row whose
// category is blank or not the chosen one (CATEGORY_MISMATCH), on preview and on submit. The file is read in the browser into the same rows as a CSV (readBulkTable).
import type { BulkTemplate } from "./seller-api";
import { MAX_ROWS, exampleRows, readBulkTable } from "./bulk-csv";

const WIDTH: Record<string, number> = {
  category: 22, variant_group: 16, name: 32, description: 50, colour: 14, size: 10, fit: 12, stock: 10, sku: 20,
  price: 14, mrp: 14, image_files: 36, who_ships: 16,
};
const META = "Meta";
/** Rows below the header that get the category filled in and the dropdowns. More than MAX_ROWS, so a seller can space
 * products out; the file is still read up to MAX_ROWS products. Rows past this are plain cells, as editable as these. */
export const TEMPLATE_ROWS = 500;

/** The lines of the Instructions sheet. No rate is written here: rates are on screen and in the seller's agreement. */
export function instructionLines(t: BulkTemplate): string[] {
  const has = (k: string) => t.columns.some((c) => c.key === k);
  const steps = [
    `This file is for ${t.category.name} only. The category column is filled in: do not change it. A row with another category, or none, is refused. For another category, choose it on the Bulk upload screen and download its own template.`,
    t.uses_sizes
      ? "One row per size and colour. Rows of one product share a variant_group code (for example TEE-001). Name, description, fit, price, MRP and photos go on the first row of the group; later rows can leave them blank."
      : `One row per product. ${t.category.name} has no sizes, so there is no size column.`,
    ...(t.uses_sizes ? [`Size: pick from the dropdown (${t.size_set?.label ?? "sizes"}). Colour is required on every row. Fit is optional.`] : []),
    `Price and MRP are in ${t.currency}. MRP is optional but cannot be lower than price. Stock is a whole number.`,
    ...(has("sku") ? ["SKU is optional. It must not repeat in this file or match one of your existing products."] : []),
    ...(has("who_ships") ? ["Who ships: pick NOTMADE ships or I ship for each product."] : []),
    `Photos: in image_files, up to ${t.limits.max_photos} photo links or file names, separated by | with no spaces. Write either the file names (front.jpg|back.jpg), which you pick on the upload screen from your phone or computer, or public Google Drive file links (https://drive.google.com/file/d/.../view). Each product needs ${t.limits.min_photos} to ${t.limits.max_photos} photos (jpg, png or webp, up to 8MB each).`,
    "Google Drive links: open each photo in Drive, set Share > General access to \"Anyone with the link\", then Copy link. Use the link of each photo file, not of a folder. iPhone HEIC photos do not work: save them as jpg first. Any other kind of link (Dropbox, Instagram, websites) does not work.",
    `Up to ${MAX_ROWS} rows per file. Do not rename or reorder the columns. The Example sheet shows filled-in rows.`,
    "Upload the file in Catalogue > Bulk upload. Every row is checked and you see any errors before anything is sent. Then you submit the ready products with one click. NOTMADE reviews each product before it goes live.",
    "Commission and settlement: the rates that apply to this category are shown on the Bulk upload screen and in your signed seller agreement.",
  ];
  return [`How to fill this template: ${t.category.name}`, "", ...steps.map((line, i) => `${i + 1}. ${line}`)];
}

/** The template for one category: Products (empty, category locked), Example, Instructions and hidden lists. */
export async function xlsxTemplate(t: BulkTemplate): Promise<Blob> {
  const { Workbook } = await import("exceljs");
  const wb = new Workbook();
  const ws = wb.addWorksheet("Products", { views: [{ state: "frozen", ySplit: 1 }] });
  const lists = wb.addWorksheet("Lists", { state: "hidden" });
  const meta = wb.addWorksheet(META, { state: "veryHidden" });
  meta.getCell("A1").value = "category_id"; meta.getCell("B1").value = t.category.id;
  meta.getCell("A2").value = "category"; meta.getCell("B2").value = t.category.name;
  meta.getCell("A3").value = "currency"; meta.getCell("B3").value = t.currency;

  ws.columns = t.columns.map((c) => ({ header: c.header, key: c.key, width: WIDTH[c.key] ?? 16 }));
  ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF111111" } };
  t.columns.forEach((c, i) => { ws.getCell(1, i + 1).note = `${c.required ? "Required. " : ""}${c.note}`; });

  let listCol = 0;
  t.columns.forEach((c, i) => {
    const col = i + 1;
    // Text format keeps sizes like "10" and SKUs like "007" as typed
    if (c.type !== "number") ws.getColumn(col).numFmt = "@";
    let formula: string | null = null;
    if (c.type === "list" && c.values?.length) {
      listCol++;
      const letter = String.fromCharCode(64 + listCol);
      c.values.forEach((v, j) => { lists.getCell(j + 1, listCol).value = v; });
      formula = `Lists!$${letter}$1:$${letter}$${c.values.length}`;
    }
    for (let r = 2; r <= TEMPLATE_ROWS + 1; r++) {
      const target = ws.getCell(r, col);
      if (c.type === "locked") {
        target.value = c.value ?? t.category.name;
        target.font = { color: { argb: "FF666666" } };
        continue;
      }
      if (formula) {
        target.dataValidation = {
          type: "list", allowBlank: !c.required, showErrorMessage: true, errorTitle: c.header, error: `Pick ${c.header} from the list`, formulae: [formula],
        };
      } else if (c.type === "number") {
        target.dataValidation = {
          type: "decimal", operator: "between", allowBlank: true, showErrorMessage: true, errorTitle: c.header,
          error: c.key === "stock" ? `Stock is a whole number from 0 to ${t.limits.max_stock}` : `Above 0 and up to ${t.limits.max_price} ${t.currency}`,
          formulae: c.key === "stock" ? [0, t.limits.max_stock] : [0.01, t.limits.max_price],
        };
      }
    }
  });

  const ex = wb.addWorksheet("Example");
  ex.columns = t.columns.map((c) => ({ header: c.header, key: c.key, width: WIDTH[c.key] ?? 16 }));
  ex.getRow(1).font = { bold: true };
  exampleRows(t).forEach((r) => ex.addRow(r));
  ex.addRow({});
  ex.addRow({ [t.columns[1]?.key ?? "name"]: "Example only. Fill in the Products sheet, not this one." }).font = { italic: true, color: { argb: "FF888888" } };

  const how = wb.addWorksheet("Instructions");
  how.getColumn(1).width = 110;
  instructionLines(t).forEach((line, i) => {
    const c = how.getCell(i + 1, 1);
    c.value = line;
    c.alignment = { wrapText: true, vertical: "top" };
  });
  how.getCell(1, 1).font = { bold: true, size: 14 };

  const buf = await wb.xlsx.writeBuffer();
  return new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

/**
 * Reads the Products sheet. A template made for another category is refused here; the backend refuses any row whose
 * category is not the chosen one as well. Cell text is used as shown, so numbers and sizes stay as typed.
 */
export async function readBulkXlsx(data: ArrayBuffer, t: BulkTemplate) {
  const { Workbook } = await import("exceljs");
  const wb = new Workbook();
  try { await wb.xlsx.load(data); } catch { return { rows: [], fatal: "This file could not be read. Save it as an Excel (.xlsx) file and try again." }; }
  // The old template has no Meta sheet; readBulkTable then knows it by its headers. A new template that lost the hidden
  // sheet (some editors drop it) still reads, by its headers
  const meta = wb.getWorksheet(META);
  const fileCategory = meta ? String(meta.getCell("B1").value ?? "") : "";
  if (fileCategory && fileCategory !== t.category.id) {
    const name = String(meta?.getCell("B2").value ?? "another category");
    return { rows: [], fatal: `This file is the template for ${name}. Choose ${name} above, or download the ${t.category.name} template.` };
  }
  const ws = wb.getWorksheet("Products") ?? wb.worksheets.find((w) => w.state === "visible") ?? wb.worksheets[0];
  if (!ws) return { rows: [], fatal: "This file has no sheets." };
  const width = t.columns.length + 4;
  const table: string[][] = [];
  ws.eachRow({ includeEmpty: false }, (row, n) => {
    const cells: string[] = [];
    for (let c = 1; c <= Math.max(width, row.cellCount); c++) cells.push((row.getCell(c).text ?? "").trim());
    // Keep the sheet's own row number: pad skipped rows so errors point at the right line
    while (table.length < n - 1) table.push([]);
    table.push(cells);
  });
  const res = readBulkTable(table.map((r) => (r.length ? r : [""])), t);
  return res;
}
