"use client";

import { useState, FormEvent } from "react";

const CATEGORIES = [
  "Streetwear",
  "Footwear",
  "Accessories",
  "Headwear",
  "Bags & Backpacks",
  "Vintage",
  "Art & Prints",
  "Jewellery",
  "Other",
];

interface FormData {
  brandName: string;
  name: string;
  whatsapp: string;
  email: string;
  category: string;
  about: string;
}

type Status = "idle" | "loading" | "success" | "error";

export default function ApplyForm() {
  const [form, setForm] = useState<FormData>({
    brandName: "",
    name: "",
    whatsapp: "",
    email: "",
    category: "",
    about: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Something went wrong. Try again.");
      }

      setStatus("success");
      setForm({
        brandName: "",
        name: "",
        whatsapp: "",
        email: "",
        category: "",
        about: "",
      });
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#CC0000] flex items-center justify-center mb-2">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="font-bebas text-4xl tracking-widest text-white">
          APPLICATION RECEIVED
        </h3>
        <p className="text-gray-400 max-w-sm leading-relaxed">
          We&apos;ll review your application and reach out on WhatsApp within 48
          hours. Stay tuned.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm text-[#CC0000] underline underline-offset-4 hover:text-white transition-colors"
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
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Brand Name *
          </label>
          <input
            type="text"
            name="brandName"
            value={form.brandName}
            onChange={handleChange}
            required
            placeholder="e.g. DEADSTOCK CO."
            className="w-full bg-[#111111] border border-[#222222] text-white placeholder-gray-600 rounded-none px-4 py-3 text-sm focus:outline-none focus:border-[#CC0000] transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Your Name *
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Full name"
            className="w-full bg-[#111111] border border-[#222222] text-white placeholder-gray-600 rounded-none px-4 py-3 text-sm focus:outline-none focus:border-[#CC0000] transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            WhatsApp Number *
          </label>
          <input
            type="tel"
            name="whatsapp"
            value={form.whatsapp}
            onChange={handleChange}
            required
            placeholder="+91 98765 43210"
            className="w-full bg-[#111111] border border-[#222222] text-white placeholder-gray-600 rounded-none px-4 py-3 text-sm focus:outline-none focus:border-[#CC0000] transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="you@brand.com"
            className="w-full bg-[#111111] border border-[#222222] text-white placeholder-gray-600 rounded-none px-4 py-3 text-sm focus:outline-none focus:border-[#CC0000] transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Category *
        </label>
        <div className="relative">
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="w-full appearance-none bg-[#111111] border border-[#222222] text-white rounded-none px-4 py-3 text-sm focus:outline-none focus:border-[#CC0000] transition-colors cursor-pointer"
          >
            <option value="" disabled>
              Select a category
            </option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
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

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Tell us about your brand *
        </label>
        <textarea
          name="about"
          value={form.about}
          onChange={handleChange}
          required
          rows={4}
          placeholder="What do you make? Who is it for? What makes it different?"
          className="w-full bg-[#111111] border border-[#222222] text-white placeholder-gray-600 rounded-none px-4 py-3 text-sm focus:outline-none focus:border-[#CC0000] transition-colors resize-none"
        />
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
        {status === "loading" ? "SUBMITTING..." : "APPLY NOW"}
      </button>

      <p className="text-center text-xs text-gray-600">
        By applying you agree to our seller terms. We review every application
        manually.
      </p>
    </form>
  );
}
