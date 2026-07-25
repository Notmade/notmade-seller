"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";

const CATEGORIES = [
  "Tees",
  "Hoodies",
  "Caps",
  "Accessories",
  "Footwear",
  "Jewellery",
  "Other",
];

const CAPACITIES = [
  { value: "<50", label: "Less than 50 units/month" },
  { value: "50-200", label: "50–200 units/month" },
  { value: "200-500", label: "200–500 units/month" },
  { value: "500+", label: "500+ units/month" },
];

interface FormData {
  brandName: string;
  name: string;
  whatsapp: string;
  email: string;
  category: string;
  about: string;
  instagram: string;
  monthlyCapacity: string;
  cityState: string;
  gstNumber: string;
}

const EMPTY: FormData = {
  brandName: "",
  name: "",
  whatsapp: "",
  email: "",
  category: "",
  about: "",
  instagram: "",
  monthlyCapacity: "",
  cityState: "",
  gstNumber: "",
};

type Status = "idle" | "loading" | "success" | "error";

const inputClass =
  "w-full bg-[#111111] border border-[#222222] text-white placeholder-gray-600 rounded-none px-4 py-3 text-sm focus:outline-none focus:border-[#CC0000] transition-colors duration-200";

const labelClass =
  "block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2";

export default function ApplyForm() {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "about" && value.length > 300) return;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch(
        "https://notmade-backend-production.up.railway.app/sellers/apply",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand_name: form.brandName,
            name: form.name,
            whatsapp: form.whatsapp,
            email: form.email,
            category: form.category,
            about: form.about,
            instagram: form.instagram || undefined,
            monthly_capacity: form.monthlyCapacity,
            city_state: form.cityState,
            gst_number: form.gstNumber || undefined,
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
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center space-y-5">
        <div className="success-ring">
          <div className="w-20 h-20 rounded-full bg-[#0A2A0A] border-2 border-green-500 flex items-center justify-center">
            <svg
              className="w-10 h-10"
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
          <h3 className="font-bebas text-4xl tracking-widest text-white mb-1">
            APPLICATION RECEIVED!
          </h3>
          <p className="text-2xl">🎉</p>
        </div>
        <div className="max-w-sm space-y-2">
          <p className="text-gray-300 text-sm leading-relaxed">
            Thanks for showing interest in NOTMADE. We&apos;ll review your
            application and get back to you within 2–3 working days.
          </p>
          <p className="text-gray-500 text-sm">
            Keep an eye on your email:{" "}
            <span className="text-[#CC0000] font-medium">{form.email}</span>
          </p>
        </div>
        <button
          onClick={() => {
            setStatus("idle");
            setForm(EMPTY);
          }}
          className="mt-2 text-sm text-gray-600 hover:text-white transition-colors underline underline-offset-4"
        >
          Submit another application
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Brand Name *</label>
          <input
            type="text"
            name="brandName"
            value={form.brandName}
            onChange={handleChange}
            required
            placeholder="e.g. DEADSTOCK CO."
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Your Name *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Full name"
            className={inputClass}
          />
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>WhatsApp Number *</label>
          <input
            type="tel"
            name="whatsapp"
            value={form.whatsapp}
            onChange={handleChange}
            required
            placeholder="+91 98765 43210"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Email *</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="you@brand.com"
            className={inputClass}
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className={labelClass}>Category *</label>
        <div className="relative">
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className={`${inputClass} appearance-none cursor-pointer`}
          >
            <option value="" disabled>
              Select a category
            </option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-[#111111]">
                {cat}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* About */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelClass + " mb-0"}>About Your Brand *</label>
          <span
            className={`text-xs tabular-nums ${form.about.length >= 280 ? "text-[#CC0000]" : "text-gray-600"}`}
          >
            {form.about.length}/300
          </span>
        </div>
        <textarea
          name="about"
          value={form.about}
          onChange={handleChange}
          required
          rows={4}
          maxLength={300}
          placeholder="What do you make? Who is it for? What makes it different?"
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Instagram + Capacity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>
            Instagram Handle{" "}
            <span className="text-gray-600 normal-case tracking-normal font-normal">
              (optional)
            </span>
          </label>
          <input
            type="text"
            name="instagram"
            value={form.instagram}
            onChange={handleChange}
            placeholder="@yourbrand"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Monthly Production Capacity *</label>
          <div className="relative">
            <select
              name="monthlyCapacity"
              value={form.monthlyCapacity}
              onChange={handleChange}
              required
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              <option value="" disabled>
                Select range
              </option>
              {CAPACITIES.map((c) => (
                <option key={c.value} value={c.value} className="bg-[#111111]">
                  {c.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* City + GST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>City / State *</label>
          <input
            type="text"
            name="cityState"
            value={form.cityState}
            onChange={handleChange}
            required
            placeholder="e.g. New Delhi, Delhi"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            GST Number{" "}
            <span className="text-gray-600 normal-case tracking-normal font-normal">
              (optional)
            </span>
          </label>
          <input
            type="text"
            name="gstNumber"
            value={form.gstNumber}
            onChange={handleChange}
            placeholder="22AAAAA0000A1Z5"
            className={inputClass}
          />
        </div>
      </div>

      {status === "error" && (
        <p className="text-[#CC0000] text-sm border border-[#CC0000]/30 bg-[#CC0000]/5 px-4 py-3">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-[#CC0000] hover:bg-[#A00000] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bebas text-xl tracking-widest py-4 transition-colors duration-200"
      >
        {status === "loading" ? "SUBMITTING..." : "APPLY NOW →"}
      </button>

      <p className="text-center text-xs text-gray-600 leading-relaxed">
        By applying you agree to our seller terms. Minimum 10 products to list.
        We review every application manually.
      </p>
    </form>
  );
}
