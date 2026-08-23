"use client";

import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { clearToken, getSellerId } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

interface WarehouseRow {
  id: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contact_name: string | null;
  contact_phone: string | null;
  courier_assigned: string | null;
  seller_arranges_shipping: boolean | null;
  created_at: string;
}

interface WarehouseForm {
  address:       string;
  city:          string;
  state:         string;
  pincode:       string;
  contact_name:  string;
  contact_phone: string;
}

const EMPTY: WarehouseForm = {
  address: "", city: "", state: "", pincode: "", contact_name: "", contact_phone: "",
};

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

export default function WarehousePage() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<WarehouseRow[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [form,       setForm]       = useState<WarehouseForm>(EMPTY);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState(false);

  const sellerId = getSellerId();

  useEffect(() => {
    if (!sellerId) { clearToken(); router.replace("/login"); return; }

    void (async () => {
      try {
        const { data } = await supabase
          .from('seller_warehouses')
          .select('id, address, city, state, pincode, contact_name, contact_phone, courier_assigned, seller_arranges_shipping, created_at')
          .eq('seller_id', sellerId)
          .order('created_at', { ascending: false });
        setWarehouses((data ?? []) as WarehouseRow[]);
      } finally {
        setLoading(false);
      }
    })();
  }, [router, sellerId]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!sellerId) return;
    setSaving(true);
    setError("");
    setSuccess(false);

    const { data, error: err } = await supabase
      .from('seller_warehouses')
      .insert({
        seller_id:     sellerId,
        address:       form.address.trim(),
        city:          form.city.trim(),
        state:         form.state.trim(),
        pincode:       form.pincode.trim(),
        contact_name:  form.contact_name.trim() || null,
        contact_phone: form.contact_phone.trim() || null,
        created_at:    new Date().toISOString(),
      })
      .select()
      .single();

    setSaving(false);
    if (err) {
      setError(err.message);
    } else {
      setWarehouses(prev => [data as WarehouseRow, ...prev]);
      setForm(EMPTY);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
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
    <>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111111", letterSpacing: "-0.02em" }}>Warehouse</h1>
        <p style={{ fontSize: 14, color: "#888888", marginTop: 4 }}>Pickup locations for your orders</p>
      </div>

      {/* Existing warehouses */}
      {warehouses.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111111", marginBottom: 12 }}>Your Warehouses ({warehouses.length})</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {warehouses.map(w => (
              <div key={w.id} style={{ background: "#FFFFFF", border: "1px solid #EEEEEE", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#111111", marginBottom: 4 }}>
                      {w.city}, {w.state} — {w.pincode}
                    </p>
                    <p style={{ fontSize: 13, color: "#555555", marginBottom: 4 }}>{w.address}</p>
                    {(w.contact_name || w.contact_phone) && (
                      <p style={{ fontSize: 12, color: "#888888" }}>
                        Contact: {w.contact_name}{w.contact_name && w.contact_phone ? " · " : ""}{w.contact_phone}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {w.courier_assigned ? (
                      <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100, background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0" }}>
                        Courier: {w.courier_assigned}
                      </span>
                    ) : (
                      <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100, background: "#F5F5F5", color: "#888888", border: "1px solid #EEEEEE" }}>
                        Courier pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add warehouse form */}
      <div style={{ background: "#FFFFFF", border: "1px solid #EEEEEE", borderRadius: 14, padding: "22px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111111", marginBottom: 6 }}>
          {warehouses.length === 0 ? "Add Your First Warehouse" : "Add Another Warehouse"}
        </h2>
        <p style={{ fontSize: 13, color: "#888888", marginBottom: 20 }}>
          NOTMADE arranges pickup from this address for your orders.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <Field label="Address *">
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                rows={2}
                placeholder="Street address, building, floor, landmark"
                className="field-input resize-none"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="City *">
              <input name="city" value={form.city} onChange={handleChange} required placeholder="New Delhi" className="field-input" />
            </Field>
            <Field label="State *">
              <input name="state" value={form.state} onChange={handleChange} required placeholder="Delhi" className="field-input" />
            </Field>
            <Field label="Pincode *">
              <input name="pincode" value={form.pincode} onChange={handleChange} required placeholder="110001" maxLength={6} pattern="\d{6}" className="field-input" />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Contact Person">
              <input name="contact_name" value={form.contact_name} onChange={handleChange} placeholder="Name of person at warehouse" className="field-input" />
            </Field>
            <Field label="Contact Phone">
              <input name="contact_phone" value={form.contact_phone} onChange={handleChange} placeholder="+91 98765 43210" className="field-input" />
            </Field>
          </div>

          {error && (
            <p style={{ fontSize: 13, color: "#CC0000", padding: "10px 14px", background: "rgba(204,0,0,0.04)", border: "1px solid rgba(204,0,0,0.2)", borderRadius: 8 }}>
              {error}
            </p>
          )}

          {success && (
            <p style={{ fontSize: 13, color: "#166534", padding: "10px 14px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8 }}>
              ✓ Warehouse added successfully. NOTMADE will assign a courier partner soon.
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
            style={{ borderRadius: 10, padding: "13px 28px", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", border: "none", opacity: saving ? 0.6 : 1, alignSelf: "flex-start" }}
          >
            {saving ? "Adding…" : "Add Warehouse →"}
          </button>
        </form>
      </div>
    </>
  );
}
