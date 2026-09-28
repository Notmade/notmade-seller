"use client";

import { useEffect, useState, type FormEvent, type ChangeEvent, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, clearSession, setToken } from "../lib/seller-api";

type Step = "email" | "otp";
type Purpose = "login" | "signup";

const archivo = "var(--font-archivo), Archivo, sans-serif";
const bebas = "var(--font-bebas), 'Bebas Neue', cursive";

const labelStyle: CSSProperties = {
  display: "block", fontFamily: archivo, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
  textTransform: "uppercase", color: "rgba(232,228,220,0.5)", marginBottom: 8,
};

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="Back"
      style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "rgba(232,228,220,0.4)", display: "flex" }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}

function Message({ text, error }: { text: string; error: boolean }) {
  return (
    <p style={{
      fontFamily: archivo, fontSize: 13, color: error ? "#FF3B30" : "#C8F542", padding: "10px 14px",
      background: error ? "rgba(255,59,48,0.06)" : "rgba(200,245,66,0.06)",
      border: `1px solid ${error ? "rgba(255,59,48,0.2)" : "rgba(200,245,66,0.2)"}`, borderRadius: 8,
    }}>{text}</p>
  );
}

export default function LoginPage() {
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
    <main style={{
      minHeight: "100vh", background: "#0B0B0C", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "40px 16px", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", backgroundSize: "60px 60px",
        backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
      }} />
      <div style={{
        position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 500, height: 300,
        background: "radial-gradient(ellipse, rgba(255,59,48,0.08) 0%, transparent 70%)", pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <a href="/" style={{ textDecoration: "none", display: "inline-block" }}>
            <span style={{ fontFamily: bebas, fontSize: "2rem", letterSpacing: "0.04em", lineHeight: 1 }}>
              <span style={{ color: "#E8E4DC" }}>NOT</span>
              <span style={{ color: "#FF3B30" }}>MADE</span>
            </span>
          </a>
          <p style={{ fontFamily: archivo, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: "rgba(232,228,220,0.4)", marginTop: 6 }}>
            SELLER PORTAL
          </p>
        </div>

        <div style={{ background: "#111113", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "32px 28px" }}>
          {step === "email" ? (
            <>
              <h1 style={{ fontFamily: bebas, fontSize: 30, fontWeight: 400, letterSpacing: "0.04em", color: "#E8E4DC", marginBottom: 8 }}>
                SIGN IN OR START SELLING
              </h1>
              <p style={{ fontFamily: archivo, fontSize: 14, color: "rgba(232,228,220,0.5)", marginBottom: 24, lineHeight: 1.6 }}>
                Enter your email and we&apos;ll send a one-time code. New sellers can create an account the same way.
              </p>

              <form onSubmit={sendOtp} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label htmlFor="email" style={labelStyle}>Email</label>
                  <input id="email" type="email" value={email} required placeholder="you@brand.com"
                    className="field-input-dark" autoComplete="email" autoFocus
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
                </div>

                {msg && <Message text={msg} error={isErr} />}

                <button type="submit" disabled={loading} className="btn-primary" style={{
                  width: "100%", borderRadius: 10, padding: 14, fontSize: 16, border: "none", marginTop: 4,
                  cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
                }}>
                  {loading ? "SENDING…" : "SEND CODE →"}
                </button>
              </form>
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <BackButton onClick={() => { setStep("email"); setCode(""); showMsg(""); }} />
                <h1 style={{ fontFamily: bebas, fontSize: 30, fontWeight: 400, letterSpacing: "0.04em", color: "#E8E4DC" }}>
                  {purpose === "signup" ? "CREATE ACCOUNT" : "ENTER CODE"}
                </h1>
              </div>
              <p style={{ fontFamily: archivo, fontSize: 14, color: "rgba(232,228,220,0.5)", marginBottom: 24 }}>
                Check your inbox at <strong style={{ color: "#E8E4DC", wordBreak: "break-all" }}>{cleanEmail()}</strong>
              </p>

              <form onSubmit={verifyOtp} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label htmlFor="code" style={labelStyle}>6-digit code</label>
                  <input id="code" type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code}
                    required placeholder="123456" className="field-input-dark" autoComplete="one-time-code" autoFocus
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCode(e.target.value.replace(/\D/g, ""))}
                    style={{ fontSize: 24, letterSpacing: "0.3em", textAlign: "center" }} />
                </div>

                {msg && <Message text={msg} error={isErr} />}

                <button type="submit" disabled={loading || codeIncomplete} className="btn-primary" style={{
                  width: "100%", borderRadius: 10, padding: 14, fontSize: 16, border: "none", marginTop: 4,
                  cursor: loading || codeIncomplete ? "not-allowed" : "pointer", opacity: loading || codeIncomplete ? 0.6 : 1,
                }}>
                  {loading ? "VERIFYING…" : purpose === "signup" ? "CONTINUE →" : "SIGN IN →"}
                </button>

                <button type="button" onClick={() => void sendOtp()} disabled={loading} style={{
                  fontFamily: archivo, fontSize: 13, color: "rgba(232,228,220,0.45)",
                  background: "none", border: "none", cursor: "pointer", padding: "4px 0",
                }}>
                  Didn&apos;t receive it? Resend code
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ fontFamily: archivo, textAlign: "center", fontSize: 12, color: "rgba(232,228,220,0.3)", marginTop: 24 }}>
          Trouble signing in? <a href="mailto:admin@notmade.in" style={{ color: "rgba(232,228,220,0.55)" }}>admin@notmade.in</a>
        </p>
      </div>
    </main>
  );
}
