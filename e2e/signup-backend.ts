// A stateful fake of the sign-up contract in docs/seller-api.md: it refuses what the backend refuses, so
// a wrong field name fails here. Nothing in it talks to a real backend unless E2E_LIVE=1 asks for the
// public rate card, which is read-only.
import type { Page, Route } from "@playwright/test";

export type Country = "IN" | "AE";

const LIVE_RATES = {
  india_pct: 17, uae_local_pct: 17,
  uae_rate_card: { version: "AE-2026-11-v3", effective_from: "2026-11-06T18:30:29.87542+00:00", groups: [
    { key: "phones_laptops", label: "Mobile phones & laptops", shipping_included: false, rates: [
      { fulfilment_mode: "seller_ships", pct: 12, label: "You ship", commission_pct: 12, shipping_charge_pct: 0, shipping_charge_label: null },
      { fulfilment_mode: "notmade_ships", pct: 13.5, label: "NOTMADE ships", commission_pct: 12, shipping_charge_pct: 1.5, shipping_charge_label: "NOTMADE shipping charge 1.5%" },
    ] },
    { key: "handmade", label: "Handmade products", shipping_included: false, rates: [{ fulfilment_mode: null, pct: 14 }] },
    { key: "default", label: "Apparel & all other categories", shipping_included: false, rates: [{ fulfilment_mode: null, pct: 17 }] },
  ] },
  india_rate_card: { version: "IN-2026-11-v2", effective_from: "2026-11-06T13:56:00.605118+00:00", groups: [
    { key: "handmade", label: "Handmade products", shipping_included: true, rates: [{ fulfilment_mode: null, pct: 15 }] },
    { key: "default", label: "Fashion & all other categories", shipping_included: true, rates: [{ fulfilment_mode: null, pct: 17 }] },
  ] },
};

const HASH = "a".repeat(64);
const filler = Array.from({ length: 40 }, (_, i) => `<p>Clause ${i + 1}. Agreement text from the backend.</p>`).join("");

const AGREEMENT: Record<Country, { version: string; title: string; html: string; plain_text: string; commission_rate: null; includes_uae_clause: boolean; commission_terms: Record<string, unknown> }> = {
  AE: {
    version: "uae-local-v4", title: "NOTMADE Seller Agreement — UAE",
    html: `<h1>SELLER AGREEMENT — UAE</h1><p><strong>HOUSE OF NOTMADE STUDIO FZE LLC</strong><br/>Licence / Registration No: 2628021907888</p>${filler}`,
    plain_text: "SELLER AGREEMENT — UAE\nHOUSE OF NOTMADE STUDIO FZE LLC\nLicence / Registration No: 2628021907888\n",
    commission_rate: null, includes_uae_clause: true,
    commission_terms: { basis: "rate_card", version: "AE-2026-11-v3", effective_from: LIVE_RATES.uae_rate_card.effective_from, pct: null, rates: {}, default_fulfilment_mode: "seller_ships", phones_laptops: 12, phones_laptops_rates: { seller_ships: 12, notmade_ships: 13.5 }, notmade_shipping_charge_pct: 1.5, handmade: 14, default: 17 },
  },
  IN: {
    version: "in-v3", title: "NOTMADE Seller Agreement",
    html: `<h1>SELLER AGREEMENT</h1><p><strong>House of Notmade Studio Private Limited</strong></p>${filler}`,
    plain_text: "SELLER AGREEMENT\nHouse of Notmade Studio Private Limited\n",
    commission_rate: null, includes_uae_clause: false,
    commission_terms: { basis: "rate_card", version: "IN-2026-11-v2", effective_from: LIVE_RATES.india_rate_card.effective_from, pct: null, rates: {}, handmade: 15, default: 17 },
  },
};

export interface SignupState {
  seller: Record<string, unknown> | null;
  uploaded: string[];
  signups: Record<string, unknown>[];
  signedAt: string | null;
  bank: Record<string, unknown> | null;
  bankBodies: Record<string, unknown>[];
  products: Record<string, unknown>[];
  /** What POST /seller/agreement/sign decides. pending_review is what a seller outside the new terms gets. */
  signOutcome: "approved" | "pending_review";
  signedIn: boolean;
}

const countryOf = (s: SignupState): Country => (s.seller?.seller_country === "AE" ? "AE" : "IN");
const required = (s: SignupState) => (countryOf(s) === "AE"
  ? ["trade_licence", s.seller?.uae_id_type === "passport" ? "passport" : "emirates_id_front"]
  : s.seller?.gst_registered ? ["gst_certificate"] : ["pan_card", "aadhaar_front"]);

function onboarding(s: SignupState) {
  const status = String(s.seller?.onboarding_status);
  const missing = required(s).filter((d) => !s.uploaded.includes(d));
  const next = status === "approved" ? "done" : missing.length ? "documents" : !s.signedAt ? "agreement" : "review";
  return { onboarding_status: status, next_step: next, missing_fields: [], required_documents: required(s), uploaded_documents: s.uploaded, missing_documents: missing,
    bank_details_complete: !!s.bank, agreement_signed: !!s.signedAt, agreement_signed_at: s.signedAt, seller_country: countryOf(s) };
}

function bankView(s: SignupState) {
  const ae = countryOf(s) === "AE";
  const iban = String(s.seller?.iban ?? "");
  const complete = ae ? !!iban : !!s.bank;
  const shared = { account_holder_name: s.bank?.account_holder_name ?? null, bank_name: s.bank?.bank_name ?? null };
  return { country: countryOf(s), complete, bank: ae
    ? { ...shared, iban: iban ? `${iban.slice(0, 4)} •••• •••• ${iban.slice(-4)}` : null }
    : { ...shared, account_number: s.bank ? `•••• ${String(s.bank.account_number).slice(-4)}` : null, ifsc: s.bank?.ifsc ?? null } };
}

const money = (s: SignupState, n: number) => ({ [countryOf(s) === "AE" ? "AED" : "INR"]: n });

function dashboard(s: SignupState) {
  const pending = s.products.length;
  return { country: countryOf(s), currency: countryOf(s) === "AE" ? "AED" : "INR", today: { orders: 0, payout: {}, revenue: {} }, pending_accept: { count: 0, overdue: 0, next_due_at: null },
    ready_for_pickup: { count: 0, awaiting_awb: 0, awb_generated: 0 }, counts: { new: 0, accepted: 0, ready: 0, shipped: 0, delivered: 0, cancelled: 0, returns: 0 },
    low_stock: { count: 0, threshold: 3, items: [] }, earnings: { today: {}, month: {}, delivered_lifetime: {} }, next_settlement: null, settlement_days: 7, returns: { open: 0 },
    products: { total: pending, live: 0, pending, rejected: 0 }, sla_hours: 24, recent_orders: [] };
}

export async function serveSignup(page: Page, over: Partial<SignupState> = {}): Promise<SignupState> {
  const s: SignupState = { seller: null, uploaded: [], signups: [], signedAt: null, bank: null, bankBodies: [], products: [], signOutcome: "approved", signedIn: false, ...over };
  await page.route(/railway\.app\//, async (route: Route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" };
    const json = (body: unknown, status = 200) => route.fulfill({ status, contentType: "application/json", headers: cors, body: JSON.stringify(body) });
    if (req.method() === "OPTIONS") return json({});
    const body = () => (req.postDataJSON() ?? {}) as Record<string, unknown>;
    const key = `${req.method()} ${path}`;

    if (key === "GET /seller/commission-rates") {
      if (process.env.E2E_LIVE !== "1") return json(LIVE_RATES);
      const live = await route.fetch();
      return route.fulfill({ response: live, headers: { ...live.headers(), ...cors } });
    }
    if (key === "POST /seller-auth/send-otp") {
      const b = body();
      if (b.purpose === "login" && !s.seller) return json({ error: "No seller account" }, 404);
      return json({ success: true, message: "sent", expires_in_seconds: 600 });
    }
    if (key === "POST /seller-auth/verify-otp") {
      s.signedIn = true;
      return json({ token: "test-token", seller_id: s.seller?.id ?? null, onboarding_status: s.seller?.onboarding_status ?? "pending_details", is_new: !s.seller });
    }
    if (key === "POST /seller/signup") {
      const b = body();
      s.signups.push(b);
      const country = b.seller_country as Country;
      if (!country) return json({ code: "COUNTRY_REQUIRED", error: "seller_country is required (IN or AE)" }, 400);
      if (country === "AE" && !b.default_fulfilment_mode) return json({ error: "default_fulfilment_mode is required (seller_ships or notmade_ships)" }, 400);
      if (country === "IN" && (b.default_fulfilment_mode || b.iban)) return json({ code: "COUNTRY_DATA_MISMATCH", error: "These details do not match a India seller", fields: ["default_fulfilment_mode"] }, 400);
      s.seller = { id: "s-new", email: "new@brand.example", ...b, country, currency: country === "AE" ? "AED" : "INR", onboarding_status: "pending_agreement", agreement_signed_at: null, created_at: new Date().toISOString(), commission_rate: 17 };
      return json({ seller: s.seller, token: "test-token-2", required_documents: required(s) }, 201);
    }
    if (!s.seller) return path.startsWith("/seller/") ? json({ error: "No seller" }, 403) : route.fulfill({ status: 404, body: "" });

    if (key === "GET /seller/me") {
      const signed = s.signedAt ? AGREEMENT[countryOf(s)].version : null;
      return json({ seller: s.seller, rate_card: { groups: (countryOf(s) === "AE" ? LIVE_RATES.uae_rate_card : LIVE_RATES.india_rate_card).groups },
        agreement: { seller_country: countryOf(s), required_version: AGREEMENT[countryOf(s)].version, required_open: true, signed_version: signed, signed_at: s.signedAt, resign_required: false },
        uae: { seller_country: countryOf(s), ready: !!signed && countryOf(s) === "AE", required_agreement_version: "uae-local-v3", signed_agreement_version: signed, signed_at: s.signedAt, commission_pct: null },
        commission: { pricing: "seller_controlled", india_pct: countryOf(s) === "IN" ? 17 : null } });
    }
    if (key === "GET /seller/onboarding-status") return json(onboarding(s));
    if (key === "POST /seller/documents") {
      // The browser does not expose a multipart body with a file in it, so uploads fill the list in order
      const type = required(s).find((d) => !s.uploaded.includes(d)) ?? "logo";
      s.uploaded.push(type);
      return json({ document: { id: type, doc_type: type, mime_type: "image/png", size_bytes: 1, created_at: new Date().toISOString() } }, 201);
    }
    const stored = { ...AGREEMENT[countryOf(s)], text: "x", agreement_hash: HASH, pricing_model: "seller_controlled" };
    if (key === "GET /seller/agreement") return json(s.signedAt ? { ...stored, commission_terms: undefined, signed: true, signed_at: s.signedAt } : { ...stored, signed: false, status: {} });
    if (key === "POST /seller/agreement/sign") {
      const b = body();
      if (b.agreement_hash !== HASH) return json({ error: "Agreement text has changed.", agreement_hash: HASH }, 409);
      if (!/^\d{6}$/.test(String(b.code))) return json({ error: "Invalid code" }, 400);
      s.signedAt = new Date().toISOString();
      s.seller = { ...s.seller, onboarding_status: s.signOutcome, agreement_signed_at: s.signedAt };
      return json({ agreement: { id: "a1", version: stored.version, agreement_hash: HASH, signed_at: s.signedAt }, onboarding_status: s.signOutcome, status: {} }, 201);
    }
    if (key === "GET /seller/agreements/signed") return json({ agreements: s.signedAt ? [{ id: "a1", version: stored.version, title: stored.title, agreement_hash: HASH, signer_name: s.seller.contact_name, signed_at: s.signedAt, html: stored.html, plain_text: stored.plain_text }] : [] });
    if (key === "GET /seller/dashboard") return json(dashboard(s));
    if (key === "GET /seller/orders") return json({ orders: [], counts: dashboard(s).counts, sla_hours: 24 });
    if (key === "GET /seller/products") return json({ products: s.products });
    if (key === "GET /seller/payouts") {
      const bank = bankView(s);
      return json({ payouts: [], upcoming: [], totals: { paid: money(s, 0), scheduled: money(s, 0), upcoming: money(s, 0) }, settlement_days: 7, bank_details_complete: bank.complete, payout_blocked: !bank.complete });
    }
    if (key === "GET /seller/bank-details") return json(bankView(s));
    if (key === "PUT /seller/bank-details") {
      const b = body();
      s.bankBodies.push(b);
      if (countryOf(s) === "IN" && b.iban) return json({ code: "COUNTRY_DATA_MISMATCH", error: "mismatch", fields: ["iban"] }, 400);
      if (countryOf(s) === "AE" && (b.account_number || b.ifsc)) return json({ code: "COUNTRY_DATA_MISMATCH", error: "mismatch", fields: ["ifsc"] }, 400);
      if (countryOf(s) === "AE") s.seller = { ...s.seller, iban: b.iban };
      s.bank = b;
      return json(bankView(s));
    }
    if (key === "GET /seller/documents") return json({ documents: [] });
    if (key === "GET /seller/notifications") return json({ notifications: [], unread_count: 0 });
    if (key === "GET /seller/categories") return json({ categories: [{ id: "11111111-1111-4111-8111-111111111111", name: "Handmade", slug: "handmade", commission_group: "handmade" }] });
    return route.fulfill({ status: 404, contentType: "text/html", headers: cors, body: `<pre>Cannot ${req.method()} ${path}</pre>` });
  });
  return s;
}

/** A seller already through sign-up, straight on the dashboard. */
export const signedInSeller = (country: Country): Partial<SignupState> => ({
  signedIn: true, signedAt: "2026-11-06T10:00:00.000Z", uploaded: [],
  seller: { id: "s-new", email: "new@brand.example", seller_country: country, country, currency: country === "AE" ? "AED" : "INR", legal_name: "Test Brand", business_name: "Test Brand", contact_name: "Test Person",
    onboarding_status: "approved", agreement_signed_at: "2026-11-06T10:00:00.000Z", created_at: "2026-11-06T09:00:00.000Z", commission_rate: 17, gst_registered: country === "IN", iban: country === "AE" ? "AE070331234567890123456" : undefined },
});
