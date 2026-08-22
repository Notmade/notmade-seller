"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { setToken } from "../lib/auth";

interface LoginResponse {
  token: string;
  seller?: {
    name: string;
    brandName: string;
  };
  error?: string;
  message?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch("https://api.notmade.in/auth/seller/login", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      clearTimeout(timer);

      const data = await res.json() as LoginResponse;

      if (!res.ok) {
        throw new Error(data.error ?? data.message ?? `Login failed (${res.status})`);
      }

      if (!data.token) throw new Error("No token received from server.");

      setToken(data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      clearTimeout(timer);
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError("Request timed out. Please check your connection.");
        } else if (err.message === "Failed to fetch" || err.message === "Load failed") {
          setError("Could not connect to server. Please check your internet.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
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
          <span style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-0.02em", userSelect: "none" }}>
            <span style={{ color: "#111111" }}>NOT</span>
            <span style={{ color: "#CC0000" }}>MADE</span>
          </span>
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
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#111111", marginBottom: "6px", letterSpacing: "-0.02em" }}>
            Sign in
          </h1>
          <p style={{ fontSize: "14px", color: "#888888", marginBottom: "24px" }}>
            Use the credentials provided by NOTMADE.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#555555", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "8px" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="field-input"
              />
            </div>

            {error && (
              <p
                style={{
                  fontSize: "13px",
                  color: "#CC0000",
                  padding: "10px 14px",
                  background: "rgba(204,0,0,0.04)",
                  border: "1px solid rgba(204,0,0,0.2)",
                  borderRadius: "8px",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                borderRadius: "10px",
                padding: "14px",
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "0.04em",
                marginTop: "4px",
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#AAAAAA", marginTop: "20px" }}>
          Credentials are provided by NOTMADE admin only.
        </p>
      </div>
    </main>
  );
}
