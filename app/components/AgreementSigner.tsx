"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { api, ApiError, downloadAgreement, type Agreement, type Seller, type SignBody } from "../lib/seller-api";
import { Alert, Button, Card, Field, FullPageSpinner, RED } from "./portal-ui";

const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 };

/**
 * Formatted agreement. `html` is rendered and sanitised by the backend (every character of the
 * markdown is escaped before tags are added), so it is safe to inject.
 */
export function AgreementDocument({ html, maxHeight = 420, onScrolledToEnd }: {
  html: string;
  maxHeight?: number;
  onScrolledToEnd?: () => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const check = useCallback(() => {
    const el = box.current;
    // A few px of slack for zoom / sub-pixel rounding; content that doesn't overflow counts as read
    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 8) onScrolledToEnd?.();
  }, [onScrolledToEnd]);
  useEffect(() => { check(); }, [check, html]);
  return (
    <div ref={box} tabIndex={0} onScroll={check} className="agreement-doc-box" style={{ maxHeight }}
      dangerouslySetInnerHTML={{ __html: html }} />
  );
}

/** Review + OTP e-sign for any agreement (seller agreement, UAE addendum). */
export function AgreementSigner({ seller, title, load, sign, onSigned, pills }: {
  seller: Seller;
  title: string;
  load: () => Promise<Agreement>;
  sign: (body: SignBody) => Promise<unknown>;
  onSigned: () => Promise<void>;
  pills?: (a: Agreement) => React.ReactNode;
}) {
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loadErr, setLoadErr] = useState("");
  const [signer, setSigner] = useState(seller.contact_name ?? "");
  const [agreed, setAgreed] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  // Sign stays disabled until the seller has scrolled to the end of the agreement
  const [readToEnd, setReadToEnd] = useState(false);
  const markRead = useCallback(() => setReadToEnd(true), []);

  const reload = useCallback(async () => {
    setLoadErr("");
    setReadToEnd(false);
    try { setAgreement(await load()); }
    catch (err) { setLoadErr(err instanceof Error ? err.message : "Could not load agreement"); }
  }, [load]);
  useEffect(() => { void reload(); }, [reload]);

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

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!agreement) return;
    setBusy(true); setError(""); setInfo("");
    try {
      await sign({ code, signer_name: signer.trim(), agreement_hash: agreement.agreement_hash });
      await onSigned();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409 && typeof err.data.agreement_hash === "string") {
        // Text changed server-side; the code was not consumed, so the seller can re-read and sign again.
        await reload();
        setAgreed(false);
      }
      setError(err instanceof Error ? err.message : "Could not sign agreement");
      setBusy(false);
    }
  };

  if (loadErr) return <Alert>{loadErr} <button type="button" onClick={() => void reload()} style={{ color: RED, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>Retry</button></Alert>;
  if (!agreement) return <FullPageSpinner />;

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "#111111" }}>{title}</h2>
        <span style={{ fontSize: 12, color: "#888888" }}>Version {agreement.version}</span>
      </div>
      {pills && <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0 14px" }}>{pills(agreement)}</div>}
      <div style={{ marginTop: pills ? 0 : 12 }}>
        <AgreementDocument html={agreement.html} onScrolledToEnd={markRead} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center", marginTop: 8 }}>
        <span style={{ fontSize: 12, color: readToEnd ? "#16A34A" : "#888888" }}>
          {readToEnd ? "You've reached the end of the agreement." : "Scroll to the end of the agreement to enable signing."}
        </span>
        <Button variant="ghost" onClick={() => downloadAgreement(agreement.plain_text, agreement.title || title, agreement.version)} style={{ padding: "6px 10px", fontSize: 13 }}>
          Download
        </Button>
      </div>

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 14 }}>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: readToEnd ? "#333333" : "#AAAAAA", cursor: readToEnd ? "pointer" : "not-allowed" }}>
          <input type="checkbox" checked={agreed} disabled={!readToEnd} onChange={e => setAgreed(e.target.checked)} style={{ width: 18, height: 18, marginTop: 1, accentColor: RED }} />
          I have read and agree to the {title} on behalf of {seller.legal_name || seller.business_name}.
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
            <Button disabled={busy || !readToEnd || !agreed || signer.trim().length < 2} onClick={() => void sendCode()}>
              {busy ? "Sending…" : "Send signing code →"}
            </Button>
          ) : (
            <>
              <Button variant="secondary" disabled={busy} onClick={() => void sendCode()}>Resend code</Button>
              <Button type="submit" disabled={busy || !readToEnd || !agreed || code.length < 6 || signer.trim().length < 2}>
                {busy ? "Signing…" : "Sign agreement"}
              </Button>
            </>
          )}
        </div>
      </form>
    </Card>
  );
}

export function Pill({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 100, background: "#F3F3F3", color: "#444444" }}>{children}</span>;
}
