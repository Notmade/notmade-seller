"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";

const CATEGORIES = [
  "Tees & Hoodies",
  "Caps & Accessories",
  "Sneakers & Footwear",
  "Jewellery & Others",
  "Other",
];

const CAPACITIES = [
  { value: "<50",     label: "Under 50 units/month"    },
  { value: "50-200",  label: "50–200 units/month"       },
  { value: "200-500", label: "200–500 units/month"      },
  { value: "500+",    label: "500+ units/month"         },
];

interface FormData {
  brandName:       string;
  name:            string;
  whatsapp:        string;
  email:           string;
  category:        string;
  about:           string;
  instagram:       string;
  monthlyCapacity: string;
  cityState:       string;
  gstNumber:       string;
}

const EMPTY: FormData = {
  brandName: "", name: "", whatsapp: "", email: "", category: "",
  about: "", instagram: "", monthlyCapacity: "", cityState: "", gstNumber: "",
};

type Status = "idle" | "loading" | "success" | "error";

const Label = ({ children }: { children: React.ReactNode }) => (
  <label
    className="block text-[10px] uppercase tracking-[0.18em] mb-2 font-semibold"
    style={{ color: "#666666", fontFamily: "var(--font-space-mono), 'Space Mono', monospace" }}
  >
    {children}
  </label>
);

const Chevron = () => (
  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
    <svg className="w-3.5 h-3.5" style={{ color: "#888" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </div>
);

export default function ApplyForm() {
  const [form, setForm]     = useState<FormData>(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "about" && value.length > 300) return;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrMsg("");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch(
        `https://notmade-backend-production.up.railway.app/sellers/apply`,
        {
          method: "POST",
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand_name:       form.brandName,
            name:             form.name,
            whatsapp:         `+91${form.whatsapp}`,
            email:            form.email,
            category:         form.category,
            about:            form.about,
            instagram:        form.instagram        || undefined,
            monthly_capacity: form.monthlyCapacity,
            city_state:       form.cityState,
            gst_number:       form.gstNumber        || undefined,
          }),
        }
      );
      clearTimeout(timer);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || data?.message || `Server error (${res.status}). Please try again.`);
      }
      setStatus("success");
    } catch (err: unknown) {
      clearTimeout(timer);
      setStatus("error");
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setErrMsg("Request timed out. Please check your internet connection and try again.");
        } else if (
          err.message === "Load failed" ||
          err.message === "Failed to fetch" ||
          err.message.toLowerCase().includes("network")
        ) {
          setErrMsg("Could not connect to server. Please check your internet connection and try again.");
        } else {
          setErrMsg(err.message);
        }
      } else {
        setErrMsg("Something went wrong. Please try again.");
      }
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center gap-5">
        <div className="success-ring">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "rgba(34,197,94,0.08)", border: "2px solid #22c55e" }}
          >
            <svg
              className="w-8 h-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path className="check-path" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-2xl" style={{ color: "#0A0A0A", marginBottom: "4px" }}>
            Application received.
          </h3>
          <p
            className="text-[10px] uppercase tracking-widest"
            style={{ color: "#22c55e", fontFamily: "var(--font-space-mono)" }}
          >
            In review
          </p>
        </div>
        <p className="text-sm leading-relaxed max-w-xs" style={{ color: "#6B7280" }}>
          We&apos;ll be in touch at{" "}
          <span className="font-semibold" style={{ color: "#0A0A0A" }}>{form.email}</span>{" "}
          within 2–3 working days.
        </p>
        <button
          onClick={() => { setStatus("idle"); setForm(EMPTY); }}
          className="text-xs underline underline-offset-4 transition-colors hover:text-black"
          style={{ color: "#999999" }}
        >
          Submit another application
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label>WhatsApp *</Label>
          <div className="whatsapp-field">
            <span className="whatsapp-prefix">+91</span>
            <input
              type="tel"
              name="whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
              required
              placeholder="98765 43210"
              className="whatsapp-input"
              maxLength={10}
            />
          </div>
        </div>
        <div>
          <Label>Email *</Label>
          <input
            type="email" name="email" value={form.email}
            onChange={handleChange} required placeholder="you@brand.com"
            className="field-input"
          />
        </div>
      </div>

      <div>
        <Label>Category *</Label>
        <div className="relative">
          <select
            name="category" value={form.category}
            onChange={handleChange} required
            className="field-input appearance-none cursor-pointer"
          >
            <option value="" disabled>Select a category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <Chevron />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-[10px] uppercase tracking-[0.18em] font-semibold"
            style={{ color: "#666666", fontFamily: "var(--font-space-mono)" }}
          >
            About your brand *
          </span>
          <span
            className="text-[10px] tabular-nums"
            style={{
              color: form.about.length >= 280 ? "#C41E2E" : "#AAAAAA",
              fontFamily: "var(--font-space-mono)",
            }}
          >
            {form.about.length}/300
          </span>
        </div>
        <textarea
          name="about" value={form.about} onChange={handleChange} required
          rows={4} maxLength={300}
          placeholder="What do you make, who is it for, and what makes it different?"
          className="field-input resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label>
            Instagram handle{" "}
            <span
              className="normal-case tracking-normal font-normal"
              style={{ fontSize: "9px", color: "#BBBBBB" }}
            >
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
          <Label>Monthly Capacity *</Label>
          <div className="relative">
            <select
              name="monthlyCapacity" value={form.monthlyCapacity}
              onChange={handleChange} required
              className="field-input appearance-none cursor-pointer"
            >
              <option value="" disabled>Select range</option>
              {CAPACITIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <Chevron />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label>City &amp; State *</Label>
          <input
            type="text" name="cityState" value={form.cityState}
            onChange={handleChange} required placeholder="New Delhi, Delhi"
            className="field-input"
          />
        </div>
        <div>
          <Label>
            GST Number{" "}
            <span
              className="normal-case tracking-normal font-normal"
              style={{ fontSize: "9px", color: "#BBBBBB" }}
            >
              (optional)
            </span>
          </Label>
          <input
            type="text" name="gstNumber" value={form.gstNumber}
            onChange={handleChange} placeholder="22AAAAA0000A1Z5"
            className="field-input"
          />
        </div>
      </div>

      {status === "error" && (
        <p
          className="text-sm px-4 py-3"
          style={{
            color: "#C41E2E",
            border: "1px solid rgba(196,30,46,0.3)",
            background: "rgba(196,30,46,0.04)",
          }}
        >
          {errMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-black w-full font-semibold text-sm tracking-widest uppercase py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ borderRadius: "6px" }}
      >
        {status === "loading" ? "Submitting..." : "Submit Application"}
      </button>

      <p
        className="text-center text-[10px] leading-relaxed"
        style={{ color: "#AAAAAA", fontFamily: "var(--font-space-mono)" }}
      >
        12–14.5% commission · Monthly payouts · Minimum 5 products
      </p>
    </form>
  );
}
