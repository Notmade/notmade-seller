"use client";

import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { clearToken, getSellerId } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

interface ProfileForm {
  name:               string;
  phone:              string;
  brand_name:         string;
  category:           string;
  instagram:          string;
  gstin:              string;
  upi_id:             string;
  bank_account_name:  string;
  bank_account_number:string;
  bank_ifsc:          string;
  bank_name:          string;
}

const EMPTY: ProfileForm = {
  name: "", phone: "", brand_name: "", category: "", instagram: "",
  gstin: "", upi_id: "", bank_account_name: "", bank_account_number: "", bank_ifsc: "", bank_name: "",
};

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #EEEEEE", borderRadius: 14, padding: "22px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: 16 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111111", marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid #F5F5F5" }}>{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#555555", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");
  const [form,    setForm]    = useState<ProfileForm>(EMPTY);
  const [email,   setEmail]   = useState("");
  const [status,  setStatus]  = useState("pending");

  useEffect(() => {
    const sellerId = getSellerId();
    if (!sellerId) { clearToken(); router.replace("/login"); return; }

    void (async () => {
      try {
        const { data, error: err } = await supabase
          .from('sellers')
          .select('name, phone, brand_name, category, instagram, gstin, upi_id, bank_account_name, bank_account_number, bank_ifsc, bank_name, email, seller_email, status')
          .eq('id', sellerId)
          .maybeSingle();
        if (err) { clearToken(); router.replace("/login"); return; }
        if (data) {
          setEmail(((data.seller_email ?? data.email) as string | null) ?? "");
          setStatus((data.status as string | null) ?? "pending");
          setForm({
            name:                (data.name as string | null)                ?? "",
            phone:               (data.phone as string | null)               ?? "",
            brand_name:          (data.brand_name as string | null)          ?? "",
            category:            (data.category as string | null)            ?? "",
            instagram:           (data.instagram as string | null)           ?? "",
            gstin:               (data.gstin as string | null)               ?? "",
            upi_id:              (data.upi_id as string | null)              ?? "",
            bank_account_name:   (data.bank_account_name as string | null)   ?? "",
            bank_account_number: (data.bank_account_number as string | null) ?? "",
            bank_ifsc:           (data.bank_ifsc as string | null)           ?? "",
            bank_name:           (data.bank_name as string | null)           ?? "",
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const sellerId = getSellerId();
    if (!sellerId) return;
    setSaving(true);
    setSaved(false);
    setError("");

    const { error: err } = await supabase
      .from('sellers')
      .update({
        name:                form.name               || null,
        phone:               form.phone              || null,
        brand_name:          form.brand_name         || null,
        instagram:           form.instagram          || null,
        gstin:               form.gstin              || null,
        upi_id:              form.upi_id             || null,
        bank_account_name:   form.bank_account_name  || null,
        bank_account_number: form.bank_account_number || null,
        bank_ifsc:           form.bank_ifsc          || null,
        bank_name:           form.bank_name          || null,
      })
      .eq('id', sellerId);

    setSaving(false);
    if (err) {
      setError(err.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
    pending:   { bg: "#FFFBEB", color: "#B45309", label: "Pending Approval" },
    active:    { bg: "#F0FDF4", color: "#166534", label: "Active" },
    suspended: { bg: "#FFF5F5", color: "#CC0000", label: "Suspended" },
  };
  const sc = statusStyles[status] ?? statusStyles.pending;

  if (loading) {
    return (
      <div style={{ display: "flex", height: "50vh", alignItems: "center", justifyContent: "center" }}>
        <div className="spin" style={{ width: 28, height: 28, border: "3px solid #EEE", borderTopColor: "#CC0000", borderRadius: "50%" }} />
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111111", letterSpacing: "-0.02em" }}>Profile</h1>
          <p style={{ fontSize: 14, color: "#888888", marginTop: 4 }}>Manage your brand and payment details</p>
        </div>
        <span style={{ display: "inline-block", fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 100, background: sc.bg, color: sc.color }}>
          {sc.label}
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Brand & Contact */}
        <SectionCard title="Brand & Contact">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Your Name *">
              <input name="name" value={form.name} onChange={handleChange} required placeholder="Full name" className="field-input" />
            </Field>
            <Field label="Email">
              <input value={email} disabled className="field-input" style={{ background: "#F9F9F9", color: "#888888", cursor: "not-allowed" }} />
            </Field>
            <Field label="Phone">
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" className="field-input" />
            </Field>
            <Field label="Instagram">
              <input name="instagram" value={form.instagram} onChange={handleChange} placeholder="@yourbrand" className="field-input" />
            </Field>
            <Field label="Brand Name">
              <input name="brand_name" value={form.brand_name} onChange={handleChange} placeholder="Brand name" className="field-input" />
            </Field>
            <Field label="Category">
              <input name="category" value={form.category} disabled className="field-input" style={{ background: "#F9F9F9", color: "#888888", cursor: "not-allowed" }} />
            </Field>
          </div>
        </SectionCard>

        {/* Bank Account */}
        <SectionCard title="Bank Account">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Account Holder Name">
              <input name="bank_account_name" value={form.bank_account_name} onChange={handleChange} placeholder="As per bank records" className="field-input" />
            </Field>
            <Field label="Bank Name">
              <input name="bank_name" value={form.bank_name} onChange={handleChange} placeholder="e.g. HDFC Bank" className="field-input" />
            </Field>
            <Field label="Account Number">
              <input name="bank_account_number" value={form.bank_account_number} onChange={handleChange} placeholder="Account number" className="field-input" />
            </Field>
            <Field label="IFSC Code">
              <input name="bank_ifsc" value={form.bank_ifsc} onChange={handleChange} placeholder="e.g. HDFC0001234" className="field-input" style={{ textTransform: "uppercase" }} />
            </Field>
          </div>
        </SectionCard>

        {/* Tax & UPI */}
        <SectionCard title="Tax & UPI">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="GSTIN">
              <input name="gstin" value={form.gstin} onChange={handleChange} placeholder="22AAAAA0000A1Z5" className="field-input" style={{ textTransform: "uppercase" }} />
            </Field>
            <Field label="UPI ID">
              <input name="upi_id" value={form.upi_id} onChange={handleChange} placeholder="yourname@upi" className="field-input" />
            </Field>
          </div>
        </SectionCard>

        {error && (
          <p style={{ fontSize: 13, color: "#CC0000", padding: "10px 14px", background: "rgba(204,0,0,0.04)", border: "1px solid rgba(204,0,0,0.2)", borderRadius: 10, marginBottom: 16 }}>
            {error}
          </p>
        )}

        {saved && (
          <p style={{ fontSize: 13, color: "#166534", padding: "10px 14px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, marginBottom: 16 }}>
            ✓ Changes saved successfully.
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="btn-primary"
          style={{ borderRadius: 10, padding: "13px 28px", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", border: "none", opacity: saving ? 0.6 : 1 }}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </>
  );
}
