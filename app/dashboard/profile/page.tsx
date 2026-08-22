"use client";

import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPut } from "../../lib/api";
import { clearToken } from "../../lib/auth";
import type { SellerProfile } from "../../lib/types";

interface ProfileForm {
  name:              string;
  phone:             string;
  brandName:         string;
  category:          string;
  instagram:         string;
  gstin:             string;
  upiId:             string;
  bankHolder:        string;
  bankNumber:        string;
  ifsc:              string;
  bankName:          string;
  warehouseAddress:  string;
  warehouseCity:     string;
  warehouseState:    string;
  warehousePincode:  string;
  warehouseContact:  string;
  warehousePhone:    string;
}

const EMPTY: ProfileForm = {
  name: "", phone: "", brandName: "", category: "", instagram: "",
  gstin: "", upiId: "", bankHolder: "", bankNumber: "", ifsc: "", bankName: "",
  warehouseAddress: "", warehouseCity: "", warehouseState: "", warehousePincode: "",
  warehouseContact: "", warehousePhone: "",
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
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState("");
  const [form,     setForm]     = useState<ProfileForm>(EMPTY);
  const [email,    setEmail]    = useState("");
  const [status,   setStatus]   = useState<SellerProfile["status"]>("pending");

  useEffect(() => {
    apiGet<SellerProfile>("/seller/profile")
      .then(p => {
        setEmail(p.email);
        setStatus(p.status);
        setForm({
          name:             p.name             ?? "",
          phone:            p.phone            ?? "",
          brandName:        p.brandName        ?? "",
          category:         p.category         ?? "",
          instagram:        p.instagram        ?? "",
          gstin:            p.gstin            ?? "",
          upiId:            p.upiId            ?? "",
          bankHolder:       p.bankHolder       ?? "",
          bankNumber:       p.bankNumber       ?? "",
          ifsc:             p.ifsc             ?? "",
          bankName:         p.bankName         ?? "",
          warehouseAddress: p.warehouseAddress ?? "",
          warehouseCity:    p.warehouseCity    ?? "",
          warehouseState:   p.warehouseState   ?? "",
          warehousePincode: p.warehousePincode ?? "",
          warehouseContact: p.warehouseContact ?? "",
          warehousePhone:   p.warehousePhone   ?? "",
        });
      })
      .catch((err: Error) => {
        if (err.message === "401") { clearToken(); router.replace("/login"); }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await apiPut("/seller/profile", {
        name:              form.name,
        phone:             form.phone,
        brand_name:        form.brandName,
        category:          form.category,
        instagram:         form.instagram  || undefined,
        gstin:             form.gstin      || undefined,
        upi_id:            form.upiId      || undefined,
        bank_holder:       form.bankHolder || undefined,
        bank_number:       form.bankNumber || undefined,
        ifsc:              form.ifsc       || undefined,
        bank_name:         form.bankName   || undefined,
        warehouse_address: form.warehouseAddress || undefined,
        warehouse_city:    form.warehouseCity    || undefined,
        warehouse_state:   form.warehouseState   || undefined,
        warehouse_pincode: form.warehousePincode || undefined,
        warehouse_contact: form.warehouseContact || undefined,
        warehouse_phone:   form.warehousePhone   || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const statusColors = {
    pending:   { bg: "#FFFBEB", color: "#B45309", label: "Pending Approval" },
    active:    { bg: "#F0FDF4", color: "#166534", label: "Active" },
    suspended: { bg: "#FFF5F5", color: "#CC0000", label: "Suspended" },
  };
  const sc = statusColors[status];

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
            <Field label="Phone *">
              <input name="phone" value={form.phone} onChange={handleChange} required placeholder="+91 98765 43210" className="field-input" />
            </Field>
            <Field label="Instagram">
              <input name="instagram" value={form.instagram} onChange={handleChange} placeholder="@yourbrand" className="field-input" />
            </Field>
            <Field label="Brand Name *">
              <input name="brandName" value={form.brandName} onChange={handleChange} required placeholder="Brand name" className="field-input" />
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
              <input name="bankHolder" value={form.bankHolder} onChange={handleChange} placeholder="As per bank records" className="field-input" />
            </Field>
            <Field label="Bank Name">
              <input name="bankName" value={form.bankName} onChange={handleChange} placeholder="e.g. HDFC Bank" className="field-input" />
            </Field>
            <Field label="Account Number">
              <input name="bankNumber" value={form.bankNumber} onChange={handleChange} placeholder="Account number" className="field-input" />
            </Field>
            <Field label="IFSC Code">
              <input name="ifsc" value={form.ifsc} onChange={handleChange} placeholder="e.g. HDFC0001234" className="field-input" style={{ textTransform: "uppercase" }} />
            </Field>
          </div>
        </SectionCard>

        {/* Financial */}
        <SectionCard title="Tax & UPI">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="GSTIN">
              <input name="gstin" value={form.gstin} onChange={handleChange} placeholder="22AAAAA0000A1Z5" className="field-input" style={{ textTransform: "uppercase" }} />
            </Field>
            <Field label="UPI ID">
              <input name="upiId" value={form.upiId} onChange={handleChange} placeholder="yourname@upi" className="field-input" />
            </Field>
          </div>
        </SectionCard>

        {/* Warehouse */}
        <SectionCard title="Pickup Warehouse">
          <p style={{ fontSize: 13, color: "#888888", marginBottom: 16 }}>
            NOTMADE will arrange pickup from this address for your orders.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Address">
                <textarea name="warehouseAddress" value={form.warehouseAddress} onChange={handleChange} rows={2} placeholder="Street address, building, floor" className="field-input resize-none" />
              </Field>
            </div>
            <Field label="City">
              <input name="warehouseCity" value={form.warehouseCity} onChange={handleChange} placeholder="New Delhi" className="field-input" />
            </Field>
            <Field label="State">
              <input name="warehouseState" value={form.warehouseState} onChange={handleChange} placeholder="Delhi" className="field-input" />
            </Field>
            <Field label="Pincode">
              <input name="warehousePincode" value={form.warehousePincode} onChange={handleChange} placeholder="110001" maxLength={6} className="field-input" />
            </Field>
            <Field label="Contact Person">
              <input name="warehouseContact" value={form.warehouseContact} onChange={handleChange} placeholder="Name of person at warehouse" className="field-input" />
            </Field>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Contact Phone">
                <input name="warehousePhone" value={form.warehousePhone} onChange={handleChange} placeholder="+91 98765 43210" className="field-input" />
              </Field>
            </div>
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
