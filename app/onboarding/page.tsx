"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  api, ApiError, setToken, DOC_LABELS, fmtDate,
  type Agreement, type DocType, type OnboardingState, type Seller,
} from "../lib/seller-api";
import { useSeller } from "../lib/useSeller";
import { Alert, Button, Card, Field, FullPageSpinner, RED, Spinner } from "../components/portal-ui";

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
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
    body = <DetailsStep seller={null} onSaved={refresh} />;
  } else if (status) {
    const ns = status.next_step;
    if (ns === "rejected" || ns === "suspended") {
      body = <ClosedState kind={ns} />;
    } else {
      const derived: StepKey = ns === "details" || ns === "documents" || ns === "agreement" ? ns : "review";
      current = view ?? derived;
      const editable = EDITABLE.includes(seller.onboarding_status ?? "pending_details");
      body = (
        <>
          {current === "details" && <DetailsStep seller={seller} onSaved={refresh} readOnly={!editable} />}
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
  legal_name: string; business_name: string; contact_name: string; phone: string;
  address_line: string; city: string; state: string; pincode: string;
  pricing_model: "" | "managed" | "seller_controlled";
  gst_registered: "" | "yes" | "no"; gstin: string; pan_number: string; aadhaar_number: string;
  sell_in_uae: boolean;
}

function fromSeller(s: Seller | null): DetailsForm {
  return {
    legal_name: s?.legal_name ?? "", business_name: s?.business_name ?? "", contact_name: s?.contact_name ?? "",
    phone: s?.phone ?? "", address_line: s?.address_line ?? "", city: s?.city ?? "", state: s?.state ?? "",
    pincode: s?.pincode ?? "", pricing_model: s?.pricing_model ?? "",
    gst_registered: s?.gst_registered == null ? "" : s.gst_registered ? "yes" : "no",
    gstin: s?.gstin ?? "", pan_number: s?.pan_number ?? "", aadhaar_number: "", sell_in_uae: !!s?.sell_in_uae,
  };
}

const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 };

function DetailsStep({ seller, onSaved, readOnly = false }: { seller: Seller | null; onSaved: () => Promise<void>; readOnly?: boolean }) {
  const [f, setF] = useState<DetailsForm>(() => fromSeller(seller));
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
      const gst = f.gst_registered === "yes";
      const body: Record<string, unknown> = {
        legal_name: f.legal_name, business_name: f.business_name, contact_name: f.contact_name, phone: f.phone,
        address_line: f.address_line, city: f.city, state: f.state, pincode: f.pincode,
        pricing_model: f.pricing_model, gst_registered: f.gst_registered === "" ? "" : gst,
        gstin: gst ? f.gstin.toUpperCase() : "", pan_number: f.pan_number.toUpperCase(), sell_in_uae: f.sell_in_uae,
      };
      if (!gst) body.aadhaar_number = f.aadhaar_number;
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

          {error && (
            <Alert>
              {error}
              {errors.length > 1 && <ul style={{ margin: "6px 0 0 18px" }}>{errors.slice(1).map(e => <li key={e}>{e}</li>)}</ul>}
            </Alert>
          )}

          {!readOnly && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button type="submit" disabled={saving || !f.gst_registered || !f.pricing_model}>
                {saving ? "Saving…" : "Save & continue →"}
              </Button>
            </div>
          )}
        </fieldset>
      </form>
    </Card>
  );
}

function Choice({ name, checked, onChange, title, sub }: { name: string; checked: boolean; onChange: () => void; title: string; sub?: string }) {
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
  const optional: DocType[] = [
    ...(!status.required_documents.includes("gst_certificate") ? (["aadhaar_back"] as DocType[]) : []),
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
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loadErr, setLoadErr] = useState("");
  const [signer, setSigner] = useState(seller.contact_name ?? "");
  const [agreed, setAgreed] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const load = useCallback(async () => {
    setLoadErr("");
    try { setAgreement(await api.agreement()); }
    catch (err) { setLoadErr(err instanceof Error ? err.message : "Could not load agreement"); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const sendCode = async () => {
    setBusy(true); setError(""); setInfo("");
    try {
      await api.sendOtp(seller.email, "agreement");
      setCodeSent(true);
      setInfo(`We've sent a 6-digit code to ${seller.email}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code");
    } finally {
      setBusy(false);
    }
  };

  const sign = async (e: FormEvent) => {
    e.preventDefault();
    if (!agreement) return;
    setBusy(true); setError(""); setInfo("");
    try {
      await api.signAgreement({ code, signer_name: signer.trim(), agreement_hash: agreement.agreement_hash });
      await onSigned();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409 && typeof err.data.agreement_hash === "string") {
        // Text changed server-side; the code was not consumed, so the seller can re-read and sign again.
        await load();
        setAgreed(false);
      }
      setError(err instanceof Error ? err.message : "Could not sign agreement");
      setBusy(false);
    }
  };

  if (loadErr) return <Alert>{loadErr} <button type="button" onClick={() => void load()} style={{ color: RED, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>Retry</button></Alert>;
  if (!agreement) return <FullPageSpinner />;

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "#111111" }}>NOTMADE Seller Agreement</h2>
        <span style={{ fontSize: 12, color: "#888888" }}>Version {agreement.version}</span>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0 14px" }}>
        <Pill>Commission {agreement.commission_rate}%</Pill>
        <Pill>{agreement.pricing_model === "managed" ? "Managed pricing" : "Seller-controlled pricing"}</Pill>
        {agreement.includes_uae_clause && <Pill>Includes UAE terms</Pill>}
      </div>
      <pre tabIndex={0} style={{
        whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: 13, lineHeight: 1.6, color: "#333333",
        background: "#FAFAFA", border: "1px solid #EEEEEE", borderRadius: 10, padding: 16, maxHeight: 420, overflowY: "auto",
      }}>{agreement.text}</pre>

      <form onSubmit={sign} style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 18 }}>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "#333333", cursor: "pointer" }}>
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ width: 18, height: 18, marginTop: 1, accentColor: RED }} />
          I have read and agree to the NOTMADE Seller Agreement on behalf of {seller.legal_name || seller.business_name}.
        </label>
        <div style={grid2}>
          <Field label="Your full name (signature)" htmlFor="signer">
            <input id="signer" className="field-input" value={signer} onChange={e => setSigner(e.target.value)} required minLength={2} maxLength={120} autoComplete="name" />
          </Field>
          {codeSent && (
            <Field label="Email code" htmlFor="sign-code">
              <input id="sign-code" className="field-input" value={code} inputMode="numeric" maxLength={6} pattern="[0-9]{6}" required autoComplete="one-time-code"
                placeholder="123456" style={{ letterSpacing: "0.2em" }} onChange={e => setCode(e.target.value.replace(/\D/g, ""))} />
            </Field>
          )}
        </div>

        {info && <Alert kind="success">{info}</Alert>}
        {error && <Alert>{error}</Alert>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
          {!codeSent ? (
            <Button disabled={busy || !agreed || signer.trim().length < 2} onClick={() => void sendCode()}>
              {busy ? "Sending…" : "Send signing code →"}
            </Button>
          ) : (
            <>
              <Button variant="secondary" disabled={busy} onClick={() => void sendCode()}>Resend code</Button>
              <Button type="submit" disabled={busy || !agreed || code.length < 6 || signer.trim().length < 2}>
                {busy ? "Signing…" : "Sign agreement"}
              </Button>
            </>
          )}
        </div>
      </form>
    </Card>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 100, background: "#F3F3F3", color: "#444444" }}>{children}</span>;
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
