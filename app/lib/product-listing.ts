// What the listing wizard and bulk upload send to POST /seller/products. Only listing fields go in the
// form: is_live and approval_status are set by the backend and can never be sent from here.
import { productPriceFields, type SellerCountryCode } from "./currency";
import type { OptionImage } from "./seller-api";

export interface SizeRow { size: string; stock: string }
export interface OptionValue { value: string; images: OptionImage[] }

export interface Listing {
  categoryId: string;
  name: string;
  description: string;
  price: string;
  mrp: string;
  hasSizes: boolean;
  sizes: SizeRow[];
  /** Stock when the product has no sizes or colours. */
  stock: string;
  /** Colours, or another option the seller names. Null when there is none. */
  option: { name: string; values: OptionValue[] } | null;
  /** Stock per value and size, keyed by comboKey. */
  comboStock: Record<string, string>;
  /** UAE Electronics only: who ships. Left out everywhere else. */
  fulfilmentMode: "seller_ships" | "notmade_ships" | null;
}

export const EMPTY_LISTING: Listing = {
  categoryId: "", name: "", description: "", price: "", mrp: "", hasSizes: false, sizes: [], stock: "",
  option: null, comboStock: {}, fulfilmentMode: null,
};

export const MAX_PHOTOS = 8; // POST /seller/products takes 8 files per request
export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

export const comboKey = (value: string, size: string | null) => `${value}\u0000${size ?? ""}`;

const sizeList = (l: Listing): (string | null)[] => (l.hasSizes && l.sizes.length ? l.sizes.map((s) => s.size) : [null]);

/** Every value × size the seller has to give stock for. */
export function stockCombos(l: Listing): { key: string; label: string }[] {
  if (!l.option) return [];
  return l.option.values.flatMap((v) => sizeList(l).map((sz) => ({ key: comboKey(v.value, sz), label: sz ? `${v.value} · ${sz}` : v.value })));
}

export function totalStock(l: Listing): number {
  if (l.option) return stockCombos(l).reduce((n, c) => n + (Number(l.comboStock[c.key]) || 0), 0);
  if (l.hasSizes) return l.sizes.reduce((n, s) => n + (Number(s.stock) || 0), 0);
  return Number(l.stock) || 0;
}

export function listingFormData(l: Listing, country: SellerCountryCode, photos: File[]): FormData {
  const fd = new FormData();
  fd.append("name", l.name.trim());
  fd.append("description", l.description.trim());
  fd.append("category_id", l.categoryId);
  for (const [k, v] of Object.entries(productPriceFields(country, l.price, l.mrp))) fd.append(k, v);
  if (l.fulfilmentMode) fd.append("fulfilment_mode", l.fulfilmentMode);

  if (l.option) {
    const name = l.option.name.trim();
    const sizes = l.hasSizes ? l.sizes.map((s) => ({ value: s.size })) : [];
    fd.append("options", JSON.stringify([
      ...(sizes.length ? [{ name: "Size", values: sizes }] : []),
      { name, values: l.option.values.map((v) => ({ value: v.value, images: v.images })) },
    ]));
    fd.append("variants", JSON.stringify(l.option.values.flatMap((v) => sizeList(l).map((sz) => ({
      option_values: { [name]: v.value, ...(sz ? { Size: sz } : {}) },
      stock: Number(l.comboStock[comboKey(v.value, sz)] || 0),
    })))));
  } else if (l.hasSizes && l.sizes.length) {
    fd.append("sizes", JSON.stringify(l.sizes.map((s) => s.size)));
    fd.append("stock_by_size", JSON.stringify(Object.fromEntries(l.sizes.map((s) => [s.size, Number(s.stock || 0)]))));
  } else {
    fd.append("sizes", "[]");
    fd.append("stock", l.stock || "0");
  }
  photos.forEach((f) => fd.append("images", f));
  return fd;
}

export type WizardStep = "category" | "photos" | "details" | "variants" | "price" | "shipping" | "review";

const wholeStock = (v: string) => /^\d+$/.test(v.trim()) && Number(v) <= 100_000;

/** What stops the seller leaving this step. Same limits as the backend. */
export function stepError(step: WizardStep, l: Listing, photos: number): string | null {
  switch (step) {
    case "category": return l.categoryId ? null : "Choose a category to continue.";
    case "photos":
      if (photos === 0) return "Add at least one photo.";
      return photos > MAX_PHOTOS ? `Up to ${MAX_PHOTOS} photos per product.` : null;
    case "details":
      if (l.name.trim().length < 2) return "Add a product title.";
      return l.description.trim().length < 10 ? "Add a description of at least 10 characters." : null;
    case "variants": {
      if (l.hasSizes && !l.sizes.length) return "Add at least one size, or switch sizes off.";
      if (l.option) {
        if (!l.option.name.trim() || l.option.name.trim().toLowerCase() === "size") return "Name the option, for example Colour.";
        if (!l.option.values.length) return `Add at least one ${l.option.name.toLowerCase()}, or switch it off.`;
        return stockCombos(l).every((c) => wholeStock(l.comboStock[c.key] ?? "")) ? null : "Enter stock for every combination, as a whole number.";
      }
      if (l.hasSizes) return l.sizes.every((s) => wholeStock(s.stock)) ? null : "Enter stock for every size, as a whole number.";
      return wholeStock(l.stock) ? null : "Enter your stock, as a whole number.";
    }
    case "price": {
      const p = Number(l.price);
      if (!(p > 0) || p > 1_000_000) return "Enter a selling price above 0.";
      return l.mrp && Number(l.mrp) < p ? "MRP cannot be lower than the selling price." : null;
    }
    case "shipping": return l.fulfilmentMode ? null : "Choose who ships this product.";
    default: return null;
  }
}
