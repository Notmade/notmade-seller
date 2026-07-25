"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";

const CATEGORIES = ["Tees", "Hoodies", "Caps", "Accessories", "Footwear", "Jewellery", "Other"];
const CAPACITIES = [
  { value: "<50",     label: "Less than 50 units/month" },
  { value: "50-200",  label: "50–200 units/month" },
  { value: "200-500", label: "200–500 units/month" },
  { value: "500+",    label: "500+ units/month" },
];

interface FormData {
  brandName: string; name: string; whatsapp: string; email: string;
  category: string; about: string; instagram: string;
  monthlyCapacity: string; cityState: string; gstNumber: string;
}
const EMPTY: FormData = {
  brandName: "", name: "", whatsapp: "", email: "", category: "",
  about: "", instagram: "", monthlyCapacity: "", cityState: "", gstNumber: "",
};

type Status = "idle" | "loading" | "success" | "error";

const labelClass = "block font-mono text-[10px] uppercase tracking-[0.2em] mb-2" as const;

const SelectChevron = () => (
  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
    <svg className="w-3.5 h-3.5" style={{ color: "var(--muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </div>
);

export default function ApplyForm() {
  const [form, setForm]     = useState<FormData>(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "about" && value.length > 300) return;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrMsg("");
    try {
      const res = await fetch(
        "https://notmade-backend-production.up.railway.app/sellers/apply",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand_name:       form.brandName,
            name:             form.name,
            whatsapp:         form.whatsapp,
            email:            form.email,
            category:         form.category,
            about:            form.about,
            instagram:        form.instagram  || undefined,
            monthly_capacity: form.monthlyCapacity,
            city_state:       form.cityState,
            gst_number:       form.gstNumber  || undefined,
          }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Something went wrong. Try again.");
      }
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrMsg(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center space-y-5">
        <div className="success-ring">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,255,136,0.08)", border: "2px solid #00FF88" }}
          >
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="#00FF88" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path className="check-path" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div>
          <h3 className="font-bebas text-4xl tracking-widest mb-1" style={{ color: "var(--cream)" }}>
            APPLICATION RECEIVED
          </h3>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="live-dot" />
            <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "#00FF88" }}>
              IN REVIEW
            </span>
          </div>
        </div>
        <div className="max-w-sm space-y-2">
          <p className="text-sm leading-relaxed" style={{ color: "rgba(244,241,236,0.6)" }}>
            We read every application ourselves. We&apos;ll get back to you within 2–3 working days.
          </p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Watch:{" "}
            <span className="font-medium" style={{ color: "#CC0000" }}>{form.email}</span>
          </p>
        </div>
        <button
          onClick={() => { setStatus("idle"); setForm(EMPTY); }}
          className="mt-2 text-xs underline underline-offset-4 transition-colors"
          style={{ color: "var(--muted)" }}
        >
          Submit another application
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass} style={{ color: "var(--muted)" }}>Brand Name *</label>
          <input type="text" name="brandName" value={form.brandName} onChange={handleChange} required placeholder="e.g. DEADSTOCK CO." className="field-input" />
        </div>
        <div>
          <label className={labelClass} style={{ color: "var(--muted)" }}>Your Name *</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Full name" className="field-input" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass} style={{ color: "var(--muted)" }}>WhatsApp Number *</label>
          <input type="tel" name="whatsapp" value={form.whatsapp} onChange={handleChange} required placeholder="+91 98765 43210" className="field-input" />
        </div>
        <div>
          <label className={labelClass} style={{ color: "var(--muted)" }}>Email *</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@brand.com" className="field-input" />
        </div>
      </div>

      <div>
        <label className={labelClass} style={{ color: "var(--muted)" }}>Category *</label>
        <div className="relative">
          <select name="category" value={form.category} onChange={handleChange} required className="field-input appearance-none cursor-pointer">
            <option value="" disabled>Select a category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <SelectChevron />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelClass + " mb-0"} style={{ color: "var(--muted)" }}>About Your Brand *</label>
          <span className="font-mono text-[10px] tabular-nums" style={{ color: form.about.length >= 280 ? "#CC0000" : "var(--muted)" }}>
            {form.about.length}/300
          </span>
        </div>
        <textarea name="about" value={form.about} onChange={handleChange} required rows={4} maxLength={300} placeholder="What do you make? Who is it for? What makes it different?" className="field-input resize-none" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass} style={{ color: "var(--muted)" }}>
            Instagram{" "}
            <span className="normal-case tracking-normal font-sans" style={{ color: "rgba(64,64,64,0.6)", fontSize: "9px" }}>(optional)</span>
          </label>
          <input type="text" name="instagram" value={form.instagram} onChange={handleChange} placeholder="@yourbrand" className="field-input" />
        </div>
        <div>
          <label className={labelClass} style={{ color: "var(--muted)" }}>Monthly Capacity *</label>
          <div className="relative">
            <select name="monthlyCapacity" value={form.monthlyCapacity} onChange={handleChange} required className="field-input appearance-none cursor-pointer">
              <option value="" disabled>Select range</option>
              {CAPACITIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <SelectChevron />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass} style={{ color: "var(--muted)" }}>City / State *</label>
          <input type="text" name="cityState" value={form.cityState} onChange={handleChange} required placeholder="New Delhi, Delhi" className="field-input" />
        </div>
        <div>
          <label className={labelClass} style={{ color: "var(--muted)" }}>
            GST Number{" "}
            <span className="normal-case tracking-normal font-sans" style={{ color: "rgba(64,64,64,0.6)", fontSize: "9px" }}>(optional)</span>
          </label>
          <input type="text" name="gstNumber" value={form.gstNumber} onChange={handleChange} placeholder="22AAAAA0000A1Z5" className="field-input" />
        </div>
      </div>

      {status === "error" && (
        <p className="text-sm px-4 py-3" style={{ color: "#CC0000", border: "1px solid rgba(204,0,0,0.3)", background: "rgba(204,0,0,0.05)" }}>
          {errMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-glow w-full font-bebas text-xl tracking-widest py-4 rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ color: "#fff" }}
      >
        {status === "loading" ? "SUBMITTING..." : "APPLY NOW →"}
      </button>

      <p className="text-center font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
        Minimum 10 products · Monthly payouts · 12–14% commission
      </p>
    </form>
  );
}
