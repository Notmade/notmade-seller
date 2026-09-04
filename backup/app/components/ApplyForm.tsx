"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import { supabase } from "../lib/supabase";

const CATEGORIES = ["Streetwear", "Jewellery", "Rugs", "Accessories", "Other"];

interface FormFields {
  brand_name:  string;
  name:        string;
  email:       string;
  phone:       string;
  instagram:   string;
  category:    string;
  about_brand: string;
}

const EMPTY: FormFields = {
  brand_name: "", name: "", email: "", phone: "",
  instagram: "", category: "", about_brand: "",
};

type Status = "idle" | "loading" | "success" | "error";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="block text-[11px] uppercase tracking-[0.14em] mb-2 font-semibold"
      style={{ color: "#555555" }}
    >
      {children}
    </label>
  );
}

function Chevron() {
  return (
    <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2">
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#999" strokeWidth={2}>
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
    if (name === "about_brand" && value.length > 400) return;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrMsg("");

    try {
      const { error } = await supabase.from("sellers").insert({
        brand_name:  form.brand_name,
        name:        form.name,
        email:       form.email,
        phone:       `+91${form.phone}`,
        instagram:   form.instagram || null,
        category:    form.category,
        about_brand: form.about_brand,
        status:      "pending",
      });

      if (error) throw new Error(error.message);
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  /* ── Success state ── */
  if (status === "success") {
    return (
      <div className="flex flex-col items-center py-14 text-center gap-6">
        <div className="success-ring">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "rgba(204,0,0,0.06)", border: "2px solid #CC0000" }}
          >
            <svg
              className="w-10 h-10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#CC0000"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path className="check-path" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-1" style={{ fontSize: "22px", color: "#111111" }}>
            Application Submitted!
          </h3>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#CC0000",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Under Review
          </p>
        </div>

        <p style={{ fontSize: "15px", lineHeight: 1.7, color: "#555555", maxWidth: "300px" }}>
          We&apos;ll contact you at{" "}
          <strong style={{ color: "#111111" }}>{form.email}</strong>{" "}
          within 48 hours.
        </p>

        <button
          onClick={() => { setStatus("idle"); setForm(EMPTY); }}
          style={{
            fontSize: "12px",
            color: "#999999",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
          }}
        >
          Submit another application
        </button>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Brand + Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Brand Name *</Label>
          <input
            type="text" name="brand_name" value={form.brand_name}
            onChange={handleChange} required placeholder="Your brand name"
            className="field-input"
          />
        </div>
        <div>
          <Label>Your Name *</Label>
          <input
            type="text" name="name" value={form.name}
            onChange={handleChange} required placeholder="Full name"
            className="field-input"
          />
        </div>
      </div>

      {/* Email + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Email *</Label>
          <input
            type="email" name="email" value={form.email}
            onChange={handleChange} required placeholder="you@brand.com"
            className="field-input"
          />
        </div>
        <div>
          <Label>Phone *</Label>
          <div className="phone-field">
            <span className="phone-prefix">+91</span>
            <input
              type="tel" name="phone" value={form.phone}
              onChange={handleChange} required placeholder="98765 43210"
              className="phone-input" maxLength={10}
            />
          </div>
        </div>
      </div>

      {/* Instagram + Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>
            Instagram Handle{" "}
            <span style={{ textTransform: "none", letterSpacing: 0, fontSize: "10px", color: "#BBBBBB", fontWeight: 400 }}>
              (optional)
            </span>
          </Label>
          <input
            type="text" name="instagram" value={form.instagram}
            onChange={handleChange} placeholder="@yourbrand"
            className="field-input"
          />
        </div>
        <div>
          <Label>Product Category *</Label>
          <div className="relative">
            <select
              name="category" value={form.category}
              onChange={handleChange} required
              className="field-input appearance-none cursor-pointer"
            >
              <option value="" disabled>Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <Chevron />
          </div>
        </div>
      </div>

      {/* About */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-[11px] uppercase tracking-[0.14em] font-semibold"
            style={{ color: "#555555" }}
          >
            About Your Brand *
          </span>
          <span
            className="text-[10px] tabular-nums"
            style={{ color: form.about_brand.length >= 380 ? "#CC0000" : "#AAAAAA" }}
          >
            {form.about_brand.length}/400
          </span>
        </div>
        <textarea
          name="about_brand" value={form.about_brand} onChange={handleChange}
          required rows={4} maxLength={400}
          placeholder="Tell us about your brand — what you make, who it's for, what sets you apart."
          className="field-input resize-none"
        />
      </div>

      {/* Error */}
      {status === "error" && (
        <p
          className="text-sm px-4 py-3 rounded-xl"
          style={{
            color: "#CC0000",
            border: "1px solid rgba(204,0,0,0.25)",
            background: "rgba(204,0,0,0.04)",
          }}
        >
          {errMsg}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-primary w-full font-bold text-sm tracking-widest uppercase py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ borderRadius: "12px" }}
      >
        {status === "loading" ? "Submitting…" : "Submit Application →"}
      </button>

      <p className="text-center text-[11px] leading-relaxed" style={{ color: "#AAAAAA" }}>
        17% flat commission · Same day payouts · No hidden fees
      </p>
    </form>
  );
}
