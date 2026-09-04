"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { setSession } from "../lib/auth";

type Step = "email" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
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
        background: "#0B0B0C",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />
      {/* Red glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 500,
          height: 300,
          background: "radial-gradient(ellipse, rgba(255,59,48,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <a href="/" style={{ textDecoration: "none", display: "inline-block" }}>
            <span
              style={{
                fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
                fontSize: "2rem",
                letterSpacing: "0.04em",
                lineHeight: 1,
              }}
            >
              <span style={{ color: "#E8E4DC" }}>NOT</span>
              <span style={{ color: "#FF3B30" }}>MADE</span>
            </span>
          </a>
        </div>

        {!showLogin ? (
          /* ── Coming soon state ── */
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,59,48,0.1)",
                border: "1px solid rgba(255,59,48,0.25)",
                borderRadius: 100,
                padding: "6px 16px",
                marginBottom: 28,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#FF3B30",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-archivo), Archivo, sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#FF3B30",
                }}
              >
                COMING SOON
              </span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
                fontSize: "clamp(2.5rem, 8vw, 56px)",
                fontWeight: 400,
                lineHeight: 1.0,
                letterSpacing: "0.03em",
                color: "#E8E4DC",
                marginBottom: 16,
              }}
            >
              SELLER PORTAL
              <br />
              IS COMING SOON
            </h1>

            <p
              style={{
                fontFamily: "var(--font-archivo), Archivo, sans-serif",
                fontSize: 15,
                color: "rgba(232,228,220,0.5)",
                lineHeight: 1.7,
                marginBottom: 8,
              }}
            >
              We&apos;re onboarding sellers personally right now.
            </p>
            <p
              style={{
                fontFamily: "var(--font-archivo), Archivo, sans-serif",
                fontSize: 15,
                color: "rgba(232,228,220,0.5)",
                lineHeight: 1.7,
                marginBottom: 36,
              }}
            >
              Fill the form on seller.notmade.in to get started.
            </p>

            <a
              href="/"
              className="btn-primary"
              style={{
                display: "inline-block",
                textDecoration: "none",
                fontSize: 17,
                padding: "16px 44px",
                borderRadius: 10,
              }}
            >
              APPLY NOW →
            </a>

            <div style={{ marginTop: 48 }}>
              <button
                onClick={() => setShowLogin(true)}
                style={{
                  fontFamily: "var(--font-archivo), Archivo, sans-serif",
                  fontSize: 12,
                  color: "rgba(232,228,220,0.2)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                  transition: "color 0.15s",
                }}
              >
                Already a seller? Sign in →
              </button>
            </div>
          </div>
        ) : (
          /* ── Login form ── */
          <div
            style={{
              background: "#111113",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: "32px 28px",
            }}
          >
            {step === "email" ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <button
                    onClick={() => { setShowLogin(false); showMsg(""); }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 2,
                      color: "rgba(232,228,220,0.4)",
                      display: "flex",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <h2
                    style={{
                      fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
                      fontSize: 26,
                      letterSpacing: "0.04em",
                      color: "#E8E4DC",
                    }}
                  >
                    SIGN IN
                  </h2>
                </div>

                <p
                  style={{
                    fontFamily: "var(--font-archivo), Archivo, sans-serif",
                    fontSize: 14,
                    color: "rgba(232,228,220,0.45)",
                    marginBottom: 24,
                  }}
                >
                  Enter your email and we&apos;ll send a one-time code.
                </p>

                <form onSubmit={sendOtp} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontFamily: "var(--font-archivo), Archivo, sans-serif",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "rgba(232,228,220,0.5)",
                        marginBottom: 8,
                      }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      required
                      placeholder="seller@brand.com"
                      className="field-input-dark"
                      autoComplete="email"
                    />
                  </div>

                  {msg && (
                    <p
                      style={{
                        fontFamily: "var(--font-archivo), Archivo, sans-serif",
                        fontSize: 13,
                        color: isErr ? "#FF3B30" : "#C8F542",
                        padding: "10px 14px",
                        background: isErr ? "rgba(255,59,48,0.06)" : "rgba(200,245,66,0.06)",
                        border: `1px solid ${isErr ? "rgba(255,59,48,0.2)" : "rgba(200,245,66,0.2)"}`,
                        borderRadius: 8,
                      }}
                    >
                      {msg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                    style={{
                      width: "100%",
                      borderRadius: 10,
                      padding: "14px",
                      fontSize: 16,
                      border: "none",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.6 : 1,
                      marginTop: 4,
                    }}
                  >
                    {loading ? "SENDING…" : "SEND CODE →"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <button
                    onClick={() => { setStep("email"); setCode(""); showMsg(""); }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 2,
                      color: "rgba(232,228,220,0.4)",
                      display: "flex",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <h2
                    style={{
                      fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
                      fontSize: 26,
                      letterSpacing: "0.04em",
                      color: "#E8E4DC",
                    }}
                  >
                    ENTER CODE
                  </h2>
                </div>

                <p
                  style={{
                    fontFamily: "var(--font-archivo), Archivo, sans-serif",
                    fontSize: 14,
                    color: "rgba(232,228,220,0.45)",
                    marginBottom: 24,
                  }}
                >
                  Check your inbox at <strong style={{ color: "#E8E4DC" }}>{email}</strong>
                </p>

                <form onSubmit={verifyOtp} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontFamily: "var(--font-archivo), Archivo, sans-serif",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "rgba(232,228,220,0.5)",
                        marginBottom: 8,
                      }}
                    >
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
                      className="field-input-dark"
                      autoComplete="one-time-code"
                      style={{ fontSize: "24px", letterSpacing: "0.3em", textAlign: "center" }}
                    />
                  </div>

                  {msg && (
                    <p
                      style={{
                        fontFamily: "var(--font-archivo), Archivo, sans-serif",
                        fontSize: 13,
                        color: isErr ? "#FF3B30" : "#C8F542",
                        padding: "10px 14px",
                        background: isErr ? "rgba(255,59,48,0.06)" : "rgba(200,245,66,0.06)",
                        border: `1px solid ${isErr ? "rgba(255,59,48,0.2)" : "rgba(200,245,66,0.2)"}`,
                        borderRadius: 8,
                      }}
                    >
                      {msg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || code.length < 6}
                    className="btn-primary"
                    style={{
                      width: "100%",
                      borderRadius: 10,
                      padding: "14px",
                      fontSize: 16,
                      border: "none",
                      cursor: (loading || code.length < 6) ? "not-allowed" : "pointer",
                      opacity: (loading || code.length < 6) ? 0.6 : 1,
                      marginTop: 4,
                    }}
                  >
                    {loading ? "VERIFYING…" : "SIGN IN →"}
                  </button>

                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={loading}
                    style={{
                      fontFamily: "var(--font-archivo), Archivo, sans-serif",
                      fontSize: 13,
                      color: "rgba(232,228,220,0.35)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px 0",
                    }}
                  >
                    Didn&apos;t receive it? Resend code
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        <p
          style={{
            fontFamily: "var(--font-archivo), Archivo, sans-serif",
            textAlign: "center",
            fontSize: 12,
            color: "rgba(232,228,220,0.15)",
            marginTop: 24,
          }}
        >
          Access is provided by NOTMADE admin only.
        </p>
      </div>
    </main>
  );
}
