import { describe, expect, it } from "vitest";
import {
  CURRENCY_BY_COUNTRY, canOpenRoute, currencySymbol, formatMoney, formatMoneyIn, productPrice, productPriceFields, sellerCountry, sellerCurrency, sellerTimeZone,
} from "@/app/lib/currency";
import { MARKETS } from "@/src/config/markets";
import { aadhaarValid, ibanValid, validateDetails, type DetailsInput } from "@/app/lib/validate";

const blank: DetailsInput = {
  legal_name: "Acme Studio", business_name: "Acme", contact_name: "A Person", phone: "", address_line: "Street 1", city: "Town",
  state: "", pincode: "", gst_registered: "", gstin: "", pan_number: "", aadhaar_number: "", emirate: "", trade_licence_number: "",
  trn: "", uae_id_type: "", emirates_id_number: "", iban: "", electronics_fulfilment: "",
};
const india: DetailsInput = { ...blank, phone: "9876543210", state: "Delhi", pincode: "110001", gst_registered: "yes", gstin: "27ABCDE1234F1Z5" };
const uae: DetailsInput = {
  ...blank, phone: "501234567", emirate: "Dubai", trade_licence_number: "CN-12345", uae_id_type: "passport",
  iban: "AE07 0331 2345 6789 0123 456", electronics_fulfilment: "seller",
};

describe("country decides currency", () => {
  it("maps India to INR and UAE to AED, with no third option", () => {
    expect(CURRENCY_BY_COUNTRY).toEqual({ IN: "INR", AE: "AED" });
    expect(MARKETS.map((m) => [m.sellerCountry, m.currency, m.payoutCurrency])).toEqual([["IN", "INR", "INR"], ["AE", "AED", "AED"]]);
  });

  it("reads the seller's country, defaulting to India", () => {
    expect(sellerCountry({ seller_country: "AE" })).toBe("AE");
    expect(sellerCountry({ seller_country: "ae" })).toBe("AE");
    expect(sellerCountry({ agreement: { seller_country: "AE" } })).toBe("AE");
    expect(sellerCountry(null)).toBe("IN");
    expect(sellerCurrency({ seller_country: "AE" })).toBe("AED");
    expect(sellerCurrency({ seller_country: "IN" })).toBe("INR");
  });

  it("formats each currency its own way", () => {
    expect(formatMoney(1200, "INR")).toBe("₹1,200");
    expect(formatMoney(55, "AED")).toBe("AED 55.00");
    expect(currencySymbol("INR")).toBe("₹");
    expect(currencySymbol("AED")).toBe("AED");
  });

  it("shows only the seller's currency from a mixed amount", () => {
    expect(formatMoneyIn({ INR: 100, AED: 7 }, "INR")).toBe("₹100");
    expect(formatMoneyIn({ INR: 100, AED: 7 }, "AED")).toBe("AED 7.00");
  });

  it("sends only the seller's own price fields", () => {
    expect(productPriceFields("IN", "100", "120")).toEqual({ price_inr: "100", mrp: "120" });
    expect(Object.keys(productPriceFields("IN", "100", ""))).not.toContain("price_aed");
    const ae = productPriceFields("AE", "50", "60");
    expect(ae).toMatchObject({ price_aed: "50", mrp_aed: "60" });
    expect(Object.keys(ae).filter((k) => k.includes("inr") || k === "mrp")).toEqual([]);
  });

  it("reads only the seller's own price", () => {
    const p = { price_inr: 100, original_price_inr: 120, price_aed: 50, original_price_aed: 60 };
    expect(productPrice(p, "IN")).toEqual({ price: 100, mrp: 120 });
    expect(productPrice(p, "AE")).toEqual({ price: 50, mrp: 60 });
    expect(productPrice({ price_inr: 100 }, "AE").price).toBeNull();
  });

  it("uses the seller's own time zone", () => {
    expect(sellerTimeZone("AE")).toBe("Asia/Dubai");
    expect(sellerTimeZone("IN")).toBe("Asia/Kolkata");
  });

  it("keeps India-only pages from UAE sellers", () => {
    expect(canOpenRoute({ seller_country: "AE" }, "/dashboard/warehouse")).toBe(false);
    expect(canOpenRoute({ seller_country: "IN" }, "/dashboard/warehouse")).toBe(true);
    expect(canOpenRoute({ seller_country: "AE" }, "/dashboard/inventory")).toBe(true);
  });
});

describe("formats per country", () => {
  it("accepts a valid form for each country", () => {
    expect(validateDetails("IN", india)).toEqual({});
    expect(validateDetails("AE", uae)).toEqual({});
  });

  it("does not accept one country's details for the other", () => {
    expect(validateDetails("AE", { ...uae, phone: "9876543210" }).phone).toBeTruthy();
    expect(validateDetails("IN", { ...india, phone: "501234567" }).phone).toBeTruthy();
  });

  it("checks India formats", () => {
    expect(validateDetails("IN", { ...india, pincode: "012345" }).pincode).toBeTruthy();
    expect(validateDetails("IN", { ...india, gstin: "27ABCDE1234F1Z" }).gstin).toBeTruthy();
    const noGst = { ...india, gst_registered: "no" as const, gstin: "", pan_number: "ABCDE1234", aadhaar_number: "123412341234" };
    const e = validateDetails("IN", noGst);
    expect(e.pan_number).toBeTruthy();
    expect(e.aadhaar_number).toBeTruthy();
  });

  it("checks UAE formats", () => {
    expect(validateDetails("AE", { ...uae, trn: "200123456789012" }).trn).toBeTruthy();
    expect(validateDetails("AE", { ...uae, uae_id_type: "emirates_id", emirates_id_number: "123" }).emirates_id_number).toBeTruthy();
    expect(validateDetails("AE", { ...uae, iban: "AE070331234567890123457" }).iban).toBeTruthy();
    expect(validateDetails("AE", { ...uae, emirate: "" }).emirate).toBeTruthy();
  });

  it("requires a fulfilment choice from UAE sellers only", () => {
    expect(validateDetails("AE", { ...uae, electronics_fulfilment: "" }).electronics_fulfilment).toBeTruthy();
    expect(validateDetails("IN", india).electronics_fulfilment).toBeUndefined();
  });

  it("runs the checksums", () => {
    expect(ibanValid("AE070331234567890123456")).toBe(true);
    expect(ibanValid("AE070331234567890123457")).toBe(false);
    expect(aadhaarValid("234123412346")).toBe(true);
    expect(aadhaarValid("234123412347")).toBe(false);
  });
});
