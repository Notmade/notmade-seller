"use client";

import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { clearToken, getSellerId } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

interface WarehouseRow {
  id: string;
  name: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contact_name: string | null;
  contact_phone: string | null;
  is_default: boolean | null;
  courier_assigned: string | null;
  seller_arranges_shipping: boolean | null;
  created_at: string;
}

interface WarehouseForm {
  name:          string;
  address:       string;
  city:          string;
  state:         string;
  pincode:       string;
  contact_name:  string;
  contact_phone: string;
  is_default:    boolean;
}

const EMPTY: WarehouseForm = {
  name: "", address: "", city: "", state: "", pincode: "",
  contact_name: "", contact_phone: "", is_default: false,
};

const inputCls = "w-full border border-[#DDDDDD] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#CC0000] focus:ring-1 focus:ring-[#CC0000]";

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
  const [successMsg, setSuccessMsg] = useState("");
  const [editId,     setEditId]     = useState<string | null>(null);
  const [deleteId,   setDeleteId]   = useState<string | null>(null);
  const [deleting,   setDeleting]   = useState(false);

  const sellerId = getSellerId();

  const fetchWarehouses = async () => {
    const { data } = await supabase
      .from('seller_warehouses')
      .select('id, name, address, city, state, pincode, contact_name, contact_phone, is_default, courier_assigned, seller_arranges_shipping, created_at')
      .eq('seller_id', sellerId!)
      .order('created_at', { ascending: false });
    setWarehouses((data ?? []) as WarehouseRow[]);
  };

  useEffect(() => {
    if (!sellerId) { clearToken(); router.replace("/login"); return; }
    void fetchWarehouses().finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setForm(p => ({ ...p, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }));
  };

  const startEdit = (w: WarehouseRow) => {
    setEditId(w.id);
    setForm({
      name:          w.name ?? "",
      address:       w.address,
      city:          w.city,
      state:         w.state,
      pincode:       w.pincode,
      contact_name:  w.contact_name ?? "",
      contact_phone: w.contact_phone ?? "",
      is_default:    w.is_default ?? false,
    });
    setError("");
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm(EMPTY);
    setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!sellerId) return;
    setSaving(true);
    setError("");

    const payload = {
      name:          form.name.trim() || null,
      address:       form.address.trim(),
      city:          form.city.trim(),
      state:         form.state.trim(),
      pincode:       form.pincode.trim(),
      contact_name:  form.contact_name.trim() || null,
      contact_phone: form.contact_phone.trim() || null,
      is_default:    form.is_default,
    };

    if (form.is_default) {
      // clear other defaults first
      await supabase.from('seller_warehouses').update({ is_default: false }).eq('seller_id', sellerId);
    }

    if (editId) {
      const { error: err } = await supabase
        .from('seller_warehouses')
        .update(payload)
        .eq('id', editId)
        .eq('seller_id', sellerId);
      setSaving(false);
      if (err) { setError(err.message); return; }
      setEditId(null);
      setForm(EMPTY);
      await fetchWarehouses();
      flash("Warehouse updated.");
    } else {
      const { data, error: err } = await supabase
        .from('seller_warehouses')
        .insert({ ...payload, seller_id: sellerId, created_at: new Date().toISOString() })
        .select()
        .single();
      setSaving(false);
      if (err) { setError(err.message); return; }
      setWarehouses(prev => [data as WarehouseRow, ...prev]);
      setForm(EMPTY);
      flash("Warehouse added successfully.");
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    const { error: err } = await supabase
      .from('seller_warehouses')
      .delete()
      .eq('id', id)
      .eq('seller_id', sellerId!);
    setDeleting(false);
    setDeleteId(null);
    if (err) { setError(err.message); return; }
    setWarehouses(prev => prev.filter(w => w.id !== id));
    flash("Warehouse deleted.");
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
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111111", letterSpacing: "-0.02em" }}>Warehouses</h1>
        <p style={{ fontSize: 14, color: "#888888", marginTop: 4 }}>Pickup locations for your orders</p>
      </div>

      {successMsg && (
        <div style={{ marginBottom: 16, padding: "10px 14px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, fontSize: 13, color: "#166534" }}>
          {successMsg}
        </div>
      )}

      {/* Existing warehouses */}
      {warehouses.length > 0 && (
        <div style={{ marginBottom: 28, display: "flex", flexDirection: "column", gap: 10 }}>
          {warehouses.map(w => (
            editId === w.id ? (
              // Inline edit form
              <div key={w.id} style={{ background: "#FFFBEA", border: "1px solid #FCD34D", borderRadius: 14, padding: "18px 20px" }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#92400E", marginBottom: 14 }}>Editing warehouse</p>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <Field label="Name / Label">
                    <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Main Warehouse" className={inputCls} />
                  </Field>
                  <Field label="Address *">
                    <textarea name="address" value={form.address} onChange={handleChange} required rows={2} placeholder="Street address, building, floor, landmark" className={`${inputCls} resize-none`} />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Field label="City *">
                      <input name="city" value={form.city} onChange={handleChange} required placeholder="New Delhi" className={inputCls} />
                    </Field>
                    <Field label="State *">
                      <input name="state" value={form.state} onChange={handleChange} required placeholder="Delhi" className={inputCls} />
                    </Field>
                    <Field label="Pincode *">
                      <input name="pincode" value={form.pincode} onChange={handleChange} required placeholder="110001" maxLength={6} pattern="\d{6}" className={inputCls} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Contact Person">
                      <input name="contact_name" value={form.contact_name} onChange={handleChange} placeholder="Name" className={inputCls} />
                    </Field>
                    <Field label="Contact Phone">
                      <input name="contact_phone" value={form.contact_phone} onChange={handleChange} placeholder="+91 98765 43210" className={inputCls} />
                    </Field>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#333" }}>
                    <input type="checkbox" name="is_default" checked={form.is_default} onChange={handleChange} />
                    Set as default pickup address
                  </label>
                  {error && <p style={{ fontSize: 13, color: "#CC0000" }}>{error}</p>}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="submit" disabled={saving} style={{ background: "#CC0000", color: "#FFF", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                    <button type="button" onClick={cancelEdit} style={{ background: "#F5F5F5", color: "#555", border: "1px solid #DDD", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div key={w.id} style={{ background: "#FFFFFF", border: "1px solid #EEEEEE", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    {w.name && <p style={{ fontSize: 14, fontWeight: 800, color: "#111111", marginBottom: 2 }}>{w.name}</p>}
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#333333", marginBottom: 4 }}>
                      {w.city}, {w.state} — {w.pincode}
                      {w.is_default && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: "#FEF9C3", color: "#854D0E", border: "1px solid #FDE68A" }}>Default</span>}
                    </p>
                    <p style={{ fontSize: 13, color: "#555555", marginBottom: 4 }}>{w.address}</p>
                    {(w.contact_name || w.contact_phone) && (
                      <p style={{ fontSize: 12, color: "#888888" }}>
                        Contact: {w.contact_name}{w.contact_name && w.contact_phone ? " · " : ""}{w.contact_phone}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                    {w.courier_assigned ? (
                      <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100, background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0" }}>
                        Courier: {w.courier_assigned}
                      </span>
                    ) : (
                      <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100, background: "#F5F5F5", color: "#888888", border: "1px solid #EEEEEE" }}>
                        Courier pending
                      </span>
                    )}
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => startEdit(w)}
                        style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 7, border: "1px solid #DDD", background: "#F5F5F5", color: "#333", cursor: "pointer" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(w.id)}
                        style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 7, border: "1px solid rgba(204,0,0,0.25)", background: "rgba(204,0,0,0.05)", color: "#CC0000", cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Delete confirm dialog */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#FFF", borderRadius: 16, padding: 28, maxWidth: 380, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 8 }}>Delete warehouse?</p>
            <p style={{ fontSize: 13, color: "#555", marginBottom: 20 }}>This cannot be undone.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                style={{ flex: 1, background: "#CC0000", color: "#FFF", border: "none", borderRadius: 9, padding: "11px 0", fontSize: 14, fontWeight: 700, cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.6 : 1 }}
              >
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                onClick={() => setDeleteId(null)}
                style={{ flex: 1, background: "#F5F5F5", color: "#555", border: "1px solid #DDD", borderRadius: 9, padding: "11px 0", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add warehouse form */}
      {!editId && (
        <div style={{ background: "#FFFFFF", border: "1px solid #EEEEEE", borderRadius: 14, padding: "22px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111111", marginBottom: 6 }}>
            {warehouses.length === 0 ? "Add Your First Warehouse" : "Add Another Warehouse"}
          </h2>
          <p style={{ fontSize: 13, color: "#888888", marginBottom: 20 }}>
            NOTMADE arranges pickup from this address for your orders.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Name / Label">
              <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Main Warehouse, Delhi Store" className={inputCls} />
            </Field>

            <Field label="Address *">
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                rows={2}
                placeholder="Street address, building, floor, landmark"
                className={`${inputCls} resize-none`}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="City *">
                <input name="city" value={form.city} onChange={handleChange} required placeholder="New Delhi" className={inputCls} />
              </Field>
              <Field label="State *">
                <input name="state" value={form.state} onChange={handleChange} required placeholder="Delhi" className={inputCls} />
              </Field>
              <Field label="Pincode *">
                <input name="pincode" value={form.pincode} onChange={handleChange} required placeholder="110001" maxLength={6} pattern="\d{6}" className={inputCls} />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Contact Person">
                <input name="contact_name" value={form.contact_name} onChange={handleChange} placeholder="Name of person at warehouse" className={inputCls} />
              </Field>
              <Field label="Contact Phone">
                <input name="contact_phone" value={form.contact_phone} onChange={handleChange} placeholder="+91 98765 43210" className={inputCls} />
              </Field>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#333" }}>
              <input type="checkbox" name="is_default" checked={form.is_default} onChange={handleChange} />
              Set as default pickup address
            </label>

            {error && (
              <p style={{ fontSize: 13, color: "#CC0000", padding: "10px 14px", background: "rgba(204,0,0,0.04)", border: "1px solid rgba(204,0,0,0.2)", borderRadius: 8 }}>
                {error}
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
      )}
    </>
  );
}
