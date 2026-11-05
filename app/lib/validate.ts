// Format checks for onboarding, one set per seller country. They mirror the backend rules in
// routes/seller.js so a seller hears about a typo before the form is sent.

import type { SellerCountryCode } from "./currency";

const IN_MOBILE = /^[6-9]\d{9}$/;
const IN_PINCODE = /^[1-9]\d{5}$/;
const GSTIN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const PAN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const AE_MOBILE = /^5\d{8}$/;
const TRN = /^100\d{12}$/;
const EMIRATES_ID = /^784\d{12}$/;
const TRADE_LICENCE = /^[A-Za-z0-9][A-Za-z0-9 ./-]{2,39}$/;

const D = [[0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],[3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],[6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],[9,8,7,6,5,4,3,2,1,0]];
const P = [[0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],[8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],[2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8]];

/** Aadhaar: 12 digits, not starting 0 or 1, with a valid Verhoeff check digit. */
export function aadhaarValid(raw: string): boolean {
  if (!/^[2-9]\d{11}$/.test(raw)) return false;
  let c = 0;
  raw.split("").map(Number).reverse().forEach((n, i) => { c = D[c][P[i % 8][n]]; });
  return c === 0;
}

/** UAE IBAN: AE + 21 digits with the ISO 13616 mod-97 check. Spaces are ignored. */
export function ibanValid(raw: string): boolean {
  const iban = raw.replace(/\s+/g, "").toUpperCase();
  if (!/^AE\d{21}$/.test(iban)) return false;
  const moved = (iban.slice(4) + iban.slice(0, 4)).replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55));
  let r = 0;
  for (const ch of moved) r = (r * 10 + Number(ch)) % 97;
  return r === 1;
}

export interface DetailsInput {
  legal_name: string; business_name: string; contact_name: string; phone: string; address_line: string; city: string;
  state: string; pincode: string; gst_registered: "" | "yes" | "no"; gstin: string; pan_number: string; aadhaar_number: string;
  emirate: string; trade_licence_number: string; trn: string; uae_id_type: "" | "emirates_id" | "passport";
  emirates_id_number: string; iban: string;
  electronics_fulfilment: "" | "seller" | "notmade";
}

export type DetailsErrors = Partial<Record<keyof DetailsInput, string>>;

function common(f: DetailsInput, e: DetailsErrors) {
  if (f.legal_name.trim().length < 2) e.legal_name = "Enter your legal name.";
  if (f.business_name.trim().length < 2) e.business_name = "Enter your brand or store name.";
  if (f.contact_name.trim().length < 2) e.contact_name = "Enter a contact person.";
  if (f.address_line.trim().length < 2) e.address_line = "Enter your address.";
  if (f.city.trim().length < 2) e.city = "Enter your city.";
}

/** Field → message for everything wrong with the form. Empty object means it can be sent. */
export function validateDetails(country: SellerCountryCode, f: DetailsInput): DetailsErrors {
  const e: DetailsErrors = {};
  common(f, e);
  if (country === "IN") {
    if (!IN_MOBILE.test(f.phone)) e.phone = "Enter a 10-digit mobile number starting with 6, 7, 8 or 9.";
    if (!f.state) e.state = "Select your state.";
    if (!IN_PINCODE.test(f.pincode)) e.pincode = "Enter a 6-digit pincode.";
    if (!f.gst_registered) e.gst_registered = "Tell us whether you are GST registered.";
    if (f.gst_registered === "yes") {
      if (!GSTIN.test(f.gstin.toUpperCase())) e.gstin = "Enter a valid 15-character GSTIN.";
      if (f.pan_number && !PAN.test(f.pan_number.toUpperCase())) e.pan_number = "Enter a valid PAN, e.g. ABCDE1234F.";
    }
    if (f.gst_registered === "no") {
      if (!PAN.test(f.pan_number.toUpperCase())) e.pan_number = "Enter a valid PAN, e.g. ABCDE1234F.";
      if (!aadhaarValid(f.aadhaar_number)) e.aadhaar_number = "Enter a valid 12-digit Aadhaar number.";
    }
    return e;
  }
  if (!AE_MOBILE.test(f.phone)) e.phone = "Enter a UAE mobile number, 9 digits starting with 5.";
  if (!f.emirate) e.emirate = "Select your emirate.";
  if (!TRADE_LICENCE.test(f.trade_licence_number.trim())) e.trade_licence_number = "Enter your trade licence number.";
  if (f.trn && !TRN.test(f.trn)) e.trn = "TRN is 15 digits starting with 100.";
  if (!f.uae_id_type) e.uae_id_type = "Choose an identity document.";
  if (f.uae_id_type === "emirates_id" && !EMIRATES_ID.test(f.emirates_id_number)) e.emirates_id_number = "Emirates ID is 15 digits starting with 784.";
  if (!ibanValid(f.iban)) e.iban = "Enter a valid UAE IBAN: AE followed by 21 digits.";
  if (!f.electronics_fulfilment) e.electronics_fulfilment = "Choose who ships your electronics orders.";
  return e;
}
