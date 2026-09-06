"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import { supabase } from "../lib/supabase";

const CATEGORIES = ["Apparel", "Accessories", "Footwear", "Lifestyle", "Jewellery", "Home Decor", "Other"];
const CAPACITIES = ["Less than 50", "50-200", "200-500", "500+"];

interface FormFields {
  brand_name:        string;
  name:              string;
  phone:             string;
  email:             string;
  instagram:         string;
  category:          string;
  monthly_capacity:  string;
  message:           string;
}

const EMPTY: FormFields = {
  brand_name: "", name: "", phone: "", email: "",
  instagram: "", category: "", monthly_capacity: "", message: "",
};

type Status = "idle" | "loading" | "success" | "error";

const INPUT: React.CSSProperties = {
  width: "100%",
  background: "#1A1A1A",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 0,
  color: "#E8E4DC",
  fontSize: 16,
  padding: "14px 16px",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  fontFamily: "var(--font-archivo), Archivo, system-ui, sans-serif",
  minHeight: 48,
  boxSizing: "border-box" as const,
};

const LABEL: React.CSSProperties = {
  color: "#999999",
  fontSize: 11,
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  marginBottom: 6,
  display: "block",
  fontFamily: "var(--font-archivo), Archivo, system-ui, sans-serif",
};

const CHEVRON_URI = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`;

export default function ApplyForm() {
  const [form, setForm] = useState<FormFields>(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "message" && value.length > 400) return;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrMsg("");

    try {
      const about_brand = [
        form.monthly_capacity ? `Monthly Capacity: ${form.monthly_capacity} orders/month` : "",
        form.message,
      ].filter(Boolean).join("\n\n");

      const { error } = await supabase.from("sellers").insert({
        brand_name:  form.brand_name,
        name:        form.name,
        email:       form.email,
        phone:       `+91${form.phone}`,
        instagram:   form.instagram || null,
        category:    form.category,
        about_brand: about_brand || null,
        status:      "pending",
      });

      if (error) throw new Error(error.message);
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  /* ── Success ── */
  if (status === "success") {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "56px 0", textAlign: "center", gap: 24,
      }}>
        <div
          style={{
            width: 80, height: 80,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid #22c55e",
            background: "rgba(34,197,94,0.06)",
          }}
          className="success-ring"
        >
          <svg width={40} height={40} viewBox="0 0 24 24" fill="none"
            stroke="#22c55e" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path className="check-path" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <h3 style={{
            fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
            fontSize: 28, fontWeight: 400, letterSpacing: "0.08em",
            color: "#FFFFFF", marginBottom: 8,
          }}>
            APPLICATION RECEIVED
          </h3>
          <p style={{
            fontFamily: "var(--font-archivo), Archivo, sans-serif",
            fontSize: 15, color: "#999999", lineHeight: 1.6,
          }}>
            Expect a call within 48 hours. 🤝
          </p>
        </div>

        <button
          onClick={() => { setStatus("idle"); setForm(EMPTY); }}
          style={{
            fontSize: 12, color: "#666666",
            background: "none", border: "none", cursor: "pointer",
            textDecoration: "underline", textUnderlineOffset: 3,
            fontFamily: "var(--font-archivo), Archivo, sans-serif",
          }}
        >
          Submit another application
        </button>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Brand Name + Your Name */}
      <div className="apply-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={LABEL}>Brand Name *</label>
          <input type="text" name="brand_name" value={form.brand_name}
            onChange={handleChange} required placeholder="Your brand name"
            className="apply-input" style={INPUT} />
        </div>
        <div>
          <label style={LABEL}>Your Name *</label>
          <input type="text" name="name" value={form.name}
            onChange={handleChange} required placeholder="Full name"
            className="apply-input" style={INPUT} />
        </div>
      </div>

      {/* Phone + Email */}
      <div className="apply-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={LABEL}>Phone *</label>
          <div className="apply-phone-wrap" style={{
            display: "flex",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "#1A1A1A",
            minHeight: 48,
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}>
            <span style={{
              padding: "0 14px", fontSize: 16,
              color: "rgba(232,228,220,0.5)",
              borderRight: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              flexShrink: 0, userSelect: "none",
              fontFamily: "var(--font-archivo), Archivo, sans-serif",
              display: "flex", alignItems: "center",
            }}>+91</span>
            <input type="tel" name="phone" value={form.phone}
              onChange={handleChange} required placeholder="98765 43210"
              maxLength={10}
              className="apply-phone-input"
              style={{
                flex: 1, border: "none", outline: "none",
                padding: "14px 16px", fontSize: 16,
                background: "transparent", color: "#E8E4DC",
                fontFamily: "var(--font-archivo), Archivo, sans-serif",
                minWidth: 0,
              }} />
          </div>
        </div>
        <div>
          <label style={LABEL}>Email *</label>
          <input type="email" name="email" value={form.email}
            onChange={handleChange} required placeholder="you@brand.com"
            className="apply-input" style={INPUT} />
        </div>
      </div>

      {/* Instagram + Category */}
      <div className="apply-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={LABEL}>
            Instagram Handle{" "}
            <span style={{ textTransform: "none", letterSpacing: 0, fontSize: 10, color: "#555", fontWeight: 400 }}>
              (optional)
            </span>
          </label>
          <input type="text" name="instagram" value={form.instagram}
            onChange={handleChange} placeholder="@yourbrand"
            className="apply-input" style={INPUT} />
        </div>
        <div>
          <label style={LABEL}>Product Category *</label>
          <select name="category" value={form.category}
            onChange={handleChange} required
            className="apply-input"
            style={{
              ...INPUT, appearance: "none", cursor: "pointer",
              backgroundImage: CHEVRON_URI,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 14px center",
              paddingRight: 40,
            }}>
            <option value="" disabled style={{ background: "#1A1A1A", color: "#E8E4DC" }}>
              Select category
            </option>
            {CATEGORIES.map(c => (
              <option key={c} value={c} style={{ background: "#1A1A1A", color: "#E8E4DC" }}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Monthly Capacity */}
      <div>
        <label style={LABEL}>Monthly Capacity *</label>
        <select name="monthly_capacity" value={form.monthly_capacity}
          onChange={handleChange} required
          className="apply-input"
          style={{
            ...INPUT, appearance: "none", cursor: "pointer",
            backgroundImage: CHEVRON_URI,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 14px center",
            paddingRight: 40,
          }}>
          <option value="" disabled style={{ background: "#1A1A1A", color: "#E8E4DC" }}>
            How many orders/month?
          </option>
          {CAPACITIES.map(c => (
            <option key={c} value={c} style={{ background: "#1A1A1A", color: "#E8E4DC" }}>{c}</option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={LABEL}>
            Message{" "}
            <span style={{ textTransform: "none", letterSpacing: 0, fontSize: 10, color: "#555", fontWeight: 400 }}>
              (optional)
            </span>
          </span>
          <span style={{
            fontSize: 10,
            color: form.message.length >= 380 ? "#CC0000" : "#555",
            fontFamily: "var(--font-archivo), Archivo, system-ui, sans-serif",
            fontVariantNumeric: "tabular-nums",
          }}>
            {form.message.length}/400
          </span>
        </div>
        <textarea
          name="message" value={form.message}
          onChange={handleChange} rows={4} maxLength={400}
          placeholder="Tell us about your brand — what you make, who it's for, what sets you apart."
          className="apply-input"
          style={{ ...INPUT, resize: "none" }}
        />
      </div>

      {/* Error */}
      {status === "error" && (
        <p style={{
          color: "#CC0000", fontSize: 14,
          padding: "12px 16px",
          border: "1px solid rgba(204,0,0,0.3)",
          background: "rgba(204,0,0,0.05)",
          fontFamily: "var(--font-archivo), Archivo, system-ui, sans-serif",
        }}>
          {errMsg}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "loading"}
        className="apply-submit"
        style={{
          background: "#CC0000",
          color: "#FFFFFF",
          fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
          fontSize: 18, letterSpacing: "0.1em",
          padding: "16px 40px",
          width: "100%",
          border: "none", borderRadius: 0,
          cursor: status === "loading" ? "not-allowed" : "pointer",
          marginTop: 4,
          opacity: status === "loading" ? 0.7 : 1,
          transition: "background 0.2s, opacity 0.2s",
        }}
      >
        {status === "loading" ? "SUBMITTING..." : "START SELLING →"}
      </button>

      <p style={{
        textAlign: "center", fontSize: 11, color: "#555",
        lineHeight: 1.6,
        fontFamily: "var(--font-archivo), Archivo, system-ui, sans-serif",
      }}>
        17% flat commission · 7-day payouts · No hidden fees
      </p>
    </form>
  );
}
