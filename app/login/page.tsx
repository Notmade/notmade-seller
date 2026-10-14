"use client";

import { Suspense, useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, clearSession, setToken } from "../lib/seller-api";
import { CONTACT_EMAIL } from "../lib/seller-config";
import { Flag, MarketSwitcher, useMarket } from "../components/market";
import { openMarketsSentence } from "@/src/config/markets";

type Step = "email" | "otp";
type Purpose = "login" | "signup";

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="Back" className="s-btn s-btn-line" style={{ width: 44, padding: 0 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}

function Message({ text, error }: { text: string; error: boolean }) {
  return (
    <p role={error ? "alert" : "status"} style={{
      fontSize: 14, lineHeight: 1.5, padding: "10px 14px", borderRadius: 12,
      color: error ? "#FF3B30" : "#111111", background: error ? "rgba(255,59,48,0.06)" : "#F6F6F6",
    }}>{text}</p>
  );
}

export default function LoginPage() {
  return <Suspense fallback={null}><Login /></Suspense>;
}

function Login() {
  const [market, setMarket] = useMarket();
  const router = useRouter();
  const [step,    setStep]    = useState<Step>("email");
  const [purpose, setPurpose] = useState<Purpose>("login");
  const [email,   setEmail]   = useState("");
  const [code,    setCode]    = useState("");
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState("");
  const [isErr,   setIsErr]   = useState(false);

  // Reaching /login means any stale session cookie is no longer wanted
  useEffect(() => { clearSession(); }, []);

  const showMsg = (text: string, error = false) => { setMsg(text); setIsErr(error); };
  const cleanEmail = () => email.trim().toLowerCase();

  // Try login first; an unknown email gets a signup code instead, so one form serves both.
  const sendOtp = async (e?: FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    showMsg("");
    try {
      let used: Purpose = "login";
      try {
        await api.sendOtp(cleanEmail(), "login");
      } catch (err) {
        if (!(err instanceof ApiError && err.status === 404)) throw err;
        used = "signup";
        await api.sendOtp(cleanEmail(), "signup");
      }
      setPurpose(used);
      setStep("otp");
      showMsg(used === "signup"
        ? "New here? We've sent a 6-digit code to create your seller account."
        : "We've sent a 6-digit code to your email.");
    } catch (err) {
      showMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.", true);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    showMsg("");
    try {
      const res = await api.verifyOtp(cleanEmail(), code.trim(), purpose);
      setToken(res.token);
      router.replace(res.onboarding_status === "approved" ? "/dashboard" : "/onboarding");
    } catch (err) {
      showMsg(err instanceof Error ? err.message : "Invalid or expired code.", true);
      setLoading(false);
    }
  };

  const codeIncomplete = code.length < 6;

  return (
    <div className="s-page" style={{ display: "flex", flexDirection: "column" }}>
      <header className="s-header">
        <div className="s-wrap s-header-row">
          <a href={`/?market=${market.code}`} className="s-wordmark" aria-label="NOTMADE seller home">NOTMADE <small>SELLER</small></a>
          <MarketSwitcher value={market} onChange={setMarket} />
        </div>
      </header>

      <main className="s-wrap" style={{ width: "100%", maxWidth: 480, padding: "48px 16px 64px" }}>
        <span className="s-pill"><Flag market={market} size={12} />{market.name}{market.currency ? ` · ${market.currency}` : ""}</span>

        {step === "email" ? (
          <>
            <h1 className="s-h2" style={{ marginTop: 16 }}>Log in or create a seller account</h1>
            <p className="s-body" style={{ marginTop: 8 }}>
              Enter your email and we will send you a one-time code. New sellers create an account the same way.
            </p>

            <form onSubmit={sendOtp} style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 28 }}>
              <div>
                <label htmlFor="email" className="s-label">Email</label>
                <input id="email" type="email" value={email} required placeholder="you@brand.com"
                  className="s-input" autoComplete="email" autoFocus
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
              </div>

              {msg && <Message text={msg} error={isErr} />}

              <button type="submit" disabled={loading} className="s-btn s-btn-red s-btn-lg" style={{ width: "100%" }}>
                {loading ? "Sending…" : "Send code"}
              </button>
            </form>

            {!market.open && (
              <p className="s-note" style={{ marginTop: 20 }}>
                {openMarketsSentence()} Existing sellers can log in as usual.{" "}
                <a href={`/?market=${market.code}#waitlist`} style={{ color: "inherit", fontWeight: 600 }}>Join the waitlist</a>
              </p>
            )}
          </>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
              <BackButton onClick={() => { setStep("email"); setCode(""); showMsg(""); }} />
              <h1 className="s-h2">{purpose === "signup" ? "Create your account" : "Enter your code"}</h1>
            </div>
            <p className="s-body" style={{ marginTop: 8 }}>
              Check your inbox at <strong style={{ color: "#111111", wordBreak: "break-all" }}>{cleanEmail()}</strong>
            </p>

            <form onSubmit={verifyOtp} style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 28 }}>
              <div>
                <label htmlFor="code" className="s-label">6-digit code</label>
                <input id="code" type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code}
                  required placeholder="123456" className="s-input" autoComplete="one-time-code" autoFocus
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setCode(e.target.value.replace(/\D/g, ""))}
                  style={{ fontSize: 24, letterSpacing: "0.3em", textAlign: "center" }} />
              </div>

              {msg && <Message text={msg} error={isErr} />}

              <button type="submit" disabled={loading || codeIncomplete} className="s-btn s-btn-red s-btn-lg" style={{ width: "100%" }}>
                {loading ? "Verifying…" : purpose === "signup" ? "Continue" : "Log in"}
              </button>

              <button type="button" onClick={() => void sendOtp()} disabled={loading} className="s-btn s-btn-ghost" style={{ color: "#5C5C5C" }}>
                Did not get it? Resend code
              </button>
            </form>
          </>
        )}

        <p className="s-note" style={{ marginTop: 32 }}>
          Trouble logging in? <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "inherit", fontWeight: 600 }}>{CONTACT_EMAIL}</a>
        </p>
      </main>
    </div>
  );
}
