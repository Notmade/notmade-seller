"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { setSession } from "../lib/auth";

type Step = "email" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [step,    setStep]    = useState<Step>("email");
  const [email,   setEmail]   = useState("");
  const [code,    setCode]    = useState("");
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState("");
  const [isErr,   setIsErr]   = useState(false);

  const showMsg = (text: string, error = false) => {
    setMsg(text);
    setIsErr(error);
  };

  const sendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    showMsg("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStep("otp");
      showMsg("A 6-digit code has been sent if this email is registered.");
    } catch {
      showMsg("Something went wrong. Please try again.", true);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    showMsg("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim() }),
      });
      const data = await res.json() as { id?: string; name?: string; brand_name?: string; email?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Invalid or expired code");

      setSession({
        id:         data.id!,
        name:       data.name ?? "",
        brand_name: data.brand_name ?? "",
        email:      data.email ?? email,
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      showMsg(err instanceof Error ? err.message : "Invalid or expired code.", true);
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F5F5F5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-0.02em" }}>
              <span style={{ color: "#111111" }}>NOT</span>
              <span style={{ color: "#CC0000" }}>MADE</span>
            </span>
          </a>
          <p style={{ fontSize: "12px", color: "#888888", marginTop: "6px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Seller Portal
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "16px",
            padding: "32px 28px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
            border: "1px solid #EEEEEE",
          }}
        >
          {step === "email" ? (
            <>
              <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#111111", marginBottom: "6px", letterSpacing: "-0.02em" }}>
                Sign in
              </h1>
              <p style={{ fontSize: "14px", color: "#888888", marginBottom: "24px" }}>
                Enter your email and we&apos;ll send a one-time code.
              </p>

              <form onSubmit={sendOtp} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#555555", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "8px" }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                    placeholder="seller@brand.com"
                    className="field-input"
                    autoComplete="email"
                  />
                </div>

                {msg && (
                  <p style={{ fontSize: "13px", color: isErr ? "#CC0000" : "#166534", padding: "10px 14px", background: isErr ? "rgba(204,0,0,0.04)" : "rgba(22,101,52,0.04)", border: `1px solid ${isErr ? "rgba(204,0,0,0.2)" : "rgba(22,101,52,0.2)"}`, borderRadius: "8px" }}>
                    {msg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ borderRadius: "10px", padding: "14px", fontSize: "14px", fontWeight: 700, letterSpacing: "0.04em", marginTop: "4px", opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                >
                  {loading ? "Sending code…" : "Send Code →"}
                </button>
              </form>
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <button
                  onClick={() => { setStep("email"); setCode(""); showMsg(""); }}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: "#888888", display: "flex" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#111111", letterSpacing: "-0.02em" }}>
                  Enter code
                </h1>
              </div>
              <p style={{ fontSize: "14px", color: "#888888", marginBottom: "24px" }}>
                Check your inbox at <strong>{email}</strong>
              </p>

              <form onSubmit={verifyOtp} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#555555", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "8px" }}>
                    6-digit code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={code}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCode(e.target.value.replace(/\D/g, ""))}
                    required
                    placeholder="123456"
                    className="field-input"
                    autoComplete="one-time-code"
                    style={{ fontSize: "24px", letterSpacing: "0.3em", textAlign: "center" }}
                  />
                </div>

                {msg && (
                  <p style={{ fontSize: "13px", color: isErr ? "#CC0000" : "#166534", padding: "10px 14px", background: isErr ? "rgba(204,0,0,0.04)" : "rgba(22,101,52,0.04)", border: `1px solid ${isErr ? "rgba(204,0,0,0.2)" : "rgba(22,101,52,0.2)"}`, borderRadius: "8px" }}>
                    {msg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="btn-primary"
                  style={{ borderRadius: "10px", padding: "14px", fontSize: "14px", fontWeight: 700, letterSpacing: "0.04em", marginTop: "4px", opacity: (loading || code.length < 6) ? 0.6 : 1, cursor: (loading || code.length < 6) ? "not-allowed" : "pointer" }}
                >
                  {loading ? "Verifying…" : "Sign In →"}
                </button>

                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={loading}
                  style={{ fontSize: "13px", color: "#888888", background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}
                >
                  Didn&apos;t receive it? Resend code
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#AAAAAA", marginTop: "20px" }}>
          Access is provided by NOTMADE admin only.
        </p>
      </div>
    </main>
  );
}
