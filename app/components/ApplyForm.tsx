"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";

const CATEGORIES = ["Streetwear", "Jewellery", "Rugs", "Accessories", "Other"];

const CAPACITIES = [
  { value: "under-50",  label: "Under 50 units / month" },
  { value: "50-200",    label: "50 – 200 units / month" },
  { value: "200-500",   label: "200 – 500 units / month" },
  { value: "500+",      label: "500+ units / month" },
];

const PRICE_RANGES = [
  { value: "500-1000",  label: "₹500 – ₹1,000" },
  { value: "1000-3000", label: "₹1,000 – ₹3,000" },
  { value: "3000+",     label: "₹3,000+" },
];

interface FormFields {
  brandName:  string;
  name:       string;
  email:      string;
  phone:      string;
  instagram:  string;
  category:   string;
  capacity:   string;
  priceRange: string;
  about:      string;
}

const EMPTY: FormFields = {
  brandName: "", name: "", email: "", phone: "", instagram: "",
  category: "", capacity: "", priceRange: "", about: "",
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
  const [form, setForm]           = useState<FormFields>(EMPTY);
  const [portfolio, setPortfolio] = useState<File | null>(null);
  const [status, setStatus]       = useState<Status>("idle");
  const [errMsg, setErrMsg]       = useState("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "about" && value.length > 400) return;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    setPortfolio(e.target.files?.[0] ?? null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrMsg("");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    try {
      const data = new FormData();
      data.append("brand_name",       form.brandName);
      data.append("name",             form.name);
      data.append("email",            form.email);
      data.append("phone",            `+91${form.phone}`);
      data.append("category",         form.category);
      data.append("monthly_capacity", form.capacity);
      data.append("price_range",      form.priceRange);
      data.append("about",            form.about);
      if (form.instagram) data.append("instagram", form.instagram);
      if (portfolio)      data.append("portfolio",  portfolio);

      const res = await fetch("https://api.notmade.in/sellers/apply", {
        method: "POST",
        signal: controller.signal,
        body:   data,
      });
      clearTimeout(timer);

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(
          json?.error || json?.message || `Server error (${res.status}). Please try again.`
        );
      }
      setStatus("success");
    } catch (err: unknown) {
      clearTimeout(timer);
      setStatus("error");
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setErrMsg("Request timed out. Please check your connection and try again.");
        } else if (
          err.message === "Load failed" ||
          err.message === "Failed to fetch" ||
          err.message.toLowerCase().includes("network")
        ) {
          setErrMsg("Could not connect. Please check your internet connection and try again.");
        } else {
          setErrMsg(err.message);
        }
      } else {
        setErrMsg("Something went wrong. Please try again.");
      }
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
          onClick={() => { setStatus("idle"); setForm(EMPTY); setPortfolio(null); }}
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
            type="text" name="brandName" value={form.brandName}
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

      {/* Capacity + Price range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Monthly Production *</Label>
          <div className="relative">
            <select
              name="capacity" value={form.capacity}
              onChange={handleChange} required
              className="field-input appearance-none cursor-pointer"
            >
              <option value="" disabled>Select capacity</option>
              {CAPACITIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <Chevron />
          </div>
        </div>
        <div>
          <Label>Price Range *</Label>
          <div className="relative">
            <select
              name="priceRange" value={form.priceRange}
              onChange={handleChange} required
              className="field-input appearance-none cursor-pointer"
            >
              <option value="" disabled>Select price range</option>
              {PRICE_RANGES.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
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
            style={{ color: form.about.length >= 380 ? "#CC0000" : "#AAAAAA" }}
          >
            {form.about.length}/400
          </span>
        </div>
        <textarea
          name="about" value={form.about} onChange={handleChange}
          required rows={4} maxLength={400}
          placeholder="Tell us about your brand — what you make, who it's for, what sets you apart."
          className="field-input resize-none"
        />
      </div>

      {/* Portfolio upload */}
      <div>
        <Label>
          Portfolio / Lookbook{" "}
          <span style={{ textTransform: "none", letterSpacing: 0, fontSize: "10px", color: "#BBBBBB", fontWeight: 400 }}>
            (optional)
          </span>
        </Label>
        <label
          htmlFor="portfolio-file"
          className={`file-drop${portfolio ? " selected" : ""}`}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              flexShrink: 0,
              background: portfolio ? "rgba(204,0,0,0.08)" : "#F0F0F0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke={portfolio ? "#CC0000" : "#888"} strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round"
            >
              {portfolio
                ? <path d="M20 6L9 17l-5-5" />
                : <>
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </>
              }
            </svg>
          </div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: portfolio ? "#CC0000" : "#111111" }}>
              {portfolio ? portfolio.name : "Click to upload"}
            </p>
            <p style={{ fontSize: "12px", color: "#888888", marginTop: "2px" }}>
              {portfolio
                ? `${(portfolio.size / 1024 / 1024).toFixed(1)} MB`
                : "PDF, JPG, PNG — up to 10MB"}
            </p>
          </div>
        </label>
        <input
          id="portfolio-file"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="sr-only"
          onChange={handleFile}
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
