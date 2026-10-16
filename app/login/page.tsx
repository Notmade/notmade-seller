"use client";

import { Suspense, useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, ApiError, clearSession, setToken } from "../lib/seller-api";
import { CONTACT_EMAIL } from "../lib/seller-config";
import { formatMoney } from "../lib/currency";
import { Flag, MarketSwitcher, useMarket } from "../components/market";
import { openMarketsSentence } from "@/src/config/markets";

type Step = "email" | "otp";
type Purpose = "login" | "signup";
const RESEND_SECONDS = 30;
const LEN = 6;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function LoginPage() {
  return <Suspense fallback={null}><Login /></Suspense>;
}

function OtpBoxes({ value, onChange, onComplete, disabled, invalid }: {
  value: string; onChange: (v: string) => void; onComplete: (v: string) => void; disabled: boolean; invalid: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => { refs.current[0]?.focus(); }, []);

  const set = (next: string, focusAt?: number) => {
    const v = next.replace(/\D/g, "").slice(0, LEN);
    onChange(v);
    if (focusAt !== undefined) refs.current[Math.min(focusAt, LEN - 1)]?.focus();
    if (v.length === LEN) onComplete(v);
  };

  const onInput = (i: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return;
    // Typed one digit, or the OS autofilled the whole code into one box
    const next = (value.slice(0, i) + digits + value.slice(i + digits.length)).slice(0, LEN);
    set(next, i + digits.length);
  };

  const onKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value[i]) set(value.slice(0, i) + value.slice(i + 1), i);
      else if (i > 0) set(value.slice(0, i - 1) + value.slice(i), i - 1);
    } else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    else if (e.key === "ArrowRight" && i < LEN - 1) refs.current[i + 1]?.focus();
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LEN);
    if (!digits) return;
    e.preventDefault();
    set(digits, digits.length);
  };

  return (
    <div className={invalid ? "lg-otp lg-otp-bad" : "lg-otp"} role="group" aria-label="6-digit code">
      {Array.from({ length: LEN }).map((_, i) => (
        <input key={i} ref={el => { refs.current[i] = el; }} value={value[i] ?? ""} disabled={disabled}
          inputMode="numeric" autoComplete={i === 0 ? "one-time-code" : "off"} maxLength={LEN} aria-label={`Digit ${i + 1}`}
          className={value[i] ? "filled" : ""}
          onChange={e => onInput(i, e.target.value)} onKeyDown={e => onKey(i, e)} onPaste={onPaste}
          onFocus={e => e.target.select()} />
      ))}
    </div>
  );
}

function Login() {
  const [market, setMarket] = useMarket();
  const router = useRouter();
  const params = useSearchParams();
  const applying = params.get("apply") === "1";
  const [step, setStep] = useState<Step>("email");
  const [purpose, setPurpose] = useState<Purpose>(applying ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Reaching /login means any stale session cookie is no longer wanted
  useEffect(() => { clearSession(); }, []);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const cleanEmail = email.trim().toLowerCase();
  const emailInvalid = email.length > 0 && !EMAIL_RE.test(cleanEmail);

  // Login first; an unknown email gets a signup code, so one form serves both
  const sendOtp = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!EMAIL_RE.test(cleanEmail)) { setError("Enter a valid email address."); return; }
    setSending(true); setError(""); setInfo("");
    try {
      let used: Purpose = "login";
      try {
        await api.sendOtp(cleanEmail, "login");
      } catch (err) {
        if (!(err instanceof ApiError && err.status === 404)) throw err;
        used = "signup";
        await api.sendOtp(cleanEmail, "signup");
      }
      setPurpose(used);
      setStep("otp");
      setCode("");
      setCooldown(RESEND_SECONDS);
      setInfo(used === "signup" ? "New here — this code creates your seller account." : "");
    } catch (err) {
      setError(err instanceof ApiError && err.status === 429
        ? "Too many codes requested. Please wait a minute and try again."
        : err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const verify = async (value = code) => {
    if (value.length !== LEN || verifying) return;
    setVerifying(true); setError("");
    try {
      const res = await api.verifyOtp(cleanEmail, value, purpose);
      setToken(res.token);
      router.replace(res.onboarding_status === "approved" ? "/dashboard" : "/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code.");
      setCode("");
      setVerifying(false);
    }
  };

  return (
    <div className="lg">
      <aside className="lg-art" aria-hidden>
        <a href={`/?market=${market.code}`} className="lg-logo">NOT<span>MADE</span><small>SELLER</small></a>
        <div className="lg-art-copy">
          <p className="lg-art-k">For streetwear labels</p>
          <p className="lg-art-h">Make it.<br />We&apos;ll move it.</p>
          <ul>
            {market.code === "ae" ? <>
              <li><b>3 to 5 day</b> delivery across the UAE</li>
              <li><b>{market.currency}</b> prices, set by you</li>
              <li><b>IBAN</b> payout to your UAE bank</li>
            </> : <>
              <li><b>3-hour</b> delivery across Delhi NCR</li>
              <li><b>7-day</b> payout after delivery</li>
              <li><b>{formatMoney(0, market.currency)}</b> listing fee</li>
            </>}
          </ul>
        </div>
        <p className="lg-art-foot">© House of Notmade Studio</p>
        <div className="lg-art-grid" />
      </aside>

      <main className="lg-main">
        <div className="lg-main-top">
          <a href={`/?market=${market.code}`} className="lg-logo lg-logo-dark">NOT<span>MADE</span><small>SELLER</small></a>
          <MarketSwitcher value={market} onChange={setMarket} />
        </div>

        <div className="lg-card">
          <span className="lg-pill"><Flag market={market} size={12} />{market.name}{market.currency ? ` · ${market.currency}` : ""}</span>

          {step === "email" ? (
            <>
              <h1 className="lg-h">{applying ? "Apply to sell" : "Welcome back"}</h1>
              <p className="lg-sub">{applying ? "Start with your email. We'll send a one-time code — no password needed." : "Log in to your seller panel with a one-time code sent to your email."}</p>
              <form onSubmit={sendOtp} noValidate className="lg-form">
                <label htmlFor="email" className="lg-label">Work email</label>
                <input id="email" type="email" value={email} placeholder="you@yourbrand.com" autoComplete="email" autoFocus
                  className={emailInvalid ? "lg-input bad" : "lg-input"} aria-invalid={emailInvalid || undefined}
                  onChange={e => { setEmail(e.target.value); setError(""); }} />
                {emailInvalid && <p className="lg-hint-bad">That doesn&apos;t look like an email address.</p>}
                {error && <p className="lg-error" role="alert">{error}</p>}
                <button type="submit" disabled={sending || !cleanEmail} className="lg-btn">
                  {sending ? <><span className="lg-spin" />Sending code…</> : "Send code"}
                </button>
              </form>
              {!market.open && (
                <p className="lg-note">{openMarketsSentence()} Existing sellers can log in as usual.{" "}
                  <a href={`/?market=${market.code}#start`}>Join the waitlist</a></p>
              )}
              <p className="lg-switch">
                {applying
                  ? <>Already selling with us? <a href="/login">Log in</a></>
                  : <>New seller? <a href="/login?apply=1">Apply to sell →</a></>}
              </p>
            </>
          ) : (
            <>
              <button type="button" className="lg-back" onClick={() => { setStep("email"); setCode(""); setError(""); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden><path d="M15 18l-6-6 6-6" /></svg>
                Change email
              </button>
              <h1 className="lg-h">{purpose === "signup" ? "Create your account" : "Enter your code"}</h1>
              <p className="lg-sub">We sent a 6-digit code to <strong>{cleanEmail}</strong>. It expires in 10 minutes.</p>
              {info && <p className="lg-info">{info}</p>}
              <form onSubmit={e => { e.preventDefault(); void verify(); }} className="lg-form">
                <OtpBoxes value={code} onChange={v => { setCode(v); if (error) setError(""); }} onComplete={v => void verify(v)}
                  disabled={verifying} invalid={!!error} />
                {error && <p className="lg-error" role="alert">{error}</p>}
                <button type="submit" disabled={verifying || code.length !== LEN} className="lg-btn">
                  {verifying ? <><span className="lg-spin" />Verifying…</> : purpose === "signup" ? "Create account" : "Log in"}
                </button>
              </form>
              <p className="lg-resend">
                {cooldown > 0
                  ? <>Resend code in <b>0:{String(cooldown).padStart(2, "0")}</b></>
                  : <button type="button" onClick={() => void sendOtp()} disabled={sending}>{sending ? "Sending…" : "Didn't get it? Resend code"}</button>}
              </p>
            </>
          )}
        </div>

        <p className="lg-note lg-help">Trouble logging in? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
      </main>
    </div>
  );
}
