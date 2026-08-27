"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { clearToken, getSellerId } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

const COMMISSION_RATE = 0.17;

interface ProductRow {
  id: string;
  name: string;
  description: string;
  price_inr: number;
  stock: number;
  category: string;
  images: string[] | null;
  review_status: string;
  rejection_reason: string | null;
  created_at: string;
}

interface CategoryRow {
  id: string;
  name: string;
}

interface ProductForm {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  category_name: string;
  dispatch_days: string;
}

interface VariantForm {
  name: string;
  price: string;
  stock: string;
}

interface SizeEntry {
  size: string;
  chest: string;
  length: string;
}

const EMPTY: ProductForm = { name: "", description: "", price: "", stock: "", category: "", category_name: "", dispatch_days: "2" };
const EMPTY_VARIANT: VariantForm = { name: "", price: "", stock: "" };
const DEFAULT_SIZES: SizeEntry[] = [
  { size: "XS", chest: "", length: "" },
  { size: "S",  chest: "", length: "" },
  { size: "M",  chest: "", length: "" },
  { size: "L",  chest: "", length: "" },
  { size: "XL", chest: "", length: "" },
  { size: "XXL",chest: "", length: "" },
];

function Badge({ status, reason }: { status: string; reason?: string | null }) {
  const map: Record<string, { bg: string; color: string; border: string; label: string }> = {
    pending_review: { bg: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A", label: "Pending Review" },
    approved:       { bg: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0", label: "Approved" },
    rejected:       { bg: "#FFF5F5", color: "#CC0000", border: "1px solid #FECACA", label: "Rejected" },
  };
  const s = map[status] ?? { bg: "#F5F5F5", color: "#555", border: "1px solid #EEE", label: status };
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

function showSizeChartFor(categoryName: string): boolean {
  const n = categoryName.toLowerCase();
  return n.includes("vault") || n.includes("original");
}

export default function ProductsPage() {
  const router = useRouter();
  const [products,    setProducts]    = useState<ProductRow[]>([]);
  const [categories,  setCategories]  = useState<CategoryRow[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [form,        setForm]        = useState<ProductForm>(EMPTY);
  const [images,      setImages]      = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [variants,    setVariants]    = useState<VariantForm[]>([]);
  const [sizes,       setSizes]       = useState<SizeEntry[]>(DEFAULT_SIZES);
  const [saving,      setSaving]      = useState(false);
  const [uploadStep,  setUploadStep]  = useState("");
  const [formErr,     setFormErr]     = useState("");
  const [updatingId,  setUpdatingId]  = useState<string | null>(null);

  const sellerId = getSellerId();

  const load = async () => {
    if (!sellerId) { clearToken(); router.replace("/login"); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("id, name, description, price_inr, stock, category, images, review_status, rejection_reason, created_at")
      .eq("seller_id", sellerId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error?.code === "42703") {
      const { data: d2 } = await supabase
        .from("products")
        .select("id, name, description, price_inr, stock, category, images, review_status, rejection_reason, created_at")
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false });
      setProducts((d2 ?? []) as ProductRow[]);
    } else {
      setProducts((data ?? []) as ProductRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    void (async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name")
        .eq("show_on_website", true)
        .order("name");
      if (data && data.length > 0) setCategories(data as CategoryRow[]);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "category") {
      const cat = categories.find(c => c.id === value);
      setForm(p => ({ ...p, category: value, category_name: cat?.name ?? value }));
    } else {
      setForm(p => ({ ...p, [name]: value }));
    }
  };

  const handleImagePick = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 8);
    setImages(files);
    const urls = files.map(f => URL.createObjectURL(f));
    setImagePreviews(urls);
  };

  const setMainImage = (idx: number) => {
    if (idx === 0) return;
    const newImages = [...images];
    const [img] = newImages.splice(idx, 1);
    newImages.unshift(img);
    setImages(newImages);
    const newPreviews = [...imagePreviews];
    const [prev] = newPreviews.splice(idx, 1);
    newPreviews.unshift(prev);
    setImagePreviews(newPreviews);
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const resetModal = () => {
    setShowModal(false);
    setForm(EMPTY);
    setImages([]);
    setImagePreviews([]);
    setVariants([]);
    setSizes(DEFAULT_SIZES);
    setFormErr("");
    setUploadStep("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!sellerId) return;
    setSaving(true);
    setFormErr("");

    try {
      const imageUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        setUploadStep(`Uploading image ${i + 1} of ${images.length}…`);
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${sellerId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from("products")
          .upload(path, file, { upsert: true });

        if (upErr) {
          throw new Error(`Failed to upload image "${file.name}": ${upErr.message}`);
        }

        const { data: urlData } = supabase.storage.from("products").getPublicUrl(path);
        imageUrls.push(urlData.publicUrl);
      }

      setUploadStep("Saving product…");

      const sizeChart = showSizeChartFor(form.category_name) && sizes.some(s => s.chest || s.length)
        ? sizes.filter(s => s.chest || s.length)
        : null;

      const { data: newProduct, error } = await supabase
        .from("products")
        .insert({
          name:                   form.name.trim(),
          description:            form.description.trim(),
          price_inr:              Number(form.price),
          stock:                  Number(form.stock),
          category:               form.category_name || form.category,
          dispatch_timeline_days: Number(form.dispatch_days) || 2,
          seller_id:              sellerId,
          review_status:          "pending_review",
          is_live:                false,
          images:                 imageUrls.length > 0 ? imageUrls : null,
          size_chart:             sizeChart,
          created_at:             new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error) throw new Error(error.message);

      if (newProduct?.id && variants.length > 0) {
        const validVariants = variants
          .filter(v => v.name.trim())
          .map((v, i) => ({
            product_id: newProduct.id,
            name:       v.name.trim(),
            price_inr:  v.price ? Number(v.price) : null,
            stock:      Number(v.stock) || 0,
            is_active:  true,
            sort_order: i,
          }));
        if (validVariants.length > 0) {
          await supabase.from("product_variants").insert(validVariants);
        }
      }

      resetModal();
      await load();
    } catch (err: unknown) {
      setFormErr(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
      setUploadStep("");
    }
  };

  const updateStock = async (id: string, newStock: number) => {
    if (!sellerId) return;
    setUpdatingId(id);
    await supabase.from("products").update({ stock: newStock }).eq("id", id).eq("seller_id", sellerId);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
    setUpdatingId(null);
  };

  const showSizeChart = showSizeChartFor(form.category_name || "");

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
          {products.map(p => {
            const payout = Number(p.price_inr) * (1 - COMMISSION_RATE);
            return (
              <div key={p.id} style={{ background: "#FFFFFF", border: "1px solid #EEEEEE", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div style={{ width: 64, height: 64, borderRadius: 10, background: "#F5F5F5", flexShrink: 0, overflow: "hidden" }}>
                    {p.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0]} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9l5-5 4 4 3-3 6 6" /></svg>
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111111", marginBottom: 4 }}>{p.name}</h3>
                        <p style={{ fontSize: 13, color: "#888888" }}>
                          {p.category} · MRP ₹{Number(p.price_inr).toLocaleString("en-IN")} · Payout ₹{Math.round(payout).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <Badge status={p.review_status} reason={p.rejection_reason} />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
                      <span style={{ fontSize: 12, color: "#888888" }}>Stock:</span>
                      {p.review_status === "approved" ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, opacity: updatingId === p.id ? 0.5 : 1 }}>
                          <button
                            onClick={() => updateStock(p.id, Math.max(0, p.stock - 1))}
                            disabled={updatingId === p.id}
                            style={{ width: 26, height: 26, border: "1px solid #EEEEEE", borderRadius: 6, background: "#FAFAFA", cursor: "pointer", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}
                          >−</button>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#111111", minWidth: 28, textAlign: "center" }}>{p.stock}</span>
                          <button
                            onClick={() => updateStock(p.id, p.stock + 1)}
                            disabled={updatingId === p.id}
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
            );
          })}
        </div>
      )}

      {/* Add Product Modal */}
      {showModal && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "20px 16px", overflowY: "auto" }}
          onClick={e => { if (e.target === e.currentTarget) resetModal(); }}
        >
          <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "28px 24px", maxWidth: 560, width: "100%", margin: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111111" }}>Add Product</h2>
              <button onClick={resetModal} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Name */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>Product Name *</label>
                <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Oversized Tee" className="field-input" />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>Description *</label>
                <textarea name="description" value={form.description} onChange={handleChange} required rows={3} placeholder="Describe the product" className="field-input resize-none" />
              </div>

              {/* Price / Stock */}
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

              {/* Category / Dispatch */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>Category *</label>
                  <div style={{ position: "relative" }}>
                    <select name="category" value={form.category} onChange={handleChange} required className="field-input appearance-none cursor-pointer">
                      <option value="" disabled>Select category</option>
                      {categories.length > 0
                        ? categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                        : <option value="Other">Other</option>
                      }
                    </select>
                    <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#999" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>Dispatch Days</label>
                  <input type="number" name="dispatch_days" value={form.dispatch_days} onChange={handleChange} min="1" max="14" placeholder="2" className="field-input" />
                </div>
              </div>

              {/* Images */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>
                  Product Images <span style={{ textTransform: "none", fontSize: 10, color: "#BBB", fontWeight: 400 }}>(up to 8 — first is main)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagePick}
                  className="field-input"
                  style={{ cursor: "pointer", padding: "10px" }}
                />
                {imagePreviews.length > 0 && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} style={{ position: "relative", width: 72, height: 72 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, border: idx === 0 ? "2px solid #CC0000" : "2px solid #EEE" }} />
                        {idx === 0 && (
                          <span style={{ position: "absolute", bottom: 2, left: 2, fontSize: 9, fontWeight: 700, background: "#CC0000", color: "#FFF", borderRadius: 4, padding: "1px 4px" }}>MAIN</span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          style={{ position: "absolute", top: -5, right: -5, width: 18, height: 18, borderRadius: "50%", background: "#555", color: "#FFF", border: "none", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
                          title="Remove"
                        >×</button>
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => setMainImage(idx)}
                            style={{ position: "absolute", bottom: 2, left: 2, fontSize: 9, fontWeight: 700, background: "rgba(0,0,0,0.6)", color: "#FFF", border: "none", borderRadius: 4, padding: "2px 4px", cursor: "pointer" }}
                            title="Set as main image"
                          >Set main</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Variants */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.14em" }}>
                    Variants <span style={{ textTransform: "none", fontSize: 10, color: "#BBB", fontWeight: 400 }}>(optional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setVariants(v => [...v, { ...EMPTY_VARIANT }])}
                    style={{ fontSize: 11, fontWeight: 600, color: "#CC0000", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    + Add Variant
                  </button>
                </div>
                {variants.length === 0 ? (
                  <p style={{ fontSize: 12, color: "#CCCCCC" }}>No variants — add one if your product has sizes, colors, or dimensions.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {variants.map((v, i) => (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 90px 70px 28px", gap: 6, alignItems: "center" }}>
                        <input
                          type="text"
                          placeholder="Variant name (e.g. S / Red / 4×4)"
                          value={v.name}
                          onChange={e => setVariants(prev => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                          className="field-input"
                          style={{ fontSize: 12 }}
                        />
                        <input
                          type="number"
                          placeholder="Price ₹"
                          value={v.price}
                          min="0"
                          onChange={e => setVariants(prev => prev.map((x, j) => j === i ? { ...x, price: e.target.value } : x))}
                          className="field-input"
                          style={{ fontSize: 12 }}
                          title="Leave blank to use base product price"
                        />
                        <input
                          type="number"
                          placeholder="Stock"
                          value={v.stock}
                          min="0"
                          onChange={e => setVariants(prev => prev.map((x, j) => j === i ? { ...x, stock: e.target.value } : x))}
                          className="field-input"
                          style={{ fontSize: 12 }}
                        />
                        <button
                          type="button"
                          onClick={() => setVariants(prev => prev.filter((_, j) => j !== i))}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#CCC", fontSize: 16, padding: 0 }}
                        >×</button>
                      </div>
                    ))}
                    <p style={{ fontSize: 11, color: "#AAAAAA" }}>Leave variant price blank to use the base product price at checkout.</p>
                  </div>
                )}
              </div>

              {/* Size chart (apparel only) */}
              {showSizeChart && (
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 8 }}>
                    Size Chart <span style={{ textTransform: "none", fontSize: 10, color: "#BBB", fontWeight: 400 }}>(optional)</span>
                  </label>
                  <div style={{ border: "1px solid #EEEEEE", borderRadius: 8, overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: "#F9F9F9", borderBottom: "1px solid #EEEEEE" }}>
                          <th style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#555", fontSize: 11 }}>Size</th>
                          <th style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#555", fontSize: 11 }}>Chest (in)</th>
                          <th style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#555", fontSize: 11 }}>Length (in)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sizes.map((s, i) => (
                          <tr key={s.size} style={{ borderBottom: i < sizes.length - 1 ? "1px solid #F5F5F5" : undefined }}>
                            <td style={{ padding: "6px 10px", fontWeight: 600, color: "#333" }}>{s.size}</td>
                            <td style={{ padding: "4px 8px" }}>
                              <input
                                type="text"
                                value={s.chest}
                                onChange={e => setSizes(prev => prev.map((x, j) => j === i ? { ...x, chest: e.target.value } : x))}
                                placeholder="e.g. 38"
                                style={{ width: "100%", border: "1px solid #EEE", borderRadius: 6, padding: "4px 8px", fontSize: 12, outline: "none" }}
                              />
                            </td>
                            <td style={{ padding: "4px 8px" }}>
                              <input
                                type="text"
                                value={s.length}
                                onChange={e => setSizes(prev => prev.map((x, j) => j === i ? { ...x, length: e.target.value } : x))}
                                placeholder="e.g. 28"
                                style={{ width: "100%", border: "1px solid #EEE", borderRadius: 6, padding: "4px 8px", fontSize: 12, outline: "none" }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {formErr && (
                <p style={{ fontSize: 13, color: "#CC0000", padding: "10px 14px", background: "rgba(204,0,0,0.04)", border: "1px solid rgba(204,0,0,0.2)", borderRadius: 8 }}>
                  {formErr}
                </p>
              )}

              {uploadStep && (
                <p style={{ fontSize: 13, color: "#555", padding: "10px 14px", background: "#F9F9F9", border: "1px solid #EEE", borderRadius: 8 }}>
                  {uploadStep}
                </p>
              )}

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
