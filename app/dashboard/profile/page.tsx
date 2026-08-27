"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSellerId, clearToken } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

interface ProfileData {
  name: string;
  brand_name: string;
  email: string;
  phone: string;
  instagram: string;
  gstin: string;
  upi_id: string;
  bank_holder: string;
  bank_account_number: string;
  ifsc_code: string;
  bank_name: string;
}

const EMPTY: ProfileData = {
  name: "", brand_name: "", email: "", phone: "", instagram: "",
  gstin: "", upi_id: "", bank_holder: "", bank_account_number: "", ifsc_code: "", bank_name: "",
};

const inputCls = "w-full border border-[#DDDDDD] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#CC0000] focus:ring-1 focus:ring-[#CC0000]";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#555555", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>
        {label}{required && " *"}
      </label>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #EEEEEE", borderRadius: 14, padding: "22px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: 16 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111111", marginBottom: 18 }}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {children}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile,  setProfile]  = useState<ProfileData>(EMPTY);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState("");
  const [isErr,    setIsErr]    = useState(false);

  const sellerId = getSellerId();

  useEffect(() => {
    if (!sellerId) { clearToken(); router.replace("/login"); return; }
    void (async () => {
      const { data, error } = await supabase
        .from("sellers")
        .select("name, brand_name, email, phone, instagram, gstin, upi_id, bank_holder, bank_account_number, ifsc_code, bank_name")
        .eq("id", sellerId)
        .single();
      if (error) { clearToken(); router.replace("/login"); return; }
      if (data) {
        setProfile({
          name:               (data.name as string) ?? "",
          brand_name:         (data.brand_name as string) ?? "",
          email:              (data.email as string) ?? "",
          phone:              (data.phone as string) ?? "",
          instagram:          (data.instagram as string) ?? "",
          gstin:              (data.gstin as string) ?? "",
          upi_id:             (data.upi_id as string) ?? "",
          bank_holder:        (data.bank_holder as string) ?? "",
          bank_account_number:(data.bank_account_number as string) ?? "",
          ifsc_code:          (data.ifsc_code as string) ?? "",
          bank_name:          (data.bank_name as string) ?? "",
        });
      }
      setLoading(false);
    })();
  }, [router, sellerId]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setProfile(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!sellerId) return;
    setSaving(true);
    setMsg("");

    const { error } = await supabase
      .from("sellers")
      .update({
        name:                profile.name.trim(),
        phone:               profile.phone.trim(),
        instagram:           profile.instagram.trim() || null,
        gstin:               profile.gstin.trim() || null,
        upi_id:              profile.upi_id.trim() || null,
        bank_holder:         profile.bank_holder.trim() || null,
        bank_account_number: profile.bank_account_number.trim() || null,
        ifsc_code:           profile.ifsc_code.trim().toUpperCase() || null,
        bank_name:           profile.bank_name.trim() || null,
      })
      .eq("id", sellerId);

    setSaving(false);
    if (error) {
      setIsErr(true);
      setMsg("Error saving: " + error.message);
    } else {
      setIsErr(false);
      setMsg("Profile updated successfully.");
      setTimeout(() => setMsg(""), 4000);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", height: "50vh", alignItems: "center", justifyContent: "center" }}>
        <div className="spin" style={{ width: 28, height: 28, border: "3px solid #EEE", borderTopColor: "#CC0000", borderRadius: "50%" }} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111111", letterSpacing: "-0.02em" }}>Profile</h1>
          <p style={{ fontSize: 14, color: "#888888", marginTop: 4 }}>Your brand and payment information</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="btn-primary"
          style={{ borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", border: "none", opacity: saving ? 0.6 : 1 }}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {msg && (
        <div style={{ marginBottom: 16, padding: "10px 14px", background: isErr ? "rgba(204,0,0,0.04)" : "#F0FDF4", border: `1px solid ${isErr ? "rgba(204,0,0,0.2)" : "#BBF7D0"}`, borderRadius: 8, fontSize: 13, color: isErr ? "#CC0000" : "#166534" }}>
          {msg}
        </div>
      )}

      <Section title="Brand Info">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Your Name" required>
            <input name="name" value={profile.name} onChange={handleChange} required placeholder="Full name" className={inputCls} />
          </Field>
          <Field label="Brand Name">
            <input
              value={profile.brand_name}
              disabled
              className={inputCls}
              style={{ background: "#F9F9F9", color: "#999" }}
              title="Contact admin to change brand name"
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Email">
            <input
              value={profile.email}
              disabled
              className={inputCls}
              style={{ background: "#F9F9F9", color: "#999" }}
              title="Contact admin to change email"
            />
          </Field>
          <Field label="Phone">
            <input name="phone" value={profile.phone} onChange={handleChange} placeholder="+91 98765 43210" className={inputCls} />
          </Field>
        </div>
        <Field label="Instagram Handle">
          <input name="instagram" value={profile.instagram} onChange={handleChange} placeholder="@yourbrand" className={inputCls} />
        </Field>
      </Section>

      <Section title="Business Info">
        <Field label="GSTIN">
          <input
            name="gstin"
            value={profile.gstin}
            onChange={handleChange}
            placeholder="22AAAAA0000A1Z5"
            maxLength={15}
            className={inputCls}
            style={{ textTransform: "uppercase" }}
          />
        </Field>
      </Section>

      <Section title="Payment Details">
        <Field label="UPI ID">
          <input name="upi_id" value={profile.upi_id} onChange={handleChange} placeholder="yourname@upi" className={inputCls} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Account Holder Name">
            <input name="bank_holder" value={profile.bank_holder} onChange={handleChange} placeholder="Name on bank account" className={inputCls} />
          </Field>
          <Field label="Account Number">
            <input name="bank_account_number" value={profile.bank_account_number} onChange={handleChange} placeholder="Account number" className={inputCls} />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="IFSC Code">
            <input
              name="ifsc_code"
              value={profile.ifsc_code}
              onChange={handleChange}
              placeholder="SBIN0001234"
              maxLength={11}
              className={inputCls}
              style={{ textTransform: "uppercase" }}
            />
          </Field>
          <Field label="Bank Name">
            <input name="bank_name" value={profile.bank_name} onChange={handleChange} placeholder="State Bank of India" className={inputCls} />
          </Field>
        </div>
        <p style={{ fontSize: 12, color: "#AAAAAA" }}>
          Payouts are transferred to this bank account within 7 days of delivery.
        </p>
      </Section>
    </form>
  );
}
