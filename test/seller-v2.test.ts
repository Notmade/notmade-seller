import { describe, expect, it } from "vitest";
import { CSV_HEADERS, csvTemplate, errorCsv, missingPhotos, parseCsv, photosFor, readBulkCsv, toCsv } from "@/app/lib/bulk-csv";
import { ORDER_TABS, orderInTab, sellerShips, tabForParam, validTrackingId } from "@/app/lib/order-tabs";
import { monthGrid, payoutEvents } from "@/app/lib/payout-calendar";
import { productStatus, STATUS_LABEL } from "@/app/lib/product-status";
import { EMPTY_LISTING, comboKey, listingFormData, stepError, stockCombos, totalStock, type Listing } from "@/app/lib/product-listing";
import type { Category, OrderItem, Payout, UpcomingSettlement } from "@/app/lib/seller-api";

const photo = (name = "a.jpg") => new File(["x"], name, { type: "image/jpeg" });
const base: Listing = { ...EMPTY_LISTING, categoryId: "c1", name: "Tee", description: "A heavy cotton tee.", price: "500", stock: "4" };
const categories = [{ id: "c1", name: "Kurtas", slug: "kurtas" }] as Category[];

describe("a seller can never make a product live", () => {
  it("sends only listing fields, for every shape of product", () => {
    const shapes: Listing[] = [base,
      { ...base, hasSizes: true, sizes: [{ size: "M", stock: "2" }] },
      { ...base, option: { name: "Colour", values: [{ value: "Red", images: [] }] }, comboStock: { [comboKey("Red", null)]: "3" } }];
    for (const l of shapes) for (const country of ["IN", "AE"] as const) {
      const keys = Array.from(listingFormData(l, country, [photo()]).keys());
      expect(keys.filter((k) => /live|approv|review|status/i.test(k))).toEqual([]);
    }
  });

  it("names the four statuses, from the backend's fields", () => {
    expect(productStatus({ status: "draft", approval_status: null, is_live: false }).label).toBe("Draft");
    expect(productStatus({ approval_status: "pending", is_live: false }).label).toBe("In review");
    expect(productStatus({ approval_status: "approved", is_live: true }).label).toBe("Live");
    expect(productStatus({ approval_status: "rejected", is_live: false }).label).toBe("Needs changes");
    expect(productStatus({ approval_status: "pending", is_live: true }).label).toBe(STATUS_LABEL.pending);
  });
});

describe("listing payload", () => {
  it("prices only in the seller's currency", () => {
    const india = listingFormData(base, "IN", []);
    expect(india.get("price_inr")).toBe("500");
    expect(india.has("price_aed")).toBe(false);
    const uae = listingFormData(base, "AE", []);
    expect(uae.get("price_aed")).toBe("500");
    expect(uae.has("price_inr")).toBe(false);
  });

  it("sends who ships only when set, and keeps photos in the seller's order", () => {
    expect(listingFormData(base, "AE", []).has("fulfilment_mode")).toBe(false);
    const fd = listingFormData({ ...base, fulfilmentMode: "seller_ships" }, "AE", [photo("2.jpg"), photo("1.jpg")]);
    expect(fd.get("fulfilment_mode")).toBe("seller_ships");
    expect(fd.getAll("images").map((f) => (f as File).name)).toEqual(["2.jpg", "1.jpg"]);
  });

  it("builds one variant per colour and size", () => {
    const l: Listing = { ...base, hasSizes: true, sizes: [{ size: "S", stock: "" }, { size: "M", stock: "" }],
      option: { name: "Colour", values: [{ value: "Red", images: [] }] }, comboStock: { [comboKey("Red", "S")]: "1", [comboKey("Red", "M")]: "2" } };
    const fd = listingFormData(l, "IN", []);
    expect(JSON.parse(String(fd.get("variants")))).toEqual([
      { option_values: { Colour: "Red", Size: "S" }, stock: 1 }, { option_values: { Colour: "Red", Size: "M" }, stock: 2 }]);
    expect(JSON.parse(String(fd.get("options"))).map((o: { name: string }) => o.name)).toEqual(["Size", "Colour"]);
    expect(stockCombos(l)).toHaveLength(2);
    expect(totalStock(l)).toBe(3);
  });
});

describe("wizard steps", () => {
  it("stop on what the backend would refuse", () => {
    expect(stepError("category", EMPTY_LISTING, 0)).toMatch(/category/i);
    expect(stepError("photos", base, 0)).toMatch(/photo/i);
    expect(stepError("photos", base, 9)).toMatch(/8/);
    expect(stepError("details", { ...base, description: "short" }, 1)).toMatch(/10 characters/);
    expect(stepError("variants", { ...base, stock: "1.5" }, 1)).toMatch(/whole number/);
    expect(stepError("variants", { ...base, hasSizes: true }, 1)).toMatch(/size/i);
    expect(stepError("price", { ...base, price: "0" }, 1)).toMatch(/price/i);
    expect(stepError("price", { ...base, mrp: "100" }, 1)).toMatch(/MRP/);
    expect(stepError("shipping", base, 1)).toMatch(/who ships/i);
  });

  it("let a complete listing through", () => {
    for (const s of ["category", "details", "variants", "price"] as const) expect(stepError(s, base, 1)).toBeNull();
    expect(stepError("photos", base, 1)).toBeNull();
  });
});

describe("bulk CSV", () => {
  const head = CSV_HEADERS.join(",");
  const good = 'Tee,A heavy cotton tee.,Kurtas,500,600,S|M,1|2,a.jpg|b.jpg';

  it("parses quotes, commas, line breaks, CRLF and a BOM", () => {
    expect(parseCsv('﻿a,b\r\n"x, ""y""\nz",2\r\n\r\n')).toEqual([["a", "b"], ['x, "y"\nz', "2"]]);
  });

  it("round-trips the template, whose example row is valid", () => {
    const { rows, fatal } = readBulkCsv(csvTemplate(categories), categories);
    expect(fatal).toBeNull();
    expect(rows[0].errors).toEqual([]);
  });

  it("reads a good row into a listing", () => {
    const [row] = readBulkCsv(`${head}\n${good}\n`, categories).rows;
    expect(row).toMatchObject({ line: 2, errors: [], imageFiles: ["a.jpg", "b.jpg"] });
    expect(row.listing).toMatchObject({ categoryId: "c1", price: "500", hasSizes: true, sizes: [{ size: "S", stock: "1" }, { size: "M", stock: "2" }] });
  });

  it("gives each bad row its own reasons and keeps the good ones", () => {
    const { rows } = readBulkCsv(`${head}\n${good}\nX,short,Nope,0,,S|M,1,\n`, categories);
    expect(rows[0].errors).toEqual([]);
    expect(rows[1].line).toBe(3);
    expect(rows[1].listing).toBeNull();
    for (const e of [/Name/, /Description/, /Category "Nope"/, /Price/, /stock number per size/, /photo file/]) expect(rows[1].errors.join(" | ")).toMatch(e);
  });

  it("refuses a file it cannot read as a whole", () => {
    expect(readBulkCsv("", categories).fatal).toMatch(/empty/);
    expect(readBulkCsv("name,price\nx,1", categories).fatal).toMatch(/Missing columns/);
    expect(readBulkCsv(head, categories).fatal).toMatch(/no products/);
    expect(readBulkCsv(`${head}\n${`${good}\n`.repeat(201)}`, categories).fatal).toMatch(/Up to 200/);
  });

  it("matches photos by file name in the row's order", () => {
    const [row] = readBulkCsv(`${head}\n${good}\n`, categories).rows;
    expect(missingPhotos(row, [photo("A.JPG")])).toEqual(["b.jpg"]);
    expect(photosFor(row, [photo("b.jpg"), photo("a.jpg")]).map((f) => f.name)).toEqual(["a.jpg", "b.jpg"]);
  });

  it("exports rows to fix with the reason", () => {
    const { rows } = readBulkCsv(`${head}\nX,short,Nope,0,,,,\n`, categories);
    const out = parseCsv(errorCsv([{ row: rows[0], errors: rows[0].errors }]));
    expect(out[0].at(-1)).toBe("error");
    expect(out[1][0]).toBe("X");
    expect(out[1].at(-1)).toMatch(/Name must/);
    expect(toCsv([["a,b"]])).toBe('"a,b"\r\n');
  });
});

describe("order tabs", () => {
  it("are the ones sellers work through, and lose no bucket", () => {
    expect(ORDER_TABS.slice(0, 5).map((t) => t.label)).toEqual(["New", "To pack", "Shipped", "Delivered", "Returns"]);
    expect(ORDER_TABS.flatMap((t) => t.buckets).sort()).toEqual(["accepted", "cancelled", "delivered", "new", "ready", "returns", "shipped"]);
    expect(orderInTab({ bucket: "ready" }, "pack")).toBe(true);
  });

  it("still open from old links that name a backend bucket", () => {
    expect(tabForParam("ready")).toBe("pack");
    expect(tabForParam("accepted")).toBe("pack");
    expect(tabForParam("pack")).toBe("pack");
    expect(tabForParam("nope")).toBeNull();
    expect(tabForParam(null)).toBeNull();
  });

  it("offer tracking only when every line is seller-ships, as the backend requires", () => {
    const line = (fulfilment_mode: OrderItem["fulfilment_mode"]) => ({ fulfilment_mode }) as OrderItem;
    expect(sellerShips({ items: [line("seller_ships")] })).toBe(true);
    expect(sellerShips({ items: [line("seller_ships"), line("notmade_ships")] })).toBe(false);
    expect(sellerShips({ items: [line(null)] })).toBe(false);
    expect(sellerShips({ items: [] })).toBe(false);
  });

  it("check tracking numbers with the backend's rule", () => {
    expect(validTrackingId("AB12")).toBe(true);
    expect(validTrackingId("A/B_1.2-3")).toBe(true);
    expect(validTrackingId("AB1")).toBe(false);
    expect(validTrackingId("AB 123")).toBe(false);
  });
});

describe("payout calendar", () => {
  const up = (settlement_date: string) => ({ ref_no: "NM-1", settlement_date, payout: 100 }) as UpcomingSettlement;
  const po = (o: Partial<Payout>) => ({ id: "1", amount: 50, status: "paid", due_date: null, paid_at: null, reference: null, created_at: "2026-11-01T00:00:00Z", ...o }) as Payout;

  it("splits pending from paid", () => {
    const e = payoutEvents([po({ paid_at: "2026-11-03T10:00:00Z" }), po({ id: "2", status: "pending", due_date: "2026-11-09T10:00:00Z" })], [up("2026-11-08T10:00:00Z")], "UTC");
    expect(e.map((x) => [x.date, x.state])).toEqual([["2026-11-09", "pending"], ["2026-11-08", "pending"], ["2026-11-03", "paid"]]);
  });

  it("uses the seller's own day", () => {
    const [e] = payoutEvents([], [up("2026-11-08T20:00:00Z")], "Asia/Dubai");
    expect(e.date).toBe("2026-11-09");
  });

  it("lays a month out Monday first", () => {
    const weeks = monthGrid(2026, 10, []); // November 2026 starts on a Sunday
    expect(weeks[0].slice(0, 6)).toEqual([null, null, null, null, null, null]);
    expect(weeks[0][6]?.day).toBe(1);
    expect(weeks.flat().filter(Boolean)).toHaveLength(30);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
  });

  it("puts events on their day", () => {
    const e = payoutEvents([], [up("2026-11-08T10:00:00Z")], "UTC");
    expect(monthGrid(2026, 10, e).flat().find((c) => c?.day === 8)?.events).toHaveLength(1);
  });
});
