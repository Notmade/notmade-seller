import { describe, expect, it } from "vitest";
import {
  filterCategories, groupCategories, orderFunnel, ordersByStatus, ordersIn, revenueWindows, salesSeries, stockRows, stockState, topProducts,
} from "@/app/lib/insights";
import type { Category, Order, Product } from "@/app/lib/seller-api";

const NOW = Date.parse("2026-11-05T06:00:00Z");
const DAY = 86_400_000;

function order(p: Partial<Order> & { daysAgo?: number; gross?: number; currency?: "INR" | "AED" }): Order {
  const { daysAgo = 0, gross = 100, currency = "INR", ...rest } = p;
  return {
    ref_no: "NM-1", bucket: "delivered", created_at: new Date(NOW - daysAgo * DAY).toISOString(), seller_accepted_at: null, items: [],
    commission: { gross, currency }, ...rest,
  } as unknown as Order;
}

describe("revenue", () => {
  const orders = [order({ gross: 100 }), order({ gross: 50, daysAgo: 3 }), order({ gross: 25, daysAgo: 20 }), order({ gross: 999, bucket: "cancelled" })];

  it("adds up today, 7 and 30 days and leaves out cancelled orders", () => {
    const r = revenueWindows(orders, "Asia/Kolkata", NOW);
    expect(r.today).toEqual({ revenue: 100, orders: 1 });
    expect(r.week).toEqual({ revenue: 150, orders: 2 });
    expect(r.month).toEqual({ revenue: 175, orders: 3 });
  });

  it("buckets the day in the seller's time zone", () => {
    const lateEvening = order({ created_at: "2026-11-04T19:30:00Z" }); // already 5 Nov in India, still 4 Nov in the UAE
    expect(revenueWindows([lateEvening], "Asia/Kolkata", NOW).today.orders).toBe(1);
    expect(revenueWindows([lateEvening], "Asia/Dubai", NOW).today.orders).toBe(0);
  });

  it("never mixes currencies", () => {
    expect(ordersIn([order({ currency: "INR" }), order({ currency: "AED" })], "AED")).toHaveLength(1);
  });

  it("keeps empty days in the series", () => {
    const s = salesSeries(orders, 7, "Asia/Kolkata", NOW);
    expect(s).toHaveLength(7);
    expect(s[6].revenue).toBe(100);
    expect(s[0].revenue).toBe(0);
  });
});

describe("analytics", () => {
  const item = (id: string, qty: number, price: number) => ({ product_id: id, product_name: id, quantity: qty, unit_price: price, market_unit_price: null });

  it("ranks top products by sales", () => {
    const top = topProducts([order({ items: [item("a", 1, 10), item("b", 3, 50)] as never }), order({ items: [item("a", 2, 10)] as never })]);
    expect(top.map((t) => [t.id, t.units, t.revenue])).toEqual([["b", 3, 150], ["a", 3, 30]]);
  });

  it("counts orders by status, dropping empty ones", () => {
    expect(ordersByStatus([order({ bucket: "new" }), order({ bucket: "new" })])).toEqual([{ bucket: "new", label: "New", count: 2 }]);
  });

  it("works out conversion, and is blank with no orders", () => {
    const f = orderFunnel([order({ seller_accepted_at: "x" }), order({ seller_accepted_at: "x", bucket: "shipped" }), order({ bucket: "new" }), order({ bucket: "new" })]);
    expect(f).toMatchObject({ received: 4, accepted: 2, delivered: 1, acceptRate: 50, deliverRate: 50 });
    expect(orderFunnel([]).acceptRate).toBeNull();
  });
});

describe("inventory", () => {
  it("classifies stock against the threshold", () => {
    expect(stockState(0, 3)).toBe("out");
    expect(stockState(3, 3)).toBe("low");
    expect(stockState(4, 3)).toBe("ok");
  });

  it("gives one row per variant, size or product", () => {
    const base = { id: "p", name: "Tee", images: null, stock: 9, product_variants: null, variants: null } as unknown as Product;
    expect(stockRows([base])).toMatchObject([{ key: "p", stock: 9, variantId: null, size: null }]);
    expect(stockRows([{ ...base, product_variants: [{ size: "M", stock: 2, is_active: true }, { size: "L", stock: 1, is_active: false }] }]))
      .toMatchObject([{ size: "M", variant: "M", stock: 2 }]);
    expect(stockRows([{ ...base, variants: [{ id: "v", option_values: { Colour: "Black" }, stock: 4, is_active: true, sku: "S1" }] }]))
      .toMatchObject([{ variantId: "v", variant: "Black", sku: "S1", stock: 4 }]);
  });
});

describe("category picker", () => {
  const cat = (name: string, group?: string): Category => ({ id: name, name, slug: name, group });

  it("groups by keyword, with the unknown last", () => {
    const groups = groupCategories([cat("Hoodies"), cat("Laptops"), cat("Zzz"), cat("Vases")]);
    expect(groups.map((g) => g.name)).toEqual(["Fashion", "Home", "Electronics", "More"]);
  });

  it("prefers the backend's group", () => {
    expect(groupCategories([cat("Hoodies", "Streetwear")])[0].name).toBe("Streetwear");
  });

  it("searches names and group titles", () => {
    const groups = groupCategories([cat("Hoodies"), cat("Laptops")]);
    expect(filterCategories(groups, "hood").flatMap((g) => g.categories.map((c) => c.name))).toEqual(["Hoodies"]);
    expect(filterCategories(groups, "electron").flatMap((g) => g.categories.map((c) => c.name))).toEqual(["Laptops"]);
    expect(filterCategories(groups, "nothing")).toEqual([]);
  });
});
