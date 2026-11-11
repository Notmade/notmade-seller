// @vitest-environment node
// The category-locked bulk template and the file reader. Fixtures are real GET /seller/bulk/template responses from the
// backend's test harness (test/fixtures/bulk-templates.json): India Tees and Candles on IN-2026-11-v2, UAE Laptops and
// Tees on AE-2026-11-v3.
import { describe, expect, it } from "vitest";
import { Workbook } from "exceljs";
import fixtures from "./fixtures/bulk-templates.json";
import type { BulkTemplate } from "@/app/lib/seller-api";
import { xlsxTemplate, readBulkXlsx, instructionLines } from "@/app/lib/bulk-xlsx";
import { csvTemplate, errorCsv, headerKey, missingPhotos, parseCsv, photosFor, readBulkCsv, readBulkTable } from "@/app/lib/bulk-csv";
import { commissionView } from "@/app/lib/bulk-commission";

const T = fixtures as unknown as Record<"in_tees" | "in_candles" | "ae_laptops" | "ae_tees", BulkTemplate>;
const photo = (name: string) => new File(["x"], name, { type: "image/jpeg" });

async function workbook(t: BulkTemplate) {
  const wb = new Workbook();
  await wb.xlsx.load(await (await xlsxTemplate(t)).arrayBuffer());
  return wb;
}
const headers = (wb: Workbook) => (wb.getWorksheet("Products")!.getRow(1).values as unknown[]).slice(1);

describe("category lock", () => {
  it("fills in the category on every row and locks it, on a protected sheet", async () => {
    const ws = (await workbook(T.in_tees)).getWorksheet("Products")!;
    expect(ws.getCell("A1").value).toBe("category");
    for (const r of [2, 100, 201]) {
      expect(ws.getCell(r, 1).value).toBe("Tees");
      // Locked is Excel's default for a cell, so ExcelJS reads it back as unset; unlocked cells say so
      expect(ws.getCell(r, 1).protection?.locked).not.toBe(false);
      expect(ws.getCell(r, 2).protection?.locked).toBe(false);
    }
    expect((ws as unknown as { sheetProtection?: { sheet?: boolean } }).sheetProtection?.sheet).toBe(true);
  });

  it("refuses a template made for another category", async () => {
    const buf = await (await xlsxTemplate(T.in_tees)).arrayBuffer();
    const { fatal } = await readBulkXlsx(buf, T.in_candles);
    expect(fatal).toMatch(/template for Tees/);
  });

  it("reads back its own template: the locked category alone is not a product", async () => {
    const buf = await (await xlsxTemplate(T.in_tees)).arrayBuffer();
    expect((await readBulkXlsx(buf, T.in_tees)).fatal).toMatch(/no products/);
  });

  it("sends a row of another category on as typed, so the backend refuses it with the reason", () => {
    const csv = `${T.in_candles.columns.map((c) => c.header).join(",")}\nTees,Soy candle,Hand-poured soy candle here.,4,650,,a.jpg\n`;
    const { rows, fatal } = readBulkCsv(csv, T.in_candles);
    expect(fatal).toBeNull();
    expect(rows[0].cells).toMatchObject({ line: 2, category: "Tees", name: "Soy candle" });
  });
});

describe("sizes only for apparel and fashion", () => {
  it("non-apparel template has no size, colour or fit column", async () => {
    const h = headers(await workbook(T.in_candles));
    expect(h).toEqual(["category", "name", "description", "stock", "price (INR)", "mrp (INR)", "image_files"]);
    expect(parseCsv(csvTemplate(T.in_candles))[0]).toEqual(h);
    expect(h).not.toContain("size");
  });

  it("apparel template has Size, Colour and Fit, with the size set as a dropdown", async () => {
    const wb = await workbook(T.in_tees);
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
    const csv = "category,name,description,stock,price (INR),mrp (INR),image_files,size\nCandles,Soy candle,Hand-poured soy candle.,4,650,,a.jpg,M\n";
    expect(readBulkCsv(csv, T.in_candles).rows[0].cells.size).toBe("M");
  });

  it("the worked examples are two size rows of one product, or one product without sizes", () => {
    const tee = parseCsv(csvTemplate(T.in_tees)).slice(1);
    const h = parseCsv(csvTemplate(T.in_tees))[0];
    expect(tee).toHaveLength(2);
    expect(tee.map((r) => r[h.indexOf("variant_group")])).toEqual(["EX-001", "EX-001"]);
    expect(tee.map((r) => r[h.indexOf("size")])).toEqual(["M", "L"]);
    expect(parseCsv(csvTemplate(T.in_candles)).slice(1)).toHaveLength(1);
  });
});

describe("currency", () => {
  it("India prices in INR, the UAE in AED", async () => {
    expect(headers(await workbook(T.in_tees))).toContain("price (INR)");
    expect(headers(await workbook(T.ae_tees))).toContain("price (AED)");
    expect(instructionLines(T.ae_tees).join("\n")).toMatch(/in AED/);
  });

  it("refuses a file priced in the other currency", () => {
    const csv = parseCsv(csvTemplate(T.in_candles));
    expect(readBulkTable(csv, T.in_candles).fatal).toBeNull();
    const aeCandles = { ...T.in_candles, currency: "AED" } as BulkTemplate;
    expect(readBulkTable(csv, aeCandles).fatal).toMatch(/prices in INR. Your prices are in AED/);
  });

  it("reads headers with or without the unit", () => {
    expect(headerKey("price (INR)")).toEqual({ key: "price", unit: "INR" });
    expect(headerKey("Variant group")).toEqual({ key: "variant_group", unit: null });
    expect(headerKey("Color")).toEqual({ key: "colour", unit: null });
  });
});

describe("instructions sheet", () => {
  it("states no rate and points to the screen and the agreement", async () => {
    for (const t of [T.in_tees, T.in_candles, T.ae_laptops, T.ae_tees]) {
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
  const head = T.in_tees.columns.map((c) => c.header).join(",");
  it("skips empty rows, refuses missing columns and more than 200 rows", () => {
    expect(readBulkCsv("", T.in_tees).fatal).toMatch(/empty/);
    expect(readBulkCsv("name,price\nx,1", T.in_tees).fatal).toMatch(/Missing columns: category, variant_group/);
    const row = "Tees,G1,Tee,A heavy cotton tee.,Black,M,,4,,500,,a.jpg";
    expect(readBulkCsv(`${head}\n${`${row}\n`.repeat(201)}`, T.in_tees).fatal).toMatch(/Up to 200/);
    expect(readBulkCsv(`${head}\n${row}\n`, T.in_tees).rows).toHaveLength(1);
  });

  it("matches photos by file name in the row's order", () => {
    expect(missingPhotos(["a.jpg", "b.jpg"], [photo("A.JPG")])).toEqual(["b.jpg"]);
    expect(photosFor(["a.jpg", "b.jpg"], [photo("b.jpg"), photo("a.jpg")]).map((f) => f.name)).toEqual(["a.jpg", "b.jpg"]);
  });

  it("exports the rows to fix in the template's columns with the reason", () => {
    const { rows } = readBulkCsv(`${head}\nTees,G1,X,short,Black,M,,4,,0,,\n`, T.in_tees);
    const out = parseCsv(errorCsv(T.in_tees.columns, [{ row: rows[0], errors: ["Price must be above 0", "Name at least one photo file"] }]));
    expect(out[0]).toEqual(["row", ...T.in_tees.columns.map((c) => c.header), "error"]);
    expect(out[1][0]).toBe("2");
    expect(out[1].at(-1)).toBe("Price must be above 0; Name at least one photo file");
  });
});

describe("commission on screen", () => {
  it("is the backend's rate for the category, never a number of its own", () => {
    expect(commissionView(T.in_tees.commission).headline).toBe("17%");
    const changed = { ...T.in_tees.commission, pct: 23 };
    expect(commissionView(changed).headline).toBe("23%");
    expect(commissionView({ ...T.in_tees.commission, pct: null }).headline).toBeNull();
  });

  it("phones and laptops: each who-ships option with its shipping charge", () => {
    const v = commissionView(T.ae_laptops.commission);
    expect(v.headline).toBeNull();
    expect(v.options.map((o) => o.title)).toEqual(["You ship: 12%", "NOTMADE ships: 13.5%"]);
    expect(v.options[1].detail).toBe("12% commission + 1.5% NOTMADE shipping charge, flat, no VAT added");
    expect(v.options[0].detail).toBeNull();
  });

  it("notes the rate group, the card, shipping, settlement days from the backend, and an override", () => {
    const v = commissionView(T.in_tees.commission);
    expect(v.notes).toEqual(["Fashion & all other categories, from your rate card IN-2026-11-v2.", "Shipping is included.", "Settlement within 7 days."]);
    expect(commissionView({ ...T.ae_tees.commission, source: "override", settlement_days: 10 }).notes).toEqual(expect.arrayContaining(["This is a rate NOTMADE set for your account.", "Settlement within 10 days."]));
  });
});
