"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiFetch } from "../../lib/api";
import { clearToken } from "../../lib/auth";
import type { Product } from "../../lib/types";

function Badge({ status, reason }: { status: Product["status"]; reason?: string }) {
  const map = {
    pending:  { bg: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A", label: "Pending Review" },
    approved: { bg: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0", label: "Approved" },
    rejected: { bg: "#FFF5F5", color: "#CC0000", border: "1px solid #FECACA", label: "Rejected" },
  };
  const s = map[status];
  return (
    <div>
      <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100, background: s.bg, color: s.color, border: s.border }}>
        {s.label}
      </span>
      {status === "rejected" && reason && (
        <p style={{ fontSize: 11, color: "#CC0000", marginTop: 4 }}>{reason}</p>
      )}
    </div>
  );
}

interface ProductForm {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
}

const EMPTY_FORM: ProductForm = { name: "", description: "", price: "", stock: "", category: "" };

const CATEGORIES = ["Streetwear", "Jewellery", "Rugs", "Accessories", "Other"];

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form,     setForm]     = useState<ProductForm>(EMPTY_FORM);
  const [images,   setImages]   = useState<File[]>([]);
  const [saving,   setSaving]   = useState(false);
  const [formErr,  setFormErr]  = useState("");

  const load = () => {
    setLoading(true);
    apiGet<Product[]>("/seller/products")
      .then(setProducts)
      .catch((err: Error) => {
        if (err.message === "401") { clearToken(); router.replace("/login"); }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormErr("");
    try {
      const fd = new FormData();
      fd.append("name",        form.name);
      fd.append("description", form.description);
      fd.append("price",       form.price);
      fd.append("stock",       form.stock);
      fd.append("category",    form.category);
      images.forEach(img => fd.append("images", img));

      const res = await apiFetch("/seller/products", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string; message?: string };
        throw new Error(err.error ?? err.message ?? `Error ${res.status}`);
      }
      setShowModal(false);
      setForm(EMPTY_FORM);
      setImages([]);
      load();
    } catch (err: unknown) {
      setFormErr(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const updateStock = async (id: string, newStock: number) => {
    try {
      await apiFetch(`/seller/products/${id}/stock`, {
        method: "PUT",
        body: JSON.stringify({ stock: newStock }),
      });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
    } catch { /* silent */ }
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
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111111", letterSpacing: "-0.02em" }}>Products</h1>
          <p style={{ fontSize: 14, color: "#888888", marginTop: 4 }}>{products.length} product{products.length !== 1 ? "s" : ""} listed</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
          style={{ borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", border: "none" }}
        >
          + Add Product
        </button>
      </div>

      {/* Products list */}
      {products.length === 0 ? (
        <div style={{ background: "#FFFFFF", border: "1px solid #EEEEEE", borderRadius: 14, padding: "64px 24px", textAlign: "center" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 16px", display: "block", color: "#CCCCCC" }}>
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
          <p style={{ fontSize: 15, color: "#888888", fontWeight: 600 }}>No products yet</p>
          <p style={{ fontSize: 13, color: "#CCCCCC", marginTop: 6 }}>Click &ldquo;Add Product&rdquo; to list your first product.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {products.map(p => (
            <div key={p.id} style={{ background: "#FFFFFF", border: "1px solid #EEEEEE", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Image placeholder */}
                <div style={{ width: 64, height: 64, borderRadius: 10, background: "#F5F5F5", flexShrink: 0, overflow: "hidden" }}>
                  {p.images?.[0] ? (
                    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
                    <img src={p.images[0]} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9l5-5 4 4 3-3 6 6" /></svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111111", marginBottom: 4 }}>{p.name}</h3>
                      <p style={{ fontSize: 13, color: "#888888" }}>{p.category} · ₹{p.price.toLocaleString("en-IN")}</p>
                    </div>
                    <Badge status={p.status} reason={p.rejectionReason} />
                  </div>

                  {/* Stock */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
                    <span style={{ fontSize: 12, color: "#888888" }}>Stock:</span>
                    {p.status === "approved" ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button
                          onClick={() => updateStock(p.id, Math.max(0, p.stock - 1))}
                          style={{ width: 26, height: 26, border: "1px solid #EEEEEE", borderRadius: 6, background: "#FAFAFA", cursor: "pointer", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}
                        >−</button>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#111111", minWidth: 28, textAlign: "center" }}>{p.stock}</span>
                        <button
                          onClick={() => updateStock(p.id, p.stock + 1)}
                          style={{ width: 26, height: 26, border: "1px solid #EEEEEE", borderRadius: 6, background: "#FAFAFA", cursor: "pointer", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}
                        >+</button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#111111" }}>{p.stock}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {showModal && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "28px 24px", maxWidth: 520, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111111" }}>Add Product</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>Product Name *</label>
                <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Oversized Tee" className="field-input" />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>Description *</label>
                <textarea name="description" value={form.description} onChange={handleChange} required rows={3} placeholder="Describe the product" className="field-input resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>Price (₹) *</label>
                  <input type="number" name="price" value={form.price} onChange={handleChange} required min="1" placeholder="999" className="field-input" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>Stock Qty *</label>
                  <input type="number" name="stock" value={form.stock} onChange={handleChange} required min="0" placeholder="10" className="field-input" />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>Category *</label>
                <div style={{ position: "relative" }}>
                  <select name="category" value={form.category} onChange={handleChange} required className="field-input appearance-none cursor-pointer">
                    <option value="" disabled>Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#999" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>
                  Product Images <span style={{ textTransform: "none", letterSpacing: 0, fontSize: 10, color: "#BBBBBB", fontWeight: 400 }}>(optional, up to 5)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setImages(Array.from(e.target.files ?? []).slice(0, 5))}
                  className="field-input"
                  style={{ cursor: "pointer", padding: "10px" }}
                />
                {images.length > 0 && (
                  <p style={{ fontSize: 12, color: "#888888", marginTop: 6 }}>{images.length} image{images.length > 1 ? "s" : ""} selected</p>
                )}
              </div>

              {formErr && (
                <p style={{ fontSize: 13, color: "#CC0000", padding: "10px 14px", background: "rgba(204,0,0,0.04)", border: "1px solid rgba(204,0,0,0.2)", borderRadius: 8 }}>
                  {formErr}
                </p>
              )}

              <p style={{ fontSize: 12, color: "#AAAAAA" }}>
                Product will go to admin for approval before being listed publicly.
              </p>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
                style={{ borderRadius: 10, padding: "13px", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", border: "none", opacity: saving ? 0.6 : 1 }}
              >
                {saving ? "Submitting…" : "Submit for Approval →"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
