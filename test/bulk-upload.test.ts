// @vitest-environment node
// The category-locked bulk template and the file reader. Fixtures are real GET /seller/bulk/template responses from the
// backend's test harness (test/fixtures/bulk-templates.json): India HOODIES and HOME DECOR on IN-2026-11-v2, UAE LAPTOPS and
// HOODIES on AE-2026-11-v3. These are live production categories; HOME DECOR is in no commission map, as in production.
import { describe, expect, it } from "vitest";
import { Workbook } from "exceljs";
import fixtures from "./fixtures/bulk-templates.json";
import type { BulkTemplate } from "@/app/lib/seller-api";
import { TEMPLATE_ROWS, xlsxTemplate, readBulkXlsx, instructionLines } from "@/app/lib/bulk-xlsx";
import { OLD_TEMPLATE_MESSAGE, collectPhotos, csvTemplate, errorCsv, headerKey, isOldTemplate, missingPhotos, parseCsv, photosOf, readBulkCsv, readBulkTable, rowErrorLine } from "@/app/lib/bulk-csv";
import { ApiError, type BulkProductResult } from "@/app/lib/seller-api";
import { commissionView } from "@/app/lib/bulk-commission";

const T = fixtures as unknown as Record<"in_hoodies" | "in_home_decor" | "ae_laptops" | "ae_hoodies", BulkTemplate>;
const photo = (name: string) => new File(["x"], name, { type: "image/jpeg" });

async function workbook(t: BulkTemplate) {
  const wb = new Workbook();
  await wb.xlsx.load(await (await xlsxTemplate(t)).arrayBuffer());
  return wb;
}
const headers = (wb: Workbook) => (wb.getWorksheet("Products")!.getRow(1).values as unknown[]).slice(1);

describe("category lock", () => {
  // Sellers hit "The cell you are trying to change is on a protected sheet" adding photo links and rows. No sheet is
  // protected now; the backend refuses a row of another category (or none), so the category is held there
  for (const key of ["in_hoodies", "in_home_decor"] as const) {
    it(`${key}: no sheet is protected, the category is filled in on ${TEMPLATE_ROWS} rows, every data cell is editable`, async () => {
      const t = T[key];
      const wb = await workbook(t);
      for (const w of wb.worksheets) {
        expect((w as unknown as { sheetProtection?: unknown }).sheetProtection ?? null, w.name).toBeNull();
      }
      const ws = wb.getWorksheet("Products")!;
      expect(ws.getCell("A1").value).toBe("category");
      const imageCol = t.columns.findIndex((c) => c.key === "image_files") + 1;
      for (const r of [2, 201, 202, 301, TEMPLATE_ROWS + 1]) expect(ws.getCell(r, 1).value).toBe(t.category.name);
      expect(ws.getCell(TEMPLATE_ROWS + 2, 1).value).toBeNull();
      // Dropdowns and number checks reach row 301 and past, on the same rows as the category
      const sizeCol = t.columns.findIndex((c) => c.type === "list") + 1;
      if (sizeCol > 0) expect(ws.getCell(TEMPLATE_ROWS + 1, sizeCol).dataValidation?.type).toBe("list");
      expect(ws.getCell(1, imageCol).note).toMatch(/Up to 8 photo links or file names, separated by \| with no spaces/);
      // Eight Drive links in one image_files cell on row 301 read back whole
      const links = Array.from({ length: 8 }, (_, i) => `https://drive.google.com/file/d/${"a".repeat(25)}${i}/view`).join("|");
      const row = ws.getRow(301);
      t.columns.forEach((c, i) => {
        if (c.key === "image_files") row.getCell(i + 1).value = links;
        else if (c.type === "number") row.getCell(i + 1).value = 5;
        else if (c.type === "list") row.getCell(i + 1).value = c.values![0];
        else if (c.type !== "locked") row.getCell(i + 1).value = c.key === "description" ? "Ten or more characters here." : "X";
      });
      const read = await readBulkXlsx(await wb.xlsx.writeBuffer() as ArrayBuffer, t);
      expect(read.fatal).toBeNull();
      expect(read.rows.map((r) => r.line)).toEqual([301]);
      expect(read.rows[0].cells.image_files).toBe(links);
      expect(read.rows[0].cells.category).toBe(t.category.name);
    });
  }

  it("refuses a template made for another category", async () => {
    const buf = await (await xlsxTemplate(T.in_hoodies)).arrayBuffer();
    const { fatal } = await readBulkXlsx(buf, T.in_home_decor);
    expect(fatal).toMatch(/template for HOODIES/);
  });

  it("reads back its own template: the locked category alone is not a product", async () => {
    const buf = await (await xlsxTemplate(T.in_hoodies)).arrayBuffer();
    expect((await readBulkXlsx(buf, T.in_hoodies)).fatal).toMatch(/no products/);
  });

  it("sends a row of another category on as typed, so the backend refuses it with the reason", () => {
    const csv = `${T.in_home_decor.columns.map((c) => c.header).join(",")}\nHOODIES,Brass vase,Hand-finished brass vase here.,4,1650,,a.jpg\n`;
    const { rows, fatal } = readBulkCsv(csv, T.in_home_decor);
    expect(fatal).toBeNull();
    expect(rows[0].cells).toMatchObject({ line: 2, category: "HOODIES", name: "Brass vase" });
  });
});

describe("old template", () => {
  // The template from before one file was one category: category as a dropdown, sizes and stock per size in one cell
  const oldCsv = "name,description,category,price,mrp,sizes,stock,image_files\nHeavy hoodie,Heavyweight fleece hoodie.,HOODIES,2499,,S|M,1|2,a.jpg\nBad,short,Nope,0,,,x,\n";

  it("fails the whole file with one message and no rows, CSV", () => {
    expect(readBulkCsv(oldCsv, T.in_hoodies)).toEqual({ rows: [], fatal: OLD_TEMPLATE_MESSAGE });
    expect(readBulkCsv(oldCsv, T.in_home_decor)).toEqual({ rows: [], fatal: OLD_TEMPLATE_MESSAGE });
    expect(OLD_TEMPLATE_MESSAGE).toBe("Yeh purana template hai. Category chunkar naya template download karein.");
  });

  it("fails the whole file with one message and no rows, Excel from the old template", async () => {
    const wb = new Workbook();
    const ws = wb.addWorksheet("Products");
    parseCsv(oldCsv).forEach((r) => ws.addRow(r));
    wb.addWorksheet("How to fill it").getCell("A1").value = "How to fill this template";
    const buf = await wb.xlsx.writeBuffer();
    expect(await readBulkXlsx(buf as ArrayBuffer, T.in_hoodies)).toEqual({ rows: [], fatal: OLD_TEMPLATE_MESSAGE });
  });

  it("knows the old headers, and never flags a new template", () => {
    expect(isOldTemplate(["name", "description", "category", "price", "mrp", "sizes", "stock", "image_files"])).toBe(true);
    expect(isOldTemplate(["category", "name", "description", "stock", "price", "mrp", "image_files"])).toBe(true);
    for (const t of [T.in_hoodies, T.in_home_decor, T.ae_laptops, T.ae_hoodies]) expect(isOldTemplate(t.columns.map((c) => c.header))).toBe(false);
  });

  it("a new template that lost its hidden Meta sheet still reads by its headers", async () => {
    const wb = new Workbook();
    await wb.xlsx.load(await (await xlsxTemplate(T.in_home_decor)).arrayBuffer());
    wb.removeWorksheet(wb.getWorksheet("Meta")!.id);
    wb.getWorksheet("Products")!.getRow(2).getCell(2).value = "Brass vase";
    const res = await readBulkXlsx((await wb.xlsx.writeBuffer()) as ArrayBuffer, T.in_home_decor);
    expect(res.fatal).toBeNull();
    expect(res.rows[0].cells).toMatchObject({ category: "HOME DECOR", name: "Brass vase" });
  });
});

describe("sizes only for apparel and fashion", () => {
  it("non-apparel template has no size, colour or fit column", async () => {
    const h = headers(await workbook(T.in_home_decor));
    expect(h).toEqual(["category", "name", "description", "stock", "price (INR)", "mrp (INR)", "image_files"]);
    expect(parseCsv(csvTemplate(T.in_home_decor))[0]).toEqual(h);
    expect(h).not.toContain("size");
  });

  it("apparel template has Size, Colour and Fit, with the size set as a dropdown", async () => {
    const wb = await workbook(T.in_hoodies);
    const h = headers(wb);
    expect(h).toEqual(expect.arrayContaining(["variant_group", "colour", "size", "fit", "sku"]));
    const ws = wb.getWorksheet("Products")!;
    const sizeCol = h.indexOf("size") + 1;
    const dv = ws.getCell(2, sizeCol).dataValidation;
    expect(dv?.type).toBe("list");
    const lists = wb.getWorksheet("Lists")!;
    const letter = String(dv?.formulae?.[0]).match(/\$([A-Z])\$1/)![1];
    const values = Array.from({ length: 7 }, (_, i) => lists.getCell(`${letter}${i + 1}`).value);
    expect(values).toEqual(["XS", "S", "M", "L", "XL", "XXL", "3XL"]);
  });

  it("passes a size typed into a non-apparel file on to the backend, which refuses it", () => {
    const csv = "category,name,description,stock,price (INR),mrp (INR),image_files,size\nHOME DECOR,Brass vase,Hand-finished brass vase.,4,1650,,a.jpg,M\n";
    expect(readBulkCsv(csv, T.in_home_decor).rows[0].cells.size).toBe("M");
  });

  it("the worked examples are two size rows of one product, or one product without sizes", () => {
    const tee = parseCsv(csvTemplate(T.in_hoodies)).slice(1);
    const h = parseCsv(csvTemplate(T.in_hoodies))[0];
    expect(tee).toHaveLength(2);
    expect(tee.map((r) => r[h.indexOf("variant_group")])).toEqual(["EX-001", "EX-001"]);
    expect(tee.map((r) => r[h.indexOf("size")])).toEqual(["M", "L"]);
    expect(parseCsv(csvTemplate(T.in_home_decor)).slice(1)).toHaveLength(1);
  });
});

describe("currency", () => {
  it("India prices in INR, the UAE in AED", async () => {
    expect(headers(await workbook(T.in_hoodies))).toContain("price (INR)");
    expect(headers(await workbook(T.ae_hoodies))).toContain("price (AED)");
    expect(instructionLines(T.ae_hoodies).join("\n")).toMatch(/in AED/);
  });

  it("refuses a file priced in the other currency", () => {
    const csv = parseCsv(csvTemplate(T.in_home_decor));
    expect(readBulkTable(csv, T.in_home_decor).fatal).toBeNull();
    const aeHomeDecor = { ...T.in_home_decor, currency: "AED" } as BulkTemplate;
    expect(readBulkTable(csv, aeHomeDecor).fatal).toMatch(/prices in INR. Your prices are in AED/);
  });

  it("reads headers with or without the unit", () => {
    expect(headerKey("price (INR)")).toEqual({ key: "price", unit: "INR" });
    expect(headerKey("Variant group")).toEqual({ key: "variant_group", unit: null });
    expect(headerKey("Color")).toEqual({ key: "colour", unit: null });
  });
});

describe("instructions sheet", () => {
  it("states no rate and points to the screen and the agreement", async () => {
    for (const t of [T.in_hoodies, T.in_home_decor, T.ae_laptops, T.ae_hoodies]) {
      const wb = await workbook(t);
      const how = wb.getWorksheet("Instructions")!;
      const text = (how.getColumn(1).values as unknown[]).filter(Boolean).join("\n");
      expect(text).not.toMatch(/\d+(\.\d+)?\s*%/);
      expect(text).not.toMatch(/settle\w*\s+(with)?in\s+\d/i);
      expect(text).toMatch(/rates that apply to this category are shown on the Bulk upload screen and in your signed seller agreement/);
    }
  });
});

describe("rows, photos and the error file", () => {
  const head = T.in_hoodies.columns.map((c) => c.header).join(",");
  it("skips empty rows, refuses missing columns and more than 200 rows", () => {
    expect(readBulkCsv("", T.in_hoodies).fatal).toMatch(/empty/);
    expect(readBulkCsv("name,price (INR)\nx,1", T.in_hoodies).fatal).toMatch(/Missing columns: category, variant_group/);
    // A price with no currency is the old template's header
    expect(readBulkCsv("name,price\nx,1", T.in_hoodies).fatal).toBe(OLD_TEMPLATE_MESSAGE);
    const row = "HOODIES,G1,Hoodie,A heavy fleece hoodie.,Black,M,,4,,2499,,a.jpg";
    expect(readBulkCsv(`${head}\n${`${row}\n`.repeat(201)}`, T.in_hoodies).fatal).toMatch(/Up to 200/);
    expect(readBulkCsv(`${head}\n${row}\n`, T.in_hoodies).rows).toHaveLength(1);
  });

  const DRIVE = "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOp/view?usp=drive_link";
  const product = (image_files: string[], photos?: BulkProductResult["photos"]): BulkProductResult =>
    ({ key: null, lines: [2], name: "X", variants: 0, image_files, photos, ok: true });

  it("matches photo files by name in the row's order; an older backend without photos means all files", async () => {
    const p = product(["a.jpg", "b.jpg"]);
    expect(photosOf(p).map((x) => x.source)).toEqual(["file", "file"]);
    expect(missingPhotos(p, [photo("A.JPG")])).toEqual(["b.jpg"]);
    const got = await collectPhotos(p, [photo("b.jpg"), photo("a.jpg")], async () => { throw new Error("no Drive here"); }, new Map());
    expect("files" in got && got.files.map((f) => f.name)).toEqual(["a.jpg", "b.jpg"]);
  });

  it("Drive photos need no pick, download one at a time as drive-<id>.<ext>, in sheet order, once each", async () => {
    const p = product([DRIVE, "a.jpg"], [{ source: "drive", name: "drive-1AbCdEfGhIjKlMnOp", drive_id: "1AbCdEfGhIjKlMnOp", link: DRIVE }, { source: "file", name: "a.jpg" }]);
    expect(missingPhotos(p, [])).toEqual(["a.jpg"]);
    expect(missingPhotos(p, [photo("a.jpg")])).toEqual([]);
    let inFlight = 0, calls = 0;
    const download = async (link: string) => {
      expect(link).toBe(DRIVE); expect(++inFlight).toBe(1); calls++;
      await new Promise((r) => setTimeout(r, 1)); inFlight--;
      return new Blob([new Uint8Array([0x89, 0x50])], { type: "image/png" });
    };
    const cache = new Map<string, File>();
    const got = await collectPhotos(p, [photo("a.jpg")], download, cache);
    expect("files" in got && got.files.map((f) => f.name)).toEqual(["drive-1AbCdEfGhIjKlMnOp.png", "a.jpg"]);
    await collectPhotos(p, [photo("a.jpg")], download, cache);
    expect(calls).toBe(1);
  });

  it("a Drive photo that fails gives the backend's reason as a row error in the { field, code, message } shape", async () => {
    const p = product(["x.jpg", DRIVE], [{ source: "file", name: "x.jpg" }, { source: "drive", name: "drive-1AbCdEfGhIjKlMnOp", link: DRIVE }]);
    const msg = 'This Google Drive photo is private. In Drive, set Share > General access to "Anyone with the link" and try again.';
    const got = await collectPhotos(p, [photo("x.jpg")], async () => { throw new ApiError(422, msg, { code: "PRIVATE" }); }, new Map());
    expect(got).toEqual({ error: { field: "image_files", code: "PRIVATE", message: `Photo 2: ${msg}` } });
    expect(rowErrorLine(5, (got as { error: { field: string; code: string; message: string } }).error)).toBe(`Row 5 · image_files: Photo 2: ${msg}`);
  });

  it("exports the rows to fix in the template's columns with the reason", () => {
    const { rows } = readBulkCsv(`${head}\nHOODIES,G1,X,short,Black,M,,4,,0,,\n`, T.in_hoodies);
    const out = parseCsv(errorCsv(T.in_hoodies.columns, [{ row: rows[0], errors: ["Price must be above 0", "Name at least one photo file"] }]));
    expect(out[0]).toEqual(["row", ...T.in_hoodies.columns.map((c) => c.header), "error"]);
    expect(out[1][0]).toBe("2");
    expect(out[1].at(-1)).toBe("Price must be above 0; Name at least one photo file");
    const typed = parseCsv(errorCsv(T.in_hoodies.columns, [{ row: rows[0], errors: [{ field: "price", code: "PRICE_RANGE", message: "Price must be above 0" }] }]));
    expect(typed[1].at(-1)).toBe("price (INR): Price must be above 0");
  });
});

describe("commission on screen", () => {
  it("is the backend's rate for the category, never a number of its own", () => {
    expect(commissionView(T.in_hoodies.commission).headline).toBe("17%");
    const changed = { ...T.in_hoodies.commission, pct: 23 };
    expect(commissionView(changed).headline).toBe("23%");
    expect(commissionView({ ...T.in_hoodies.commission, pct: null }).headline).toBeNull();
  });

  it("phones and laptops: each who-ships option with its shipping charge", () => {
    const v = commissionView(T.ae_laptops.commission);
    expect(v.headline).toBeNull();
    expect(v.options.map((o) => o.title)).toEqual(["You ship: 12%", "NOTMADE ships: 13.5%"]);
    expect(v.options[1].detail).toBe("12% commission + 1.5% NOTMADE shipping charge, flat, no VAT added");
    expect(v.options[0].detail).toBeNull();
  });

  it("notes the rate group, the card, shipping, settlement days from the backend, and an override", () => {
    const v = commissionView(T.in_hoodies.commission);
    expect(v.notes).toEqual(["Fashion & all other categories, from your rate card IN-2026-11-v2.", "Shipping is included.", "Settlement within 7 days."]);
    expect(commissionView({ ...T.ae_hoodies.commission, source: "override", settlement_days: 10 }).notes).toEqual(expect.arrayContaining(["This is a rate NOTMADE set for your account.", "Settlement within 10 days."]));
  });
});
