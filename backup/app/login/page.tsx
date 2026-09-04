"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { setSession } from "../lib/auth";
import { supabase } from "../lib/supabase";

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

    try {
      const normalized = email.trim().toLowerCase();

      // Try seller_email first, fall back to email
      let seller: Record<string, unknown> | null = null;
      const { data: d1 } = await supabase
        .from('sellers')
        .select('*')
        .eq('seller_email', normalized)
        .maybeSingle();
      if (d1) seller = d1;

      if (!seller) {
        const { data: d2 } = await supabase
          .from('sellers')
          .select('*')
          .eq('email', normalized)
          .maybeSingle();
        seller = d2;
      }

      if (!seller) {
        throw new Error("No account found with that email address.");
      }

      const hash = (seller.seller_password ?? seller.password) as string | null;
      if (!hash) {
        throw new Error("Account not activated yet. Contact NOTMADE admin.");
      }

      if (seller.status === 'suspended') {
        throw new Error("Your seller account has been suspended. Contact support.");
      }

      // Compare password - plain text or bcrypt
      let valid = false;
      if (hash && hash.startsWith('$2')) {
        const bcrypt = (await import('bcryptjs')).default;
        valid = await bcrypt.compare(password, hash);
      } else {
        valid = hash === password;
      }
      if (!valid) {
        throw new Error("Incorrect password. Please try again.");
      }

      setSession({
        id:         seller.id as string,
        name:       (seller.name as string) ?? "",
        brand_name: (seller.brand_name as string) ?? "",
        email:      (seller.seller_email ?? seller.email) as string,
        must_change_password: (seller.must_change_password as boolean) ?? false,
      });

      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
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
            <span style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-0.02em", userSelect: "none" }}>
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
                autoComplete="email"
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
                autoComplete="current-password"
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
