"use client";

import { Suspense, useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  api, ApiError, setToken, DOC_LABELS, fmtDate,
  type DocType, type OnboardingState, type Seller, type SellerCountry,
} from "../lib/seller-api";
import { useSeller } from "../lib/useSeller";
import { Alert, Button, Card, Field, FullPageSpinner, RED, Spinner } from "../components/portal-ui";
import { AgreementSigner, Pill } from "../components/AgreementSigner";
import { Flag, MarketSwitcher, Waitlist, useMarket } from "../components/market";
import {
  MARKETS, SETTLEMENT_DAYS, marketForCountry, openMarketsSentence, type Market,
} from "@/src/config/markets";

type StepKey = "details" | "documents" | "agreement" | "review";
const STEPS: { key: StepKey; label: string }[] = [
  { key: "details", label: "Business details" },
  { key: "documents", label: "KYC documents" },
  { key: "agreement", label: "Sign agreement" },
  { key: "review", label: "Review" },
];

const EDITABLE = ["pending_details", "pending_agreement"];

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const EMIRATES = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  return <Suspense fallback={<FullPageSpinner />}><Onboarding /></Suspense>;
}

const SELLER_MARKETS = MARKETS.filter(m => m.sellerCountry);

/** Commission for a business country: the seller's own rate from the API when we have it, else the market config. */
function commissionFor(m: Market, seller: Seller | null): number | null {
  if (m.sellerCountry === "IN" && seller?.commission_rate != null) return seller.commission_rate;
  if (m.sellerCountry === "AE" && seller?.seller_country === "AE") return seller.uae?.commission_pct ?? seller.commission_rate ?? m.commissionPct;
  return m.commissionPct;
}

function Onboarding() {
  const router = useRouter();
  const [market, setMarket] = useMarket();
  const { state, reload, signOut } = useSeller();
  const [status, setStatus] = useState<OnboardingState | null>(null);
  const [statusErr, setStatusErr] = useState("");
  const [view, setView] = useState<StepKey | null>(null);

  const seller = state.status === "ready" ? state.seller : null;

  const loadStatus = useCallback(async () => {
    setStatusErr("");
    try {
      const s = await api.onboardingStatus();
      if (s.next_step === "done") { router.replace("/dashboard"); return; }
      setStatus(s);
    } catch (err) {
      setStatusErr(err instanceof Error ? err.message : "Could not load onboarding status");
    }
  }, [router]);

  useEffect(() => {
    if (state.status === "ready" && state.seller) void loadStatus();
  }, [state, loadStatus]);

  const refresh = async () => { setView(null); await reload(); };

  let body: React.ReactNode;
  let current: StepKey = "details";
  if (state.status === "loading" || (seller && !status && !statusErr)) {
    body = <FullPageSpinner />;
  } else if (state.status === "error" || statusErr) {
    body = (
      <Alert>
        {state.status === "error" ? state.message : statusErr}{" "}
        <button type="button" onClick={() => void refresh()} style={{ color: RED, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>Retry</button>
      </Alert>
    );
  } else if (!seller) {
    // Signed up by email but no seller row yet
    body = <DetailsStep seller={null} onSaved={refresh} market={market} />;
  } else if (status) {
    const ns = status.next_step;
    const sellerMarket = marketForCountry(seller.seller_country === "AE" ? "AE" : "IN");
    const editing = EDITABLE.includes(seller.onboarding_status ?? "pending_details");
    if (ns === "rejected" || ns === "suspended") {
      body = <ClosedState kind={ns} />;
    } else if (editing && sellerMarket && !sellerMarket.open && view !== "details") {
      body = <WaitlistState market={sellerMarket} onChangeCountry={() => setView("details")} />;
    } else {
      const derived: StepKey = ns === "details" || ns === "documents" || ns === "agreement" ? ns : "review";
      current = view ?? derived;
      const editable = EDITABLE.includes(seller.onboarding_status ?? "pending_details");
      body = (
        <>
          {current === "details" && <DetailsStep seller={seller} onSaved={refresh} readOnly={!editable} market={market} />}
          {current === "documents" && <DocumentsStep status={status} onChanged={loadStatus} onContinue={refresh} />}
          {current === "agreement" && <AgreementStep seller={seller} onSigned={refresh} />}
          {current === "review" && <ReviewState seller={seller} status={status} />}
        </>
      );
    }
  }

  const reachable = (key: StepKey) => {
    if (!status || !seller) return key === "details";
    const order = STEPS.map(s => s.key);
    const ns = status.next_step;
    const furthest: StepKey = ns === "details" || ns === "documents" || ns === "agreement" ? ns : "review";
    return order.indexOf(key) <= order.indexOf(furthest);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F5F5F5" }}>
      <header style={{ background: "#FFFFFF", borderBottom: "1px solid #EEEEEE" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 16px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <a href="/" style={{ textDecoration: "none", fontSize: "1.125rem", fontWeight: 900, letterSpacing: "-0.02em" }}>
            <span style={{ color: "#111111" }}>NOT</span><span style={{ color: RED }}>MADE</span>
            <span style={{ fontSize: 10, color: "#888888", fontWeight: 600, letterSpacing: "0.12em", marginLeft: 8 }}>SELLER</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <MarketSwitcher value={market} onChange={setMarket} compact />
            {seller?.email && <span style={{ fontSize: 13, color: "#777777", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{seller.email}</span>}
            <Button variant="ghost" onClick={signOut} style={{ padding: "8px 10px" }}>Log out</Button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "28px 16px 64px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111111", letterSpacing: "-0.02em" }}>Set up your seller account</h1>
        <p style={{ fontSize: 14, color: "#777777", marginTop: 4, marginBottom: 22 }}>
          A few steps and our team will review your application — usually within 48 hours.
        </p>

        <ol style={{ display: "flex", gap: 8, listStyle: "none", padding: 0, margin: "0 0 22px", flexWrap: "wrap" }}>
          {STEPS.map((s, i) => {
            const active = s.key === current;
            const can = reachable(s.key) && s.key !== current;
            return (
              <li key={s.key}>
                <button type="button" disabled={!can} onClick={() => setView(s.key)} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 100,
                  border: `1.5px solid ${active ? RED : "#E5E5E5"}`, background: active ? "rgba(204,0,0,0.06)" : "#FFFFFF",
                  color: active ? RED : reachable(s.key) ? "#333333" : "#AAAAAA", fontSize: 13, fontWeight: 600,
                  cursor: can ? "pointer" : "default", fontFamily: "inherit",
                }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, background: active ? RED : reachable(s.key) ? "#111111" : "#E5E5E5", color: "#FFFFFF",
                  }}>{i + 1}</span>
                  {s.label}
                </button>
              </li>
            );
          })}
        </ol>

        {body}
      </main>
    </div>
  );
}

// ─── Step 1: details ──────────────────────────────────────────────────────────

interface DetailsForm {
  seller_country: "" | SellerCountry;
  legal_name: string; business_name: string; contact_name: string; phone: string;
  address_line: string; city: string; state: string; pincode: string;
  pricing_model: "" | "managed" | "seller_controlled";
  gst_registered: "" | "yes" | "no"; gstin: string; pan_number: string; aadhaar_number: string;
  sell_in_uae: boolean;
  // UAE path
  emirate: string; trade_licence_number: string; trn: string;
  uae_id_type: "" | "emirates_id" | "passport"; emirates_id_number: string; iban: string;
}

function fromSeller(s: Seller | null): DetailsForm {
  const country: "" | SellerCountry = s ? (s.seller_country === "AE" ? "AE" : "IN") : "";
  return {
    seller_country: country,
    legal_name: s?.legal_name ?? "", business_name: s?.business_name ?? "", contact_name: s?.contact_name ?? "",
    phone: (country === "AE" ? s?.phone?.replace(/^\+971/, "") : s?.phone) ?? "",
    address_line: s?.address_line ?? "", city: s?.city ?? "", state: s?.state ?? "",
    pincode: s?.pincode ?? "", pricing_model: s?.pricing_model ?? "",
    gst_registered: s?.gst_registered == null ? "" : s.gst_registered ? "yes" : "no",
    gstin: s?.gstin ?? "", pan_number: s?.pan_number ?? "", aadhaar_number: "", sell_in_uae: !!s?.sell_in_uae,
    emirate: s?.emirate ?? "", trade_licence_number: s?.trade_licence_number ?? "", trn: s?.trn ?? "",
    uae_id_type: s?.uae_id_type ?? "", emirates_id_number: "", iban: s?.iban ?? "",
  };
}

const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 };

function DetailsStep({ seller, onSaved, readOnly = false, market }: {
  seller: Seller | null; onSaved: () => Promise<void>; readOnly?: boolean; market: Market;
}) {
  const [f, setF] = useState<DetailsForm>(() => {
    const init = fromSeller(seller);
    // New sellers start on the country they picked in the switcher
    return !seller && market.sellerCountry && market.open ? { ...init, seller_country: market.sellerCountry } : init;
  });

  // Switching country in the header moves a new seller's choice along with it
  useEffect(() => {
    if (!seller && market.sellerCountry) setF(p => ({ ...p, seller_country: market.sellerCountry! }));
  }, [market, seller]);

  const chosen = f.seller_country ? marketForCountry(f.seller_country) : undefined;
  const blocked = !!chosen && !chosen.open && !readOnly;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const set = (k: keyof DetailsForm) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const v = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setF(p => ({ ...p, [k]: v }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(""); setErrors([]);
    try {
      let body: Record<string, unknown>;
      if (f.seller_country === "AE") {
        body = {
          seller_country: "AE",
          legal_name: f.legal_name, business_name: f.business_name, contact_name: f.contact_name, phone: f.phone,
          address_line: f.address_line, city: f.city, emirate: f.emirate, pricing_model: f.pricing_model,
          trade_licence_number: f.trade_licence_number.toUpperCase(), trn: f.trn, uae_id_type: f.uae_id_type,
          iban: f.iban.replace(/\s+/g, "").toUpperCase(),
        };
        if (f.uae_id_type === "emirates_id") body.emirates_id_number = f.emirates_id_number;
      } else {
        const gst = f.gst_registered === "yes";
        body = {
          seller_country: "IN",
          legal_name: f.legal_name, business_name: f.business_name, contact_name: f.contact_name, phone: f.phone,
          address_line: f.address_line, city: f.city, state: f.state, pincode: f.pincode,
          pricing_model: f.pricing_model, gst_registered: f.gst_registered === "" ? "" : gst,
          gstin: gst ? f.gstin.toUpperCase() : "", pan_number: f.pan_number.toUpperCase(), sell_in_uae: f.sell_in_uae,
        };
        if (!gst) body.aadhaar_number = f.aadhaar_number;
      }
      const res = await api.signup(body);
      if (res.token) setToken(res.token);
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save details");
      if (err instanceof ApiError && Array.isArray(err.data.errors)) setErrors(err.data.errors as string[]);
      setSaving(false);
    }
  };

  // Aadhaar is never returned by the backend, so re-editing a non-GST seller needs it re-entered.
  const needsAadhaar = f.gst_registered === "no";

  return (
    <Card>
      <form onSubmit={submit}>
        <fieldset disabled={readOnly || saving} style={{ border: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 22 }}>
          {readOnly && <Alert kind="info">Your details are locked while your application is being processed.</Alert>}

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, color: "#111111" }}>Where is your business based?</h2>
            <div style={grid2}>
              {SELLER_MARKETS.map(m => (
                <Choice key={m.code} name="seller_country" checked={f.seller_country === m.sellerCountry}
                  onChange={() => setF(p => ({ ...p, seller_country: m.sellerCountry! }))}
                  title={<span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Flag market={m} size={12} />{m.name}</span>}
                  sub={m.open ? m.documents.slice(0, 2).join(", ") : "Waitlist only for now"} />
              ))}
            </div>
            {chosen && chosen.open && <CountryTerms market={chosen} seller={seller} />}
          </section>

          {blocked && chosen && <WaitlistNote market={chosen} />}

          {!blocked && f.seller_country === "AE" && <UaeDetailsFields f={f} setF={setF} set={set} />}

          {!blocked && f.seller_country === "IN" && <>
          <section>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, color: "#111111" }}>Business</h2>
            <div style={grid2}>
              <Field label="Legal name" hint="As on PAN / GST registration" htmlFor="legal_name">
                <input id="legal_name" className="field-input" value={f.legal_name} onChange={set("legal_name")} required minLength={2} maxLength={200} />
              </Field>
              <Field label="Brand / store name" hint="Shown to customers" htmlFor="business_name">
                <input id="business_name" className="field-input" value={f.business_name} onChange={set("business_name")} required minLength={2} maxLength={200} />
              </Field>
              <Field label="Contact person" htmlFor="contact_name">
                <input id="contact_name" className="field-input" value={f.contact_name} onChange={set("contact_name")} required minLength={2} maxLength={120} autoComplete="name" />
              </Field>
              <Field label="Mobile number" htmlFor="phone">
                <div className="phone-field">
                  <span className="phone-prefix">+91</span>
                  <input id="phone" className="phone-input" value={f.phone} inputMode="numeric" maxLength={10} pattern="[6-9][0-9]{9}"
                    required autoComplete="tel-national" placeholder="9876543210"
                    onChange={e => setF(p => ({ ...p, phone: e.target.value.replace(/\D/g, "") }))} />
                </div>
              </Field>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, color: "#111111" }}>Pickup address</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Address" htmlFor="address_line">
                <textarea id="address_line" className="field-input" rows={2} value={f.address_line} onChange={set("address_line")} required minLength={2} maxLength={400} autoComplete="street-address" />
              </Field>
              <div style={{ ...grid2, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                <Field label="City" htmlFor="city">
                  <input id="city" className="field-input" value={f.city} onChange={set("city")} required minLength={2} maxLength={100} autoComplete="address-level2" />
                </Field>
                <Field label="State" htmlFor="state">
                  <select id="state" className="field-input" value={f.state} onChange={set("state")} required>
                    <option value="">Select state</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    {f.state && !INDIAN_STATES.includes(f.state) && <option value={f.state}>{f.state}</option>}
                  </select>
                </Field>
                <Field label="Pincode" htmlFor="pincode">
                  <input id="pincode" className="field-input" value={f.pincode} inputMode="numeric" maxLength={6} pattern="[1-9][0-9]{5}" required autoComplete="postal-code"
                    onChange={e => setF(p => ({ ...p, pincode: e.target.value.replace(/\D/g, "") }))} />
                </Field>
              </div>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, color: "#111111" }}>Tax & KYC</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Are you GST registered?">
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {(["yes", "no"] as const).map(v => (
                    <Choice key={v} name="gst_registered" checked={f.gst_registered === v} onChange={() => setF(p => ({ ...p, gst_registered: v }))}
                      title={v === "yes" ? "Yes, I have a GSTIN" : "No, not registered"} />
                  ))}
                </div>
              </Field>
              {f.gst_registered === "yes" && (
                <div style={grid2}>
                  <Field label="GSTIN" htmlFor="gstin" hint="15 characters, e.g. 27ABCDE1234F1Z5">
                    <input id="gstin" className="field-input" value={f.gstin} maxLength={15} required style={{ textTransform: "uppercase" }}
                      pattern="[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z][1-9A-Za-z][Zz][0-9A-Za-z]" onChange={set("gstin")} />
                  </Field>
                  <Field label="PAN (optional)" htmlFor="pan_number">
                    <input id="pan_number" className="field-input" value={f.pan_number} maxLength={10} style={{ textTransform: "uppercase" }}
                      pattern="[A-Za-z]{5}[0-9]{4}[A-Za-z]" onChange={set("pan_number")} />
                  </Field>
                </div>
              )}
              {needsAadhaar && (
                <div style={grid2}>
                  <Field label="PAN" htmlFor="pan_number" hint="e.g. ABCDE1234F">
                    <input id="pan_number" className="field-input" value={f.pan_number} maxLength={10} required style={{ textTransform: "uppercase" }}
                      pattern="[A-Za-z]{5}[0-9]{4}[A-Za-z]" onChange={set("pan_number")} />
                  </Field>
                  <Field label="Aadhaar number" htmlFor="aadhaar_number"
                    hint={seller?.aadhaar_last4 ? `On file: •••• ${seller.aadhaar_last4}. Re-enter to save changes.` : "We store only the last 4 digits."}>
                    <input id="aadhaar_number" className="field-input" value={f.aadhaar_number} inputMode="numeric" maxLength={12} pattern="[2-9][0-9]{11}" required
                      autoComplete="off" onChange={e => setF(p => ({ ...p, aadhaar_number: e.target.value.replace(/\D/g, "") }))} />
                  </Field>
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, color: "#111111" }}>How you want to sell</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Pricing model">
                <div style={grid2}>
                  <Choice name="pricing_model" checked={f.pricing_model === "managed"} onChange={() => setF(p => ({ ...p, pricing_model: "managed" }))}
                    title="Managed" sub="NOTMADE helps set and optimise your prices." />
                  <Choice name="pricing_model" checked={f.pricing_model === "seller_controlled"} onChange={() => setF(p => ({ ...p, pricing_model: "seller_controlled" }))}
                    title="Seller controlled" sub="You set your own prices." />
                </div>
              </Field>
              <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#333333", cursor: "pointer" }}>
                <input type="checkbox" checked={f.sell_in_uae} onChange={set("sell_in_uae")} style={{ width: 18, height: 18, accentColor: RED }} />
                I also want to sell in the UAE
              </label>
            </div>
          </section>
          </>}

          {error && (
            <Alert>
              {error}
              {errors.length > 1 && <ul style={{ margin: "6px 0 0 18px" }}>{errors.slice(1).map(e => <li key={e}>{e}</li>)}</ul>}
            </Alert>
          )}

          {!readOnly && !blocked && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button type="submit" disabled={saving || !f.seller_country || !f.pricing_model || (f.seller_country === "IN" ? !f.gst_registered : !f.uae_id_type)}>
                {saving ? "Saving…" : "Save & continue →"}
              </Button>
            </div>
          )}
        </fieldset>
      </form>
    </Card>
  );
}

function UaeDetailsFields({ f, setF, set }: {
  f: DetailsForm;
  setF: React.Dispatch<React.SetStateAction<DetailsForm>>;
  set: (k: keyof DetailsForm) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}) {
  return (
    <>
      <section>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, color: "#111111" }}>Business</h2>
        <div style={grid2}>
          <Field label="Legal name" hint="As on your trade licence" htmlFor="legal_name">
            <input id="legal_name" className="field-input" value={f.legal_name} onChange={set("legal_name")} required minLength={2} maxLength={200} />
          </Field>
          <Field label="Business / brand name" hint="Shown to customers" htmlFor="business_name">
            <input id="business_name" className="field-input" value={f.business_name} onChange={set("business_name")} required minLength={2} maxLength={200} />
          </Field>
          <Field label="Contact person" htmlFor="contact_name">
            <input id="contact_name" className="field-input" value={f.contact_name} onChange={set("contact_name")} required minLength={2} maxLength={120} autoComplete="name" />
          </Field>
          <Field label="Mobile number" htmlFor="phone">
            <div className="phone-field">
              <span className="phone-prefix">+971</span>
              <input id="phone" className="phone-input" value={f.phone} inputMode="numeric" maxLength={9} pattern="5[0-9]{8}"
                required autoComplete="tel-national" placeholder="501234567"
                onChange={e => setF(p => ({ ...p, phone: e.target.value.replace(/\D/g, "").replace(/^0/, "") }))} />
            </div>
          </Field>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, color: "#111111" }}>Business address</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Address" htmlFor="address_line">
            <textarea id="address_line" className="field-input" rows={2} value={f.address_line} onChange={set("address_line")} required minLength={2} maxLength={400} autoComplete="street-address" />
          </Field>
          <div style={{ ...grid2, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            <Field label="City / area" htmlFor="city">
              <input id="city" className="field-input" value={f.city} onChange={set("city")} required minLength={2} maxLength={100} autoComplete="address-level2" />
            </Field>
            <Field label="Emirate" htmlFor="emirate">
              <select id="emirate" className="field-input" value={f.emirate} onChange={set("emirate")} required>
                <option value="">Select emirate</option>
                {EMIRATES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </Field>
          </div>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, color: "#111111" }}>Licence & KYC</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={grid2}>
            <Field label="Trade licence number" htmlFor="trade_licence_number" hint="You'll upload the licence in the next step.">
              <input id="trade_licence_number" className="field-input" value={f.trade_licence_number} onChange={set("trade_licence_number")} required minLength={3} maxLength={40} style={{ textTransform: "uppercase" }} />
            </Field>
            <Field label="TRN (optional)" htmlFor="trn" hint="Only if VAT registered — 15 digits starting 100">
              <input id="trn" className="field-input" value={f.trn} inputMode="numeric" maxLength={15} pattern="100[0-9]{12}"
                onChange={e => setF(p => ({ ...p, trn: e.target.value.replace(/\D/g, "") }))} />
            </Field>
          </div>
          <Field label="Identity document">
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Choice name="uae_id_type" checked={f.uae_id_type === "emirates_id"} onChange={() => setF(p => ({ ...p, uae_id_type: "emirates_id" }))} title="Emirates ID" />
              <Choice name="uae_id_type" checked={f.uae_id_type === "passport"} onChange={() => setF(p => ({ ...p, uae_id_type: "passport" }))} title="Passport" />
            </div>
          </Field>
          {f.uae_id_type === "emirates_id" && (
            <Field label="Emirates ID number" htmlFor="emirates_id_number" hint="15 digits starting 784. We store only the last 4 digits.">
              <input id="emirates_id_number" className="field-input" value={f.emirates_id_number} inputMode="numeric" maxLength={15} pattern="784[0-9]{12}" required
                autoComplete="off" onChange={e => setF(p => ({ ...p, emirates_id_number: e.target.value.replace(/\D/g, "") }))} />
            </Field>
          )}
          <Field label="Bank IBAN" htmlFor="iban" hint="UAE IBAN for settlements, e.g. AE07 0331 2345 6789 0123 456">
            <input id="iban" className="field-input" value={f.iban} maxLength={34} required style={{ textTransform: "uppercase" }}
              pattern="[Aa][Ee][0-9 ]{21,27}" autoComplete="off" onChange={set("iban")} />
          </Field>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, color: "#111111" }}>How you want to sell</h2>
        <Field label="Pricing model">
          <div style={grid2}>
            <Choice name="pricing_model" checked={f.pricing_model === "managed"} onChange={() => setF(p => ({ ...p, pricing_model: "managed" }))}
              title="Managed" sub="NOTMADE helps set and optimise your prices." />
            <Choice name="pricing_model" checked={f.pricing_model === "seller_controlled"} onChange={() => setF(p => ({ ...p, pricing_model: "seller_controlled" }))}
              title="Seller controlled" sub="You set your own prices." />
          </div>
        </Field>
      </section>
    </>
  );
}

function CountryTerms({ market, seller }: { market: Market; seller: Seller | null }) {
  const pct = commissionFor(market, seller);
  return (
    <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, background: "#F6F6F6", fontSize: 14, lineHeight: 1.6, color: "#333333" }}>
      <p>
        <strong>Commission:</strong>{" "}
        {pct != null ? `${pct}% of each completed sale in ${market.name}.` : "shown in your seller agreement before you sign."}
      </p>
      <p>Settlement within {SETTLEMENT_DAYS} days after your order is delivered, to your bank account in {market.payoutCurrency}.</p>
    </div>
  );
}

function WaitlistNote({ market }: { market: Market }) {
  return (
    <div style={{ padding: "16px", borderRadius: 12, border: "1px solid #EEEEEE" }}>
      <p style={{ fontSize: 15, fontWeight: 700, color: "#111111" }}>{openMarketsSentence()}</p>
      <p style={{ fontSize: 14, color: "#666666", margin: "6px 0 14px", lineHeight: 1.6 }}>
        Join the waitlist and we will email you when seller accounts open for {market.name}-based businesses.
      </p>
      <div className="s-page" style={{ minHeight: 0, background: "transparent" }}><Waitlist market={market} /></div>
    </div>
  );
}

function WaitlistState({ market, onChangeCountry }: { market: Market; onChangeCountry: () => void }) {
  return (
    <Card>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111111" }}>Seller accounts are not open in {market.name} yet</h2>
      <div style={{ marginTop: 14 }}><WaitlistNote market={market} /></div>
      <p style={{ fontSize: 14, color: "#666666", marginTop: 14 }}>
        Is your business based somewhere else?{" "}
        <button type="button" onClick={onChangeCountry} style={{ color: RED, fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 14 }}>
          Change business country
        </button>
      </p>
    </Card>
  );
}

function Choice({ name, checked, onChange, title, sub }: { name: string; checked: boolean; onChange: () => void; title: React.ReactNode; sub?: string }) {
  return (
    <label style={{
      display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", borderRadius: 10, cursor: "pointer",
      border: `1.5px solid ${checked ? RED : "#E0E0E0"}`, background: checked ? "rgba(204,0,0,0.04)" : "#FFFFFF",
    }}>
      <input type="radio" name={name} checked={checked} onChange={onChange} required style={{ marginTop: 3, accentColor: RED }} />
      <span>
        <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#111111" }}>{title}</span>
        {sub && <span style={{ display: "block", fontSize: 12, color: "#888888", marginTop: 2 }}>{sub}</span>}
      </span>
    </label>
  );
}

// ─── Step 2: documents ────────────────────────────────────────────────────────

const MAX_BYTES = 8 * 1024 * 1024;

function DocumentsStep({ status, onChanged, onContinue }: { status: OnboardingState; onChanged: () => Promise<void>; onContinue: () => Promise<void> }) {
  const req = status.required_documents;
  const optional: DocType[] = [
    ...(req.includes("aadhaar_front") ? (["aadhaar_back"] as DocType[]) : []),
    ...(req.includes("emirates_id_front") ? (["emirates_id_back"] as DocType[]) : []),
    "logo",
  ];
  const done = status.missing_documents.length === 0;

  return (
    <Card>
      <h2 style={{ fontSize: 16, fontWeight: 800, color: "#111111" }}>Upload KYC documents</h2>
      <p style={{ fontSize: 14, color: "#777777", marginTop: 4, marginBottom: 18 }}>
        JPG, PNG, WEBP or PDF, up to 8 MB each. Documents are stored privately and only seen by the NOTMADE team.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {status.required_documents.map(d => (
          <DocRow key={d} docType={d} required uploaded={status.uploaded_documents.includes(d)} onUploaded={onChanged} />
        ))}
        {optional.map(d => (
          <DocRow key={d} docType={d} uploaded={status.uploaded_documents.includes(d)} onUploaded={onChanged} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
        <Button disabled={!done} onClick={() => void onContinue()}>Continue to agreement →</Button>
      </div>
    </Card>
  );
}

function DocRow({ docType, required = false, uploaded, onUploaded }: { docType: DocType; required?: boolean; uploaded: boolean; onUploaded: () => Promise<void> }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [justUploaded, setJustUploaded] = useState("");

  const pick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_BYTES) { setError("File too large (max 8 MB)"); return; }
    setBusy(true); setError("");
    try {
      await api.uploadDocument(docType, file);
      setJustUploaded(file.name);
      await onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: "1px solid #EEEEEE", borderRadius: 10, flexWrap: "wrap" }}>
      <span aria-hidden style={{
        width: 24, height: 24, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        background: uploaded ? "#16A34A" : "#F0F0F0", color: "#FFFFFF", fontSize: 13, fontWeight: 800,
      }}>{uploaded ? "✓" : ""}</span>
      <div style={{ flex: 1, minWidth: 160 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#111111" }}>
          {DOC_LABELS[docType]} {!required && <span style={{ fontWeight: 500, color: "#999999" }}>(optional)</span>}
        </p>
        <p style={{ fontSize: 12, color: error ? RED : "#888888", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis" }}>
          {error || (justUploaded ? `Uploaded ${justUploaded}` : uploaded ? "Uploaded" : required ? "Required" : "Not uploaded")}
        </p>
      </div>
      <input ref={input} type="file" hidden onChange={pick}
        accept={docType === "logo" ? "image/jpeg,image/png,image/webp" : "image/jpeg,image/png,image/webp,application/pdf"} />
      <Button variant="secondary" disabled={busy} onClick={() => input.current?.click()}>
        {busy ? <><Spinner size={14} /> Uploading</> : uploaded ? "Replace" : "Upload"}
      </Button>
    </div>
  );
}

// ─── Step 3: agreement ────────────────────────────────────────────────────────

function AgreementStep({ seller, onSigned }: { seller: Seller; onSigned: () => Promise<void> }) {
  const uaeBased = seller.seller_country === "AE";
  return (
    <AgreementSigner
      seller={seller}
      title={uaeBased ? "NOTMADE Seller Agreement — UAE" : "NOTMADE Seller Agreement"}
      load={api.agreement}
      sign={api.signAgreement}
      onSigned={onSigned}
      pills={a => (
        <>
          <Pill>{uaeBased ? `UAE commission ${a.commission_rate}%` : `Commission ${a.commission_rate}%`}</Pill>
          <Pill>{a.pricing_model === "managed" ? "Managed pricing" : "Seller-controlled pricing"}</Pill>
        </>
      )}
    />
  );
}

// ─── Step 4 / terminal states ─────────────────────────────────────────────────

function ReviewState({ seller, status }: { seller: Seller; status: OnboardingState }) {
  return (
    <Card style={{ textAlign: "center", padding: "40px 22px" }}>
      <div aria-hidden style={{ fontSize: 34, marginBottom: 8 }}>⏳</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111111" }}>Application under review</h2>
      <p style={{ fontSize: 14, color: "#666666", marginTop: 8, maxWidth: 460, marginInline: "auto", lineHeight: 1.6 }}>
        Thanks, {seller.contact_name?.split(" ")[0] || "there"}. Your agreement was signed on {fmtDate(status.agreement_signed_at)}.
        We&apos;ll email <strong>{seller.email}</strong> once {seller.business_name} is approved — then you can list products and take orders.
      </p>
    </Card>
  );
}

function ClosedState({ kind }: { kind: "rejected" | "suspended" }) {
  return (
    <Card style={{ textAlign: "center", padding: "40px 22px" }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111111" }}>
        {kind === "rejected" ? "Application not approved" : "Account suspended"}
      </h2>
      <p style={{ fontSize: 14, color: "#666666", marginTop: 8, lineHeight: 1.6 }}>
        {kind === "rejected"
          ? "We couldn't approve your application this time. Reach out and we'll tell you what's needed."
          : "Your seller account is currently suspended."}{" "}
        Contact <a href="mailto:admin@notmade.in" style={{ color: RED, fontWeight: 700 }}>admin@notmade.in</a>.
      </p>
    </Card>
  );
}
