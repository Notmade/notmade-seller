"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";

const CATEGORIES = ["Apparel", "Accessories", "Footwear", "Lifestyle", "Other"];
const CAPACITIES = ["<50 units", "50–200", "200–500", "500+"];

interface FormFields {
  brand_name:    string;
  contact_name:  string;
  phone:         string;
  email:         string;
  instagram:     string;
  category:      string;
  capacity:      string;
  message:       string;
}

const EMPTY: FormFields = {
  brand_name: "", contact_name: "", phone: "", email: "",
  instagram: "", category: "", capacity: "", message: "",
};

type Status = "idle" | "loading" | "success" | "error";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        display: "block",
        fontFamily: "var(--font-archivo), Archivo, sans-serif",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "rgba(232,228,220,0.5)",
        marginBottom: 8,
      }}
    >
      {children}
    </label>
  );
}

function Chevron() {
  return (
    <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2">
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="rgba(232,228,220,0.35)" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

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
      const res = await fetch("/api/seller-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_name:   form.brand_name,
          contact_name: form.contact_name,
          phone:        form.phone,
          email:        form.email,
          instagram:    form.instagram || null,
          category:     form.category || null,
          capacity:     form.capacity || null,
          message:      form.message || null,
        }),
      });

      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Submission failed");

      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  /* ── Success state ── */
  if (status === "success") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "48px 24px",
          textAlign: "center",
          gap: 20,
        }}
      >
        <div className="success-ring">
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(200,245,66,0.08)",
              border: "2px solid #C8F542",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C8F542"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path className="check-path" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <div>
          <h3
            style={{
              fontFamily: "var(--font-bebas), 'Bebas Neue', cursive",
              fontSize: 32,
              letterSpacing: "0.04em",
              color: "#E8E4DC",
              marginBottom: 8,
            }}
          >
            WE'VE GOT YOUR DETAILS.
          </h3>
          <p
            style={{
              fontFamily: "var(--font-archivo), Archivo, sans-serif",
              fontSize: 15,
              color: "rgba(232,228,220,0.55)",
              lineHeight: 1.65,
            }}
          >
            Expect a call within 48 hours. 🤝
          </p>
        </div>

        <button
          onClick={() => { setStatus("idle"); setForm(EMPTY); }}
          style={{
            fontFamily: "var(--font-archivo), Archivo, sans-serif",
            fontSize: 12,
            color: "rgba(232,228,220,0.35)",
            background: "none",
            border: "none",
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: 3,
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

      {/* Brand + Name */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <div>
          <Label>Brand Name *</Label>
          <input
            type="text" name="brand_name" value={form.brand_name}
            onChange={handleChange} required placeholder="Your brand name"
            className="field-input-dark"
          />
        </div>
        <div>
          <Label>Your Name *</Label>
          <input
            type="text" name="contact_name" value={form.contact_name}
            onChange={handleChange} required placeholder="Full name"
            className="field-input-dark"
          />
        </div>
      </div>

      {/* Phone + Email */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <div>
          <Label>Phone *</Label>
          <div className="phone-field-dark">
            <span className="phone-prefix-dark">+91</span>
            <input
              type="tel" name="phone" value={form.phone}
              onChange={handleChange} required placeholder="98765 43210"
              className="phone-input-dark" maxLength={10}
            />
          </div>
        </div>
        <div>
          <Label>Email *</Label>
          <input
            type="email" name="email" value={form.email}
            onChange={handleChange} required placeholder="you@brand.com"
            className="field-input-dark"
          />
        </div>
      </div>

      {/* Instagram + Category */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <div>
          <Label>
            Instagram{" "}
            <span style={{ textTransform: "none", letterSpacing: 0, fontSize: 10, color: "rgba(232,228,220,0.25)", fontWeight: 400 }}>
              (optional)
            </span>
          </Label>
          <input
            type="text" name="instagram" value={form.instagram}
            onChange={handleChange} placeholder="@yourbrand"
            className="field-input-dark"
          />
        </div>
        <div>
          <Label>Product Category</Label>
          <div className="relative">
            <select
              name="category" value={form.category}
              onChange={handleChange}
              className="field-input-dark appearance-none cursor-pointer"
            >
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <Chevron />
          </div>
        </div>
      </div>

      {/* Capacity */}
      <div>
        <Label>Monthly Production Capacity</Label>
        <div className="relative">
          <select
            name="capacity" value={form.capacity}
            onChange={handleChange}
            className="field-input-dark appearance-none cursor-pointer"
          >
            <option value="">Select range</option>
            {CAPACITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <Chevron />
        </div>
      </div>

      {/* Message */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <Label>
            Anything else?{" "}
            <span style={{ textTransform: "none", letterSpacing: 0, fontSize: 10, color: "rgba(232,228,220,0.25)", fontWeight: 400 }}>
              (optional)
            </span>
          </Label>
          <span
            style={{
              fontFamily: "var(--font-archivo), Archivo, sans-serif",
              fontSize: 10,
              color: form.message.length >= 380 ? "#FF3B30" : "rgba(232,228,220,0.2)",
            }}
          >
            {form.message.length}/400
          </span>
        </div>
        <textarea
          name="message" value={form.message} onChange={handleChange}
          rows={4} maxLength={400}
          placeholder="Anything else you'd like us to know about your brand."
          className="field-input-dark"
          style={{ resize: "none" }}
        />
      </div>

      {/* Error */}
      {status === "error" && (
        <p
          style={{
            fontFamily: "var(--font-archivo), Archivo, sans-serif",
            fontSize: 13,
            color: "#FF3B30",
            background: "rgba(255,59,48,0.06)",
            border: "1px solid rgba(255,59,48,0.2)",
            borderRadius: 10,
            padding: "12px 16px",
          }}
        >
          {errMsg}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-primary"
        style={{
          width: "100%",
          fontSize: 17,
          padding: "16px 24px",
          borderRadius: 12,
          border: "none",
          cursor: status === "loading" ? "not-allowed" : "pointer",
          opacity: status === "loading" ? 0.6 : 1,
        }}
      >
        {status === "loading" ? "SUBMITTING…" : "SUBMIT APPLICATION →"}
      </button>

      <p
        style={{
          fontFamily: "var(--font-archivo), Archivo, sans-serif",
          textAlign: "center",
          fontSize: 12,
          color: "rgba(232,228,220,0.25)",
          lineHeight: 1.6,
        }}
      >
        Our team reviews every application personally.
        <br />
        We'll be in touch within 48 hours.
      </p>
    </form>
  );
}
